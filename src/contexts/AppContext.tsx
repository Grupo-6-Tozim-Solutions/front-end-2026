import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  UserProfile,
  SleepLog,
  AppContextType,
  SleepQualityMetrics,
} from '../types/user';
import {
  submitOnboarding,
  submitSleepLog,
  getGlobalSleepQualityAverage,
} from '../services/api';
import { calculateSleepQualityMetrics } from '../utils/sleepQualityCalculations';
import {
  requestNotificationPermissions,
  rescheduleAllNotifications,
  cancelAllNotifications,
} from '../services/notificationService';
import {
  appEnvironment,
  isDevelopmentEnvironment,
  isNotificationsEnabled,
  isWebPlatform,
} from '../config/environment';
import { appStorage } from '../services/appStorage';

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_DATA: '@app_user_data',
  SLEEP_LOGS: '@app_sleep_logs',
  IS_ONBOARDED: '@app_is_onboarded',
  SYNC_QUEUE: '@app_sync_queue',
  GLOBAL_QUALITY_AVG: '@app_global_quality_avg',
};

const parseStoredValue = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('[AppContext] Ignoring invalid persisted value:', error);
    return fallback;
  }
};

const PRESENTATION_SLEEP_LOG_COUNT = 14;

const presentationSleepLogTemplate = [
  { hoursSlept: '5.0', bedTimeActual: '00:20', wakeTimeActual: '05:20', quality: '5', notes: 'Sono curto e pouco reparador.' },
  { hoursSlept: '5.4', bedTimeActual: '00:05', wakeTimeActual: '05:29', quality: '5', notes: 'Acordei cansado.' },
  { hoursSlept: '5.8', bedTimeActual: '23:50', wakeTimeActual: '05:38', quality: '6', notes: 'Noite regular.' },
  { hoursSlept: '6.1', bedTimeActual: '23:40', wakeTimeActual: '05:46', quality: '6', notes: 'Leve melhora na rotina.' },
  { hoursSlept: '6.5', bedTimeActual: '23:30', wakeTimeActual: '06:00', quality: '6', notes: 'Ainda acordei um pouco cansado.' },
  { hoursSlept: '6.8', bedTimeActual: '23:20', wakeTimeActual: '06:08', quality: '7', notes: 'Sono mais estavel.' },
  { hoursSlept: '7.0', bedTimeActual: '23:10', wakeTimeActual: '06:10', quality: '7', notes: 'Boa recuperacao.' },
  { hoursSlept: '6.6', bedTimeActual: '23:45', wakeTimeActual: '06:21', quality: '6', notes: 'Demorei para dormir.' },
  { hoursSlept: '7.2', bedTimeActual: '23:05', wakeTimeActual: '06:17', quality: '7', notes: 'Rotina voltando ao normal.' },
  { hoursSlept: '7.5', bedTimeActual: '22:55', wakeTimeActual: '06:25', quality: '8', notes: 'Sono mais profundo.' },
  { hoursSlept: '7.7', bedTimeActual: '22:50', wakeTimeActual: '06:32', quality: '8', notes: 'Acordei disposto.' },
  { hoursSlept: '8.0', bedTimeActual: '22:45', wakeTimeActual: '06:45', quality: '9', notes: 'Excelente noite.' },
  { hoursSlept: '7.4', bedTimeActual: '23:00', wakeTimeActual: '06:24', quality: '8', notes: 'Boa consistencia.' },
  { hoursSlept: '8.1', bedTimeActual: '22:40', wakeTimeActual: '06:46', quality: '9', notes: 'Melhor noite da sequencia.' },
] as const;

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createPresentationSleepLogs = (): SleepLog[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return presentationSleepLogTemplate.map((template, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (PRESENTATION_SLEEP_LOG_COUNT - 1 - index));
    const dateKey = formatDateKey(date);

    return {
      id: `presentation_sleep_${dateKey}`,
      date: dateKey,
      timestamp: date.getTime(),
      syncStatus: 'synced' as const,
      ...template,
    };
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [syncQueue, setSyncQueue] = useState<SleepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [currentNotificationType, setCurrentNotificationType] = useState<
    'bed_reminder' | 'wake_reminder' | null
  >(null);

  const [globalQualityAverage, setGlobalQualityAverage] = useState(0);

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
  const readPersistedAppData = async () => {
    const [onboardedStr, userDataStr, sleepLogsStr, queueStr, globalAvgStr] =
      await Promise.all([
        appStorage.getItem(STORAGE_KEYS.IS_ONBOARDED),
        appStorage.getItem(STORAGE_KEYS.USER_DATA),
        appStorage.getItem(STORAGE_KEYS.SLEEP_LOGS),
        appStorage.getItem(STORAGE_KEYS.SYNC_QUEUE),
        appStorage.getItem(STORAGE_KEYS.GLOBAL_QUALITY_AVG),
      ]);

    return {
      isOnboarded: onboardedStr === 'true',
      userData: parseStoredValue<UserProfile | null>(userDataStr, null),
      sleepLogs: parseStoredValue<SleepLog[]>(sleepLogsStr, []),
      syncQueue: parseStoredValue<SleepLog[]>(queueStr, []),
      globalQualityAverage: parseStoredValue<number>(globalAvgStr, 0),
    };
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const persistedData = await readPersistedAppData();
      const seededSleepLogs = persistedData.isOnboarded
        ? await seedPresentationSleepLogsIfNeeded(persistedData.sleepLogs)
        : persistedData.sleepLogs;

      setIsOnboarded(persistedData.isOnboarded);
      setUserData(persistedData.userData);
      setSleepLogs(seededSleepLogs);
      setSyncQueue(persistedData.syncQueue);
      setGlobalQualityAverage(persistedData.globalQualityAverage);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersistedAppData = async () => {
    try {
      const persistedData = await readPersistedAppData();

      return {
        isOnboarded: persistedData.isOnboarded || isOnboarded,
        userData: persistedData.userData ?? userData,
        sleepLogs: persistedData.sleepLogs.length ? persistedData.sleepLogs : sleepLogs,
        syncQueue: persistedData.syncQueue.length ? persistedData.syncQueue : syncQueue,
        globalQualityAverage: persistedData.globalQualityAverage || globalQualityAverage,
      };
    } catch (error) {
      console.error('Error reading persisted app data:', error);

      return {
        isOnboarded,
        userData,
        sleepLogs,
        syncQueue,
        globalQualityAverage,
      };
    }
  };

  const seedPresentationSleepLogsIfNeeded = async (currentLogs: SleepLog[]) => {
    if (currentLogs.length >= PRESENTATION_SLEEP_LOG_COUNT) {
      return currentLogs;
    }

    const existingDates = new Set(currentLogs.map((log) => log.date));
    const presentationLogs = createPresentationSleepLogs().filter(
      (log) => !existingDates.has(log.date),
    );

    if (!presentationLogs.length) {
      return currentLogs;
    }

    const updatedLogs = [...presentationLogs, ...currentLogs].sort(
      (left, right) => right.timestamp - left.timestamp,
    );

    await appStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updatedLogs));
    setSleepLogs(updatedLogs);

    return updatedLogs;
  };

  // ===== Load global quality metrics =====
  const loadGlobalMetrics = async () => {
    try {
      const average = await getGlobalSleepQualityAverage();
      setGlobalQualityAverage(average);
      await appStorage.setItem(
        STORAGE_KEYS.GLOBAL_QUALITY_AVG,
        JSON.stringify(average)
      );
    } catch (error) {
      console.error('Error loading global metrics:', error);
    }
  };

  // ===== Initialize Notifications =====
  const initializeNotifications = async () => {
    if (!isNotificationsEnabled) {
      console.log(
        `[AppContext] Notifications disabled (env=${appEnvironment}, web=${isWebPlatform}).`
      );
      return;
    }

    try {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        console.log('[AppContext] Notifications initialized');
      }
    } catch (error) {
      console.warn('[AppContext] Could not initialize notifications:', error);
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
      await appStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, String(value));

      if (value) {
        await seedPresentationSleepLogsIfNeeded(sleepLogs);
      }
    } catch (error) {
      console.error('Error saving onboarded status:', error);
    }
  };

  // ===== Update user profile (from questionnaire/settings) =====
  const updateUserData = async (data: UserProfile) => {
    try {
      setUserData(data);
      await appStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));

      if (isNotificationsEnabled) {
        // Schedule notifications for sleep reminders
        try {
          await rescheduleAllNotifications(data.bedTime, data.wakeTime);
          console.log('[AppContext] Notifications scheduled for bed/wake times');
        } catch (err) {
          console.warn('[AppContext] Could not schedule notifications:', err);
        }
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
      await appStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Add to sync queue
      const updatedQueue = [newLog, ...syncQueue];
      setSyncQueue(updatedQueue);
      await appStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(updatedQueue)
      );

      // Try sync immediately
      await syncWithBackend(updatedQueue, updated);
    } catch (error) {
      console.error('Error adding sleep log:', error);
    }
  };

  // ===== Update existing sleep log =====
  const updateSleepLog = async (id: string, partial: Partial<SleepLog>) => {
    try {
      const updated = sleepLogs.map((log) =>
        log.id === id
          ? { ...log, ...partial, syncStatus: 'pending' as const }
          : log
      );
      setSleepLogs(updated);
      await appStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Schedule resync
      const queueItem = updated.find((log) => log.id === id);
      let toQueue = syncQueue;
      if (queueItem) {
        toQueue = syncQueue.some((log) => log.id === id)
          ? syncQueue.map((log) => (log.id === id ? queueItem : log))
          : [queueItem, ...syncQueue];
        setSyncQueue(toQueue);
        await appStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(toQueue));
      }

      await syncWithBackend(toQueue, updated);
    } catch (error) {
      console.error('Error updating sleep log:', error);
    }
  };

  // ===== Delete sleep log =====
  const deleteSleepLog = async (id: string) => {
    try {
      const updated = sleepLogs.filter((log) => log.id !== id);
      setSleepLogs(updated);
      await appStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));

      // Remove from queue
      const queueUpdated = syncQueue.filter((log) => log.id !== id);
      setSyncQueue(queueUpdated);
      await appStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(queueUpdated)
      );
    } catch (error) {
      console.error('Error deleting sleep log:', error);
    }
  };

  // ===== Sync pending items with backend (retry logic) =====
  const syncWithBackend = async (
    queueOverride?: SleepLog[],
    sleepLogsOverride?: SleepLog[],
  ) => {
    const queueToProcess = queueOverride ?? syncQueue;

    if (queueToProcess.length === 0) {
      return;
    }

    try {
      let latestLogs = sleepLogsOverride ?? sleepLogs;
      let remainingQueue = queueToProcess;

      for (const log of queueToProcess) {
        try {
          await submitSleepLog(log);

          // Mark as synced locally
          latestLogs = latestLogs.map((item) =>
            item.id === log.id ? { ...item, syncStatus: 'synced' as const } : item
          );
          setSleepLogs(latestLogs);
          await appStorage.setItem(
            STORAGE_KEYS.SLEEP_LOGS,
            JSON.stringify(latestLogs)
          );

          // Remove from queue
          remainingQueue = remainingQueue.filter((item) => item.id !== log.id);
          setSyncQueue(remainingQueue);
          await appStorage.setItem(
            STORAGE_KEYS.SYNC_QUEUE,
            JSON.stringify(remainingQueue)
          );
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

      if (isNotificationsEnabled) {
        await cancelAllNotifications();
      }

      await Promise.all([
        appStorage.removeItem(STORAGE_KEYS.IS_ONBOARDED),
        appStorage.removeItem(STORAGE_KEYS.USER_DATA),
        appStorage.removeItem(STORAGE_KEYS.SLEEP_LOGS),
        appStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
        appStorage.removeItem(STORAGE_KEYS.GLOBAL_QUALITY_AVG),
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
        getPersistedAppData,
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
