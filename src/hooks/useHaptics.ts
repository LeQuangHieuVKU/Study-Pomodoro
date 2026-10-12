import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useHaptics = (enabled: boolean = true) => {
  const triggerImpact = useCallback(async (style: ImpactStyle = ImpactStyle.Light) => {
    if (!enabled) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // Fallback for browsers supporting navigator.vibrate
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  }, [enabled]);

  const triggerNotification = useCallback(async (type: NotificationType = NotificationType.Success) => {
    if (!enabled) return;
    try {
      await Haptics.notification({ type });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [enabled]);

  const triggerVibrate = useCallback(async (duration: number = 400) => {
    if (!enabled) return;
    try {
      await Haptics.vibrate({ duration });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    }
  }, [enabled]);

  return {
    triggerImpact,
    triggerNotification,
    triggerVibrate,
  };
};
