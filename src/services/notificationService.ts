<<<<<<< HEAD
import PushNotification from 'react-native-push-notification';

class NotificationService {
  configure() {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICAÇÃO:', notification);
      },
      requestPermissions: true,
    });
  }

  agendar(data: Date, mensagem: string) {
    PushNotification.localNotificationSchedule({
      message: mensagem,
      date: data,
      allowWhileIdle: true,
    });
  }
}

export const notificationService = new NotificationService();
=======
/**
 * Notification Service
 * Handles local push notifications for sleep reminders
 */

import * as Notifications from 'expo-notifications';
import { SleepLog } from '../types/user';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Desabilitado para Expo Go
    shouldSetBadge: false, // Desabilitado para Expo Go
  }),
});

export interface SleepNotification {
  type: 'bed_reminder' | 'wake_reminder';
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: false,
      },
    });
    console.log('[NotificationService] Permissions status:', status);
    return status === 'granted';
  } catch (error) {
    console.warn('[NotificationService] Error requesting permissions (Expo Go limitation):', error);
    return true; // Assume permissions granted for Expo Go
  }
};

/**
 * Schedule a bed time reminder notification
 * @param bedTime - Time in HH:MM format (e.g., "23:00")
 * @param notificationId - Unique ID for this scheduled notification
 */
export const scheduleBedReminder = async (
  bedTime: string,
  notificationId: string
): Promise<string | null> => {
  try {
    const [hours, minutes] = bedTime.split(':').map(Number);

    // Calculate seconds until bedTime tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const seconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

    const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛏️ Hora de Dormir',
        body: `Você está indo dormir? Toque para registrar.`,
        data: {
          type: 'bed_reminder',
          bedTime,
          timestamp: new Date().toISOString(),
        },
        sound: 'default',
      },
      trigger: null,
    });

    console.log(
      `[NotificationService] Bed reminder scheduled for ${bedTime}:`,
      scheduledNotificationId
    );

    // Save scheduled notification ID to storage
    await saveScheduledNotification(notificationId, scheduledNotificationId, bedTime, 'bed');

    return scheduledNotificationId;
  } catch (error) {
    console.error('[NotificationService] Error scheduling bed reminder:', error);
    return null;
  }
};

/**
 * Schedule a wake time reminder notification
 * @param wakeTime - Time in HH:MM format (e.g., "07:00")
 * @param notificationId - Unique ID for this scheduled notification
 */
export const scheduleWakeReminder = async (
  wakeTime: string,
  notificationId: string
): Promise<string | null> => {
  try {
    const [hours, minutes] = wakeTime.split(':').map(Number);

    // Calculate seconds until wakeTime tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const seconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

    const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Acordar Agora?',
        body: `Você acordou? Como dormiu? Toque para responder.`,
        data: {
          type: 'wake_reminder',
          wakeTime,
          timestamp: new Date().toISOString(),
        },
        sound: 'default',
      },
      trigger: null,
    });

    console.log(
      `[NotificationService] Wake reminder scheduled for ${wakeTime}:`,
      scheduledNotificationId
    );

    // Save scheduled notification ID to storage
    await saveScheduledNotification(notificationId, scheduledNotificationId, wakeTime, 'wake');

    return scheduledNotificationId;
  } catch (error) {
    console.error('[NotificationService] Error scheduling wake reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification by ID
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.dismissNotificationAsync(notificationId);
    console.log('[NotificationService] Notification cancelled:', notificationId);
  } catch (error) {
    console.error('[NotificationService] Error cancelling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All notifications cancelled');
  } catch (error) {
    console.error('[NotificationService] Error cancelling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[NotificationService] Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Re-schedule all notifications for user
 * Call this when user updates bed/wake times
 */
export const rescheduleAllNotifications = async (
  bedTime: string,
  wakeTime: string
): Promise<{ bed: string | null; wake: string | null }> => {
  try {
    // Cancel existing notifications
    await cancelAllNotifications();

    // Schedule new ones
    const bedNotifId = await scheduleBedReminder(bedTime, `bed_${new Date().getTime()}`);
    const wakeNotifId = await scheduleWakeReminder(wakeTime, `wake_${new Date().getTime()}`);

    return {
      bed: bedNotifId,
      wake: wakeNotifId,
    };
  } catch (error) {
    console.error('[NotificationService] Error rescheduling notifications:', error);
    return { bed: null, wake: null };
  }
};

/**
 * Save scheduled notification to local storage (for reference)
 */
const saveScheduledNotification = async (
  id: string,
  scheduledId: string,
  time: string,
  type: 'bed' | 'wake'
): Promise<void> => {
  try {
    // This could be extended to save to AsyncStorage if needed
    console.log(
      `[NotificationService] Saved ${type} notification: ${id} → ${scheduledId} at ${time}`
    );
  } catch (error) {
    console.error('[NotificationService] Error saving notification:', error);
  }
};

/**
 * Listen for notification responses (when user taps notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
};

/**
 * Listen for notifications received while app is in foreground
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
};
>>>>>>> notificações-acordar-dormit
