import { useCallback, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useNotifications = () => {
  const requestPermissions = useCallback(async () => {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const scheduleNotification = useCallback(async (title: string, body: string, id: number = 1) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return;
    } catch {
      // Fallback: Web Notification API
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.svg',
          });
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  return {
    requestPermissions,
    scheduleNotification,
  };
};
