export type SessionMode = 'focus' | 'shortBreak' | 'longBreak' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface StudySession {
  id: string;
  mode: SessionMode;
  durationMinutes: number;
  completedAt: string;
  dateKey: string; // YYYY-MM-DD
}

export type NoteStatus = 'pending' | 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type NotePriority = 'none' | 'high' | 'medium' | 'low';
export type NoteTag = 'study' | 'urgent' | 'idea' | 'review';

export interface NoteItemType {
  id: string;
  title: string;
  content: string;
  status: NoteStatus;
  priority: NotePriority;
  dueDate?: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  tag?: NoteTag;
}

export type AppLanguage = 'vi' | 'en';

export type BackgroundEffectType = 'none' | 'gradient' | 'particles' | 'wave' | 'rain' | 'blob';

export type NotificationSoundType = 'bell' | 'ping' | 'water' | 'wood' | 'piano' | 'soft';

export interface AccentColorItem {
  id: string;
  hex: string;
  nameVi: string;
  nameEn: string;
}

export interface BgImagePreset {
  id: string;
  nameVi: string;
  nameEn: string;
  url: string;
}

export interface AppSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes (short break)
  longBreakDuration: number; // in minutes (long break, default 15)
  hapticsEnabled: boolean;
  darkMode: boolean;
  language: AppLanguage;
  soundEnabled: boolean;
  notificationSound: NotificationSoundType;
  autoSwitchSession: boolean;
  backgroundEffect: BackgroundEffectType;
  accentColor: string;
  backgroundImage: string; // 'none' | preset id | 'custom'
  customBgData?: string; // base64 data url for user selected image
}

export interface QuoteItem {
  id: number;
  textVi: string;
  textEn: string;
  authorVi?: string;
  authorEn?: string;
}

export interface TodayStats {
  sessionsCount: number;
  totalFocusMinutes: number;
  breakCount: number;
}

export interface LofiTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string;
  url: string;
  coverImage?: string;
}

export interface SoundSettings {
  isEnabled: boolean;
  activeTrackId: string;
  volume: number; // 0.0 to 1.0
}
