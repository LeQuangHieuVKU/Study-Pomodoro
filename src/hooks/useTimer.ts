import { useState, useEffect, useRef, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { SessionMode, TimerStatus, QuoteItem, AppSettings } from '../types';
import { getRandomQuote } from '../data/quotes';
import { soundManager } from '../utils/audioChime';
import { useHaptics } from './useHaptics';
import { useKeepAwake } from './useKeepAwake';
import { useNotifications } from './useNotifications';

const CYCLE_KEY = 'study_pomodoro_cycle_count';

interface UseTimerProps {
  settings: AppSettings;
  onSessionComplete: (mode: SessionMode, durationMinutes: number) => void;
  t: (key: any) => string;
}

export const useTimer = ({ settings, onSessionComplete, t }: UseTimerProps) => {
  const [mode, setMode] = useState<SessionMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [cycleCount, setCycleCount] = useState<number>(0); // 0 to 4 completed focus sessions in current cycle
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(() => getRandomQuote());

  // Restore cycle count from Preferences
  useEffect(() => {
    Preferences.get({ key: CYCLE_KEY })
      .then(({ value }) => {
        if (value) {
          const parsed = parseInt(value, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
            setCycleCount(parsed);
          }
        }
      })
      .catch(console.warn);
  }, []);

  const currentDurationMinutes =
    mode === 'focus'
      ? settings.focusDuration
      : mode === 'longBreak'
      ? (settings.longBreakDuration || 15)
      : settings.breakDuration;

  const totalSeconds = currentDurationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  const { triggerImpact, triggerNotification, triggerVibrate } = useHaptics(settings.hapticsEnabled);
  const { isAwake, activateKeepAwake, deactivateKeepAwake } = useKeepAwake();
  const { scheduleNotification } = useNotifications();

  const timerRef = useRef<number | null>(null);
  const handleTimerCompleteRef = useRef<() => void>(() => {});

  // Sync timeLeft when duration setting changes while idle
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(currentDurationMinutes * 60);
    }
  }, [currentDurationMinutes, status]);

  // Handle countdown interval
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // Defer completion execution outside setState updater to avoid React dispatch collisions
            setTimeout(() => {
              handleTimerCompleteRef.current?.();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // When timer hits zero
  const handleTimerComplete = useCallback(async () => {
    const finishedMode = mode;
    const duration =
      finishedMode === 'focus'
        ? settings.focusDuration
        : finishedMode === 'longBreak'
        ? (settings.longBreakDuration || 15)
        : settings.breakDuration;

    // 1. Record completed session
    onSessionComplete(finishedMode, duration);

    // 2. Audio & Haptics feedback
    if (settings.soundEnabled) {
      soundManager.playNotification(settings.notificationSound || 'bell', (settings.alarmVolume ?? 80) / 100);
    }

    if (settings.hapticsEnabled) {
      await triggerNotification();
      await triggerVibrate(600);
    }

    // 3. Confetti burst for focus session (dynamically imported to keep initial bundle ultra-light)
    if (finishedMode === 'focus') {
      import('canvas-confetti')
        .then(({ default: confetti }) => {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'],
          });
        })
        .catch(() => {
          // Ignored if failed or offline
        });
    }

    // 4. Calculate next mode & cycle
    let nextMode: SessionMode = 'focus';
    let nextCycle = cycleCount;

    if (finishedMode === 'focus') {
      nextCycle = (cycleCount % 4) + 1;
      setCycleCount(nextCycle);
      Preferences.set({ key: CYCLE_KEY, value: String(nextCycle) }).catch(console.error);

      if (nextCycle === 4) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'shortBreak';
      }
    } else if (finishedMode === 'longBreak') {
      // Completed long break -> reset cycle count to 0, start new cycle
      nextMode = 'focus';
      nextCycle = 0;
      setCycleCount(0);
      Preferences.set({ key: CYCLE_KEY, value: '0' }).catch(console.error);
    } else {
      // Finished short break -> transition to focus
      nextMode = 'focus';
    }

    // 5. Local Notification
    let notifTitle = t('notificationFocusTitle');
    let notifBody = t('notificationFocusBody');
    let notifId = 101;

    if (finishedMode === 'focus') {
      if (nextMode === 'longBreak') {
        notifTitle = t('notificationLongBreakTitle');
        notifBody = t('notificationLongBreakBody');
        notifId = 103;
      } else {
        notifTitle = t('notificationFocusTitle');
        notifBody = t('notificationFocusBody');
        notifId = 101;
      }
    } else if (finishedMode === 'longBreak') {
      notifTitle = t('notificationCycleCompleteTitle');
      notifBody = t('notificationCycleCompleteBody');
      notifId = 104;
    } else {
      notifTitle = t('notificationBreakTitle');
      notifBody = t('notificationBreakBody');
      notifId = 102;
    }

    scheduleNotification(notifTitle, notifBody, notifId);

    // 6. Update motivational quote
    setCurrentQuote((prev) => getRandomQuote(prev.id));

    // 7. Transition to next mode
    const nextDuration =
      nextMode === 'focus'
        ? settings.focusDuration
        : nextMode === 'longBreak'
        ? (settings.longBreakDuration || 15)
        : settings.breakDuration;

    setMode(nextMode);
    setTimeLeft(nextDuration * 60);

    // Auto-start: check specific break or focus auto-start setting
    const isNextBreak = nextMode === 'shortBreak' || nextMode === 'longBreak';
    const shouldAutoStart = isNextBreak
      ? (settings.autoStartBreaks ?? settings.autoSwitchSession)
      : (settings.autoStartFocus ?? settings.autoSwitchSession);

    if (shouldAutoStart) {
      setStatus('running');
      activateKeepAwake();
    } else {
      setStatus('idle');
      deactivateKeepAwake();
    }
  }, [
    mode,
    cycleCount,
    settings,
    onSessionComplete,
    t,
    triggerNotification,
    triggerVibrate,
    scheduleNotification,
    activateKeepAwake,
    deactivateKeepAwake,
  ]);

  // Keep ref up to date so interval timer always invokes the latest complete handler
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const startTimer = useCallback(async () => {
    triggerImpact();
    if (settings.soundEnabled) soundManager.playTap();
    setStatus('running');
    await activateKeepAwake();
  }, [triggerImpact, settings.soundEnabled, activateKeepAwake]);

  const pauseTimer = useCallback(() => {
    triggerImpact();
    if (settings.soundEnabled) soundManager.playTap();
    setStatus('paused');
    deactivateKeepAwake();
  }, [triggerImpact, settings.soundEnabled, deactivateKeepAwake]);

  const resetTimer = useCallback(() => {
    triggerImpact();
    if (settings.soundEnabled) soundManager.playTap();
    setStatus('idle');
    setTimeLeft(currentDurationMinutes * 60);
    deactivateKeepAwake();
  }, [triggerImpact, settings.soundEnabled, currentDurationMinutes, deactivateKeepAwake]);

  const skipSession = useCallback(() => {
    triggerImpact();
    if (settings.soundEnabled) soundManager.playTap();

    let nextMode: SessionMode = 'focus';
    let nextCycle = cycleCount;

    if (mode === 'focus') {
      nextCycle = (cycleCount % 4) + 1;
      setCycleCount(nextCycle);
      Preferences.set({ key: CYCLE_KEY, value: String(nextCycle) }).catch(console.error);
      nextMode = nextCycle === 4 ? 'longBreak' : 'shortBreak';
    } else if (mode === 'longBreak') {
      nextMode = 'focus';
      setCycleCount(0);
      Preferences.set({ key: CYCLE_KEY, value: '0' }).catch(console.error);
    } else {
      nextMode = 'focus';
    }

    setMode(nextMode);
    setStatus('idle');
    const nextMinutes =
      nextMode === 'focus'
        ? settings.focusDuration
        : nextMode === 'longBreak'
        ? (settings.longBreakDuration || 15)
        : settings.breakDuration;

    setTimeLeft(nextMinutes * 60);
    setCurrentQuote((prev) => getRandomQuote(prev.id));
    deactivateKeepAwake();
  }, [triggerImpact, settings, mode, cycleCount, deactivateKeepAwake]);

  const resetCycle = useCallback(() => {
    setCycleCount(0);
    Preferences.set({ key: CYCLE_KEY, value: '0' }).catch(console.error);
  }, []);

  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    mode,
    status,
    cycleCount,
    timeLeft,
    totalSeconds,
    progress,
    formattedTime,
    currentQuote,
    isAwake,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    resetCycle,
  };
};
