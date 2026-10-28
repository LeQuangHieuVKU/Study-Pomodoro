import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { StudySession, SessionMode, TodayStats } from '../types';

export const HISTORY_KEY = 'study_pomodoro_history';
export const DAILY_STATS_KEY = 'study_pomodoro_daily_stats';

// Helper to get local date key in YYYY-MM-DD
export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface StoredDailyStats {
  dateKey: string;
  sessionsCount: number;
  totalFocusMinutes: number;
  breakCount: number;
}

// Synchronous initial loader from localStorage for instant, zero-lag render
const loadInitialStats = (): TodayStats => {
  const todayKey = getTodayKey();
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DAILY_STATS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as StoredDailyStats;
      if (parsed && parsed.dateKey === todayKey) {
        return {
          sessionsCount: Math.max(0, Number(parsed.sessionsCount) || 0),
          totalFocusMinutes: Math.max(0, Number(parsed.totalFocusMinutes) || 0),
          breakCount: Math.max(0, Number(parsed.breakCount) || 0),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse initial daily stats from localStorage', err);
  }
  return { sessionsCount: 0, totalFocusMinutes: 0, breakCount: 0 };
};

const loadInitialSessions = (): StudySession[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse initial sessions from localStorage', err);
  }
  return [];
};

export const useHistory = () => {
  const [sessions, setSessions] = useState<StudySession[]>(loadInitialSessions);
  const [todayStats, setTodayStats] = useState<TodayStats>(loadInitialStats);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Preferences (Capacitor storage) and verify date key
  useEffect(() => {
    const syncWithStorage = async () => {
      const todayKey = getTodayKey();

      try {
        const [dailyRes, histRes] = await Promise.all([
          Preferences.get({ key: DAILY_STATS_KEY }),
          Preferences.get({ key: HISTORY_KEY }),
        ]);

        // 1. Process Daily Stats
        if (dailyRes.value) {
          const parsedDaily = JSON.parse(dailyRes.value) as StoredDailyStats;
          if (parsedDaily && parsedDaily.dateKey === todayKey) {
            setTodayStats({
              sessionsCount: Math.max(0, Number(parsedDaily.sessionsCount) || 0),
              totalFocusMinutes: Math.max(0, Number(parsedDaily.totalFocusMinutes) || 0),
              breakCount: Math.max(0, Number(parsedDaily.breakCount) || 0),
            });
          } else {
            // New day detected: reset today count to 0
            const freshStats: StoredDailyStats = {
              dateKey: todayKey,
              sessionsCount: 0,
              totalFocusMinutes: 0,
              breakCount: 0,
            };
            setTodayStats({ sessionsCount: 0, totalFocusMinutes: 0, breakCount: 0 });
            localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(freshStats));
            await Preferences.set({ key: DAILY_STATS_KEY, value: JSON.stringify(freshStats) });
          }
        } else {
          // If Preferences has no stats, check if we have localStorage or init fresh
          const localStats = loadInitialStats();
          const toSave: StoredDailyStats = {
            dateKey: todayKey,
            ...localStats,
          };
          localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(toSave));
          await Preferences.set({ key: DAILY_STATS_KEY, value: JSON.stringify(toSave) });
        }

        // 2. Process Session Timeline History
        if (histRes.value) {
          const parsedSessions = JSON.parse(histRes.value);
          if (Array.isArray(parsedSessions)) {
            setSessions(parsedSessions);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(parsedSessions));
          }
        }
      } catch (err) {
        console.warn('Error syncing history from storage', err);
      }
    };

    syncWithStorage();

    const handleSyncEvent = () => {
      syncWithStorage();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('study_pomodoro_history_changed', handleSyncEvent);
      window.addEventListener('storage', handleSyncEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('study_pomodoro_history_changed', handleSyncEvent);
        window.removeEventListener('storage', handleSyncEvent);
      }
    };
  }, []);

  // Add a newly completed session (called when timer countdown hits 00:00)
  const addSession = useCallback(
    async (mode: SessionMode, durationMinutes: number) => {
      const todayKey = getTodayKey();
      const validDuration = Math.max(1, Math.round(durationMinutes));
      const isFocus = mode === 'focus';
      const isBreak = mode === 'shortBreak' || mode === 'longBreak' || mode === 'break';

      const newSession: StudySession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        mode,
        durationMinutes: validDuration,
        completedAt: new Date().toISOString(),
        dateKey: todayKey,
      };

      // 1. Update Sessions list
      setSessions((prev) => {
        const next = [newSession, ...prev];
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(next) }).catch(console.error);
        return next;
      });

      // 2. Update Today Stats (only add duration if focus session completed)
      setTodayStats((prev) => {
        const nextStats: TodayStats = {
          sessionsCount: isFocus ? prev.sessionsCount + 1 : prev.sessionsCount,
          totalFocusMinutes: isFocus ? prev.totalFocusMinutes + validDuration : prev.totalFocusMinutes,
          breakCount: isBreak ? prev.breakCount + 1 : prev.breakCount,
        };

        const storedDaily: StoredDailyStats = {
          dateKey: todayKey,
          ...nextStats,
        };

        try {
          localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(storedDaily));
        } catch (e) {
          console.error(e);
        }
        Preferences.set({ key: DAILY_STATS_KEY, value: JSON.stringify(storedDaily) }).catch(console.error);

        return nextStats;
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('study_pomodoro_history_changed'));
      }

      return newSession;
    },
    []
  );

  // Clear all session history and reset today's stats
  const clearHistory = useCallback(async () => {
    const todayKey = getTodayKey();
    const emptyStats: StoredDailyStats = {
      dateKey: todayKey,
      sessionsCount: 0,
      totalFocusMinutes: 0,
      breakCount: 0,
    };

    setSessions([]);
    setTodayStats({ sessionsCount: 0, totalFocusMinutes: 0, breakCount: 0 });

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(emptyStats));
    } catch (e) {
      console.error(e);
    }

    await Promise.all([
      Preferences.set({ key: HISTORY_KEY, value: JSON.stringify([]) }),
      Preferences.set({ key: DAILY_STATS_KEY, value: JSON.stringify(emptyStats) }),
    ]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('study_pomodoro_history_changed'));
    }
  }, []);

  return {
    sessions,
    isLoading,
    addSession,
    clearHistory,
    todayStats,
  };
};
