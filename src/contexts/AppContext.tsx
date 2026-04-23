import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { UserProfile, SleepLog, AppContextType, SleepQualityMetrics } from '../types/user';
import { submitOnboarding, submitSleepLog, getSyncQueue, getGlobalSleepQualityAverage } from '../services/api';
import { calculateSleepQualityMetrics } from '../utils/sleepQualityCalculations';
import {
  requestNotificationPermissions,
  rescheduleAllNotifications,
  cancelAllNotifications,
} from '../services/notificationService';

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_DATA: '@app_user_data',
  SLEEP_LOGS: '@app_sleep_logs',
  IS_ONBOARDED: '@app_is_onboarded',
  SYNC_QUEUE: '@app_sync_queue',
  GLOBAL_QUALITY_AVG: '@app_global_quality_avg',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [syncQueue, setSyncQueue] = useState<SleepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalQualityAverage, setGlobalQualityAverage] = useState(7.2);
  
  // Notification state
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [currentNotificationType, setCurrentNotificationType] = useState<'bed_reminder' | 'wake_reminder' | null>(null);

  // ===== Load Data on App Start =====
  useEffect(() => {
    loadUserData();
    loadGlobalMetrics();
    initializeNotifications();
  }, []);

  // ===== Auto-sync pending items every 30 seconds =====
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncQueue.length > 0) {
        syncWithBackend();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [syncQueue]);

  // ===== Load all persisted data =====
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [onboardedStr, userData, sleepLogsStr, queueStr, globalAvgStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP_LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE),
        AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_QUALITY_AVG),
      ]);

      if (onboardedStr === 'true') {
        setIsOnboarded(true);
      }

      if (userData) {
        setUserData(JSON.parse(userData));
      }

      if (sleepLogsStr) {
        setSleepLogs(JSON.parse(sleepLogsStr));
      }

      if (queueStr) {
        setSyncQueue(JSON.parse(queueStr));
      }

      if (globalAvgStr) {
        setGlobalQualityAverage(JSON.parse(globalAvgStr));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Load global quality metrics =====
  const loadGlobalMetrics = async () => {
    try {
      const average = await getGlobalSleepQualityAverage();
      setGlobalQualityAverage(average);
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_QUALITY_AVG, JSON.stringify(average));
    } catch (error) {
      console.error('Error loading global metrics:', error);
    }
  };

  // ===== Initialize Notifications =====
  const initializeNotifications = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        console.log('[AppContext] Notifications initialized');
        console.log('[AppContext] ⚠️ Note: Using Expo Go with limited notification features. For full functionality, use development build.');
      }
    } catch (error) {
      console.warn('[AppContext] Notifications may have limited features in Expo Go:', error);
    }
  };

  // ===== Open notification modal =====
  const showNotificationModal = (type: 'bed_reminder' | 'wake_reminder') => {
    setCurrentNotificationType(type);
    setNotificationModalVisible(true);
  };

  // ===== Close notification modal =====
  const closeNotificationModal = () => {
    setNotificationModalVisible(false);
    setCurrentNotificationType(null);
  };

  // ===== Get calculated sleep quality metrics =====
  const userQualityStats = (): SleepQualityMetrics => {
    return calculateSleepQualityMetrics(sleepLogs, globalQualityAverage, 7);
  };

  // ===== Save onboarding status =====
  const setOnboarded = async (value: boolean) => {
    try {
      setIsOnboarded(value);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, String(value));
    } catch (error) {
      console.error('Error saving onboarded status:', error);
    }
  };

  // ===== Update user profile (from questionnaire/settings) =====
  const updateUserData = async (data: UserProfile) => {
    try {
      setUserData(data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));

      // Schedule notifications for sleep reminders
      try {
        await rescheduleAllNotifications(data.bedTime, data.wakeTime);
        console.log('[AppContext] Notifications scheduled for bed/wake times');
      } catch (err) {
        console.warn('[AppContext] Could not schedule notifications:', err);
      }

      // Attempt to sync immediately
      try {
        await submitOnboarding(data);
      } catch (err) {
        console.warn('Could not submit onboarding online, will retry later:', err);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // ===== Add new sleep log (with offline support) =====
  const addSleepLog = async (log: SleepLog) => {
    try {
      const newLog: SleepLog = {
        ...log,
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        syncStatus: 'pending',
      };

      const updated = [newLog, ...sleepLogs];
      setSleepLogs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Add to sync queue
      const updated_queue = [newLog, ...syncQueue];
      setSyncQueue(updated_queue);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updated_queue));

      // Try sync immediately
      await syncWithBackend();
    } catch (error) {
      console.error('Error adding sleep log:', error);
    }
  };

  // ===== Update existing sleep log =====
  const updateSleepLog = async (id: string, partial: Partial<SleepLog>) => {
    try {
      const updated = sleepLogs.map(log =>
        log.id === id ? { ...log, ...partial, syncStatus: 'pending' as const } : log
      );
      setSleepLogs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Schedule resync
      const queueItem = updated.find(l => l.id === id);
      if (queueItem) {
        const toQueue = syncQueue.some(l => l.id === id)
          ? syncQueue.map(l => (l.id === id ? queueItem : l))
          : [queueItem, ...syncQueue];
        setSyncQueue(toQueue);
        await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(toQueue));
      }

      await syncWithBackend();
    } catch (error) {
      console.error('Error updating sleep log:', error);
    }
  };

  // ===== Delete sleep log =====
  const deleteSleepLog = async (id: string) => {
    try {
      const updated = sleepLogs.filter(log => log.id !== id);
      setSleepLogs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Remove from queue
      const queueUpdated = syncQueue.filter(log => log.id !== id);
      setSyncQueue(queueUpdated);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queueUpdated));
    } catch (error) {
      console.error('Error deleting sleep log:', error);
    }
  };

  // ===== Sync pending items with backend (retry logic) =====
  const syncWithBackend = async () => {
    if (syncQueue.length === 0) return;

    try {
      for (const log of syncQueue) {
        try {
          await submitSleepLog(log);
          // Mark as synced locally
          const updated = sleepLogs.map(l =>
            l.id === log.id ? { ...l, syncStatus: 'synced' as const } : l
          );
          setSleepLogs(updated);
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

          // Remove from queue
          const queueUpdated = syncQueue.filter(l => l.id !== log.id);
          setSyncQueue(queueUpdated);
          await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queueUpdated));
        } catch (err) {
          console.warn(`Failed to sync log ${log.id}, will retry:`, err);
          // Keep in queue, will retry next interval
        }
      }
    } catch (error) {
      console.error('Error during sync:', error);
    }
  };

  // ===== Clear all user data (logout) =====
  const clearAllData = async () => {
    try {
      setIsOnboarded(false);
      setUserData(null);
      setSleepLogs([]);
      setSyncQueue([]);
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.IS_ONBOARDED),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_LOGS),
        AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
        AsyncStorage.removeItem(STORAGE_KEYS.GLOBAL_QUALITY_AVG),
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        userData,
        sleepLogs,
        isLoading,
        syncQueue,
        globalQualityAverage,
        notificationModalVisible,
        currentNotificationType,
        setOnboarded,
        updateUserData,
        addSleepLog,
        updateSleepLog,
        deleteSleepLog,
        syncWithBackend,
        loadUserData,
        loadGlobalMetrics,
        userQualityStats,
        clearAllData,
        showNotificationModal,
        closeNotificationModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
