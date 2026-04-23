import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppProvider, useAppContext } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SleepNotificationModal, NotificationResponse } from './src/components/SleepNotificationModal';

function AppContent() {
  const appContext = useAppContext();

  // Listen for notification taps
  useEffect(() => {
    try {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationType = response.notification.request.content.data?.type;
        
        if (notificationType === 'bed_reminder' || notificationType === 'wake_reminder') {
          appContext.showNotificationModal(notificationType);
        }
      });

      return () => subscription.remove();
    } catch (error) {
      console.warn('[App] Notification listener not available in Expo Go:', error);
    }
  }, [appContext]);

  const handleNotificationResponse = (data: NotificationResponse) => {
    console.log('[App] Notification response:', data);
    appContext.closeNotificationModal();
  };

  return (
    <>
      <AppNavigator />
      <SleepNotificationModal
        visible={appContext.notificationModalVisible}
        type={appContext.currentNotificationType}
        onClose={appContext.closeNotificationModal}
        onSubmit={handleNotificationResponse}
      />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AppProvider>
  );
}
