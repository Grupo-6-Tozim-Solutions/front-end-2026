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

  notifyNow(mensagem: string) {
    PushNotification.localNotification({
      message: mensagem,
      playSound: false,
      importance: 'high',
    });
  }
}

export const notificationService = new NotificationService();