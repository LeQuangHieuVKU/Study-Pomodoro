import { useState, useCallback, useEffect, useRef } from 'react';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const useKeepAwake = (enabledByDefault: boolean = true) => {
  const [isAwake, setIsAwake] = useState(false);
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);

  const activateKeepAwake = useCallback(async () => {
    try {
      await KeepAwake.keepAwake();
      setIsAwake(true);
      return;
    } catch {
      // Fallback: Web Screen WakeLock API
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockSentinel.current = await navigator.wakeLock.request('screen');
          setIsAwake(true);
          wakeLockSentinel.current.addEventListener('release', () => {
            setIsAwake(false);
          });
        } catch (err) {
          console.warn('Wake Lock request error:', err);
        }
      }
    }
  }, []);

  const deactivateKeepAwake = useCallback(async () => {
    try {
      await KeepAwake.allowSleep();
      setIsAwake(false);
    } catch {
      if (wakeLockSentinel.current) {
        try {
          await wakeLockSentinel.current.release();
          wakeLockSentinel.current = null;
        } catch {
          // Ignore
        }
        setIsAwake(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivateKeepAwake();
    };
  }, [deactivateKeepAwake]);

  return {
    isAwake,
    activateKeepAwake,
    deactivateKeepAwake,
  };
};
