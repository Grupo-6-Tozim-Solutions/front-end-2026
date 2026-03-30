import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, SleepLog, AppContextType } from '../types/user';
import { submitOnboarding, submitSleepLog, getSyncQueue } from '../services/api';

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_DATA: '@app_user_data',
  SLEEP_LOGS: '@app_sleep_logs',
  IS_ONBOARDED: '@app_is_onboarded',
  SYNC_QUEUE: '@app_sync_queue',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [syncQueue, setSyncQueue] = useState<SleepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ===== Load Data on App Start =====
  useEffect(() => {
    loadUserData();
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
      const [onboardedStr, userData, sleepLogsStr, queueStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP_LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE),
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
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
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
        setOnboarded,
        updateUserData,
        addSleepLog,
        updateSleepLog,
        deleteSleepLog,
        syncWithBackend,
        loadUserData,
        clearAllData,
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
