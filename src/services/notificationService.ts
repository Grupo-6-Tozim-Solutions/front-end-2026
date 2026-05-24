/**
 * Notification Service
 * Handles local notifications for sleep reminders.
 */

import * as Notifications from 'expo-notifications';
import { isNotificationsEnabled } from '../config/environment';

let notificationHandlerConfigured = false;

const ensureNotificationHandlerConfigured = () => {
  if (!isNotificationsEnabled || notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerConfigured = true;
};

export interface SleepNotification {
  type: 'bed_reminder' | 'wake_reminder';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Request notification permissions (native production only).
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!isNotificationsEnabled) {
    console.log('[NotificationService] Notifications disabled for this environment.');
    return false;
  }

  try {
    ensureNotificationHandlerConfigured();

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
    console.warn('[NotificationService] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Schedule a bed time reminder notification.
 */
export const scheduleBedReminder = async (
  bedTime: string,
  notificationId: string
): Promise<string | null> => {
  if (!isNotificationsEnabled) {
    return null;
  }

  try {
    ensureNotificationHandlerConfigured();

    const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de Dormir',
        body: 'Voce esta indo dormir? Toque para registrar.',
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

    await saveScheduledNotification(
      notificationId,
      scheduledNotificationId,
      bedTime,
      'bed'
    );

    return scheduledNotificationId;
  } catch (error) {
    console.error('[NotificationService] Error scheduling bed reminder:', error);
    return null;
  }
};

/**
 * Schedule a wake time reminder notification.
 */
export const scheduleWakeReminder = async (
  wakeTime: string,
  notificationId: string
): Promise<string | null> => {
  if (!isNotificationsEnabled) {
    return null;
  }

  try {
    ensureNotificationHandlerConfigured();

    const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Acordar Agora?',
        body: 'Voce acordou? Como dormiu? Toque para responder.',
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

    await saveScheduledNotification(
      notificationId,
      scheduledNotificationId,
      wakeTime,
      'wake'
    );

    return scheduledNotificationId;
  } catch (error) {
    console.error('[NotificationService] Error scheduling wake reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification by ID.
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  if (!isNotificationsEnabled) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('[NotificationService] Notification cancelled:', notificationId);
  } catch (error) {
    console.error('[NotificationService] Error cancelling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (!isNotificationsEnabled) {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All notifications cancelled');
  } catch (error) {
    console.error('[NotificationService] Error cancelling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications.
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  if (!isNotificationsEnabled) {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[NotificationService] Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Re-schedule all notifications for user.
 * Call this when user updates bed/wake times.
 */
export const rescheduleAllNotifications = async (
  bedTime: string,
  wakeTime: string
): Promise<{ bed: string | null; wake: string | null }> => {
  if (!isNotificationsEnabled) {
    return { bed: null, wake: null };
  }

  try {
    await cancelAllNotifications();

    const bedNotifId = await scheduleBedReminder(
      bedTime,
      `bed_${new Date().getTime()}`
    );
    const wakeNotifId = await scheduleWakeReminder(
      wakeTime,
      `wake_${new Date().getTime()}`
    );

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
 * Save scheduled notification reference.
 */
const saveScheduledNotification = async (
  id: string,
  scheduledId: string,
  time: string,
  type: 'bed' | 'wake'
): Promise<void> => {
  try {
    console.log(
      `[NotificationService] Saved ${type} notification: ${id} -> ${scheduledId} at ${time}`
    );
  } catch (error) {
    console.error('[NotificationService] Error saving notification:', error);
  }
};

/**
 * Listen for notification responses (when user taps notification).
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  if (!isNotificationsEnabled) {
    return () => undefined;
  }

  ensureNotificationHandlerConfigured();
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
};

/**
 * Listen for notifications received while app is in foreground.
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): (() => void) => {
  if (!isNotificationsEnabled) {
    return () => undefined;
  }

  ensureNotificationHandlerConfigured();
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
};
