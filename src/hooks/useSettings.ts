import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'study_pomodoro_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  hapticsEnabled: true,
  darkMode: true, // Default to sleek focus dark mode
  language: 'vi',
  soundEnabled: true,
  notificationSound: 'bell',
  autoSwitchSession: true,
  backgroundEffect: 'gradient',
  accentColor: '#6366F1',
  backgroundImage: 'none',
  customBgData: undefined,
};

// Helper to update accent color CSS custom properties
export const applyAccentColorToDOM = (hex: string) => {
  if (typeof document === 'undefined') return;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 99;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 102;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 241;

  document.documentElement.style.setProperty('--color-indigo', hex);
  document.documentElement.style.setProperty('--color-indigo-hover', hex);
  document.documentElement.style.setProperty('--color-indigo-glow', `rgba(${r}, ${g}, ${b}, 0.35)`);
  document.documentElement.style.setProperty('--accent-color', hex);
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply dark mode theme to document
  const applyTheme = useCallback((isDark: boolean) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { value } = await Preferences.get({ key: SETTINGS_KEY });
        if (value) {
          const parsed = JSON.parse(value) as AppSettings;
          const merged: AppSettings = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            longBreakDuration: parsed.longBreakDuration ?? 15,
            notificationSound: parsed.notificationSound ?? 'bell',
            backgroundEffect: (parsed.backgroundEffect as any) === 'blob' ? 'wave' : (parsed.backgroundEffect ?? 'gradient'),
          };
          setSettings(merged);
          applyTheme(merged.darkMode);
          if (merged.accentColor) {
            applyAccentColorToDOM(merged.accentColor);
          }
        } else {
          applyTheme(DEFAULT_SETTINGS.darkMode);
          applyAccentColorToDOM(DEFAULT_SETTINGS.accentColor);
        }
      } catch (err) {
        console.warn('Error reading settings from Preferences', err);
        applyTheme(DEFAULT_SETTINGS.darkMode);
        applyAccentColorToDOM(DEFAULT_SETTINGS.accentColor);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, [applyTheme]);

  // Synchronize has-bg-image class on html/body for glassmorphic styling
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hasImage = settings.backgroundImage !== 'none';
    document.documentElement.classList.toggle('has-bg-image', hasImage);
    document.body.classList.toggle('has-bg-image', hasImage);
  }, [settings.backgroundImage]);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'darkMode') {
        applyTheme(Boolean(val));
      }
      if (key === 'accentColor' && typeof val === 'string') {
        applyAccentColorToDOM(val);
      }
      Preferences.set({
        key: SETTINGS_KEY,
        value: JSON.stringify(next),
      }).catch(console.error);
      return next;
    });
  }, [applyTheme]);

  const uploadCustomBg = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setSettings((prev) => {
          const next: AppSettings = {
            ...prev,
            customBgData: dataUrl,
            backgroundImage: 'custom',
          };
          Preferences.set({
            key: SETTINGS_KEY,
            value: JSON.stringify(next),
          }).catch(console.error);
          return next;
        });
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const removeCustomBg = useCallback(async () => {
    setSettings((prev) => {
      const next: AppSettings = {
        ...prev,
        customBgData: undefined,
        backgroundImage: 'none',
      };
      Preferences.set({
        key: SETTINGS_KEY,
        value: JSON.stringify(next),
      }).catch(console.error);
      return next;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    applyTheme(DEFAULT_SETTINGS.darkMode);
    applyAccentColorToDOM(DEFAULT_SETTINGS.accentColor);
    await Preferences.set({
      key: SETTINGS_KEY,
      value: JSON.stringify(DEFAULT_SETTINGS),
    });
  }, [applyTheme]);

  return {
    settings,
    isLoaded,
    updateSetting,
    uploadCustomBg,
    removeCustomBg,
    resetSettings,
  };
};
