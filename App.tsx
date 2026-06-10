import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppProvider, useAppContext } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  SleepNotificationModal,
  NotificationResponse,
} from './src/components/SleepNotificationModal';
import { addNotificationResponseListener } from './src/services/notificationService';
import { isNotificationsEnabled } from './src/config/environment';

function AppContent() {
  const appContext = useAppContext();

  useEffect(() => {
    if (!isNotificationsEnabled) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    addNotificationResponseListener((response) => {
      const notificationType = response.notification.request.content.data?.type;

      if (
        notificationType === 'bed_reminder' ||
        notificationType === 'wake_reminder'
      ) {
        appContext.showNotificationModal(notificationType);
      }
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleNotificationResponse = (data: NotificationResponse) => {
    console.log('[App] Notification response:', data);
    appContext.closeNotificationModal();
  };

  return (
    <>
      <StatusBar style="light" />
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
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
