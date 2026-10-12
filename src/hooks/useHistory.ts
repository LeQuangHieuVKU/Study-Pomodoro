import { useState, useEffect, useCallback, useMemo } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { StudySession, SessionMode, TodayStats } from '../types';

const HISTORY_KEY = 'study_pomodoro_history';

// Helper to get local YYYY-MM-DD
export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SEED_SESSIONS: StudySession[] = [
  {
    id: 'seed-1',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    dateKey: getTodayKey(),
  },
  {
    id: 'seed-2',
    mode: 'break',
    durationMinutes: 5,
    completedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    dateKey: getTodayKey(),
  },
  {
    id: 'seed-3',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    dateKey: getTodayKey(),
  },
];

export const useHistory = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { value } = await Preferences.get({ key: HISTORY_KEY });
        if (value) {
          const parsed = JSON.parse(value);
          setSessions(parsed);
        } else {
          // Initialize with demo sessions so stats render immediately
          setSessions(SEED_SESSIONS);
          await Preferences.set({
            key: HISTORY_KEY,
            value: JSON.stringify(SEED_SESSIONS),
          });
        }
      } catch (err) {
        console.warn('Error loading history', err);
        setSessions(SEED_SESSIONS);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const saveHistory = async (newSessions: StudySession[]) => {
    setSessions(newSessions);
    try {
      await Preferences.set({
        key: HISTORY_KEY,
        value: JSON.stringify(newSessions),
      });
    } catch (e) {
      console.error('Error saving history to Preferences', e);
    }
  };

  const addSession = useCallback(
    async (mode: SessionMode, durationMinutes: number) => {
      const now = new Date();
      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        mode,
        durationMinutes,
        completedAt: now.toISOString(),
        dateKey: getTodayKey(),
      };
      const updated = [newSession, ...sessions];
      await saveHistory(updated);
      return newSession;
    },
    [sessions]
  );

  const clearHistory = useCallback(async () => {
    setSessions([]);
    await Preferences.remove({ key: HISTORY_KEY });
  }, []);

  const todayStats: TodayStats = useMemo(() => {
    const todayKey = getTodayKey();
    const todaySessions = sessions.filter((s) => s.dateKey === todayKey);

    const focusSessions = todaySessions.filter((s) => s.mode === 'focus');
    const breakSessions = todaySessions.filter((s) => s.mode === 'break');

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      sessionsCount: focusSessions.length,
      totalFocusMinutes,
      breakCount: breakSessions.length,
    };
  }, [sessions]);

  return {
    sessions,
    isLoading,
    addSession,
    clearHistory,
    todayStats,
  };
};
