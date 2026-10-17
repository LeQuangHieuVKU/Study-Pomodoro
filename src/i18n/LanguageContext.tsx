import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppLanguage } from '../types';
import { TRANSLATIONS, type TranslationKey } from './translations';
import { Preferences } from '@capacitor/preferences';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

const PREF_LANG_KEY = 'study_pomodoro_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const val =
          localStorage.getItem(PREF_LANG_KEY) ||
          localStorage.getItem('CapacitorStorage.' + PREF_LANG_KEY);
        if (val === 'vi' || val === 'en') return val;
      } catch {}
    }
    return 'vi';
  });

  useEffect(() => {
    const loadLang = async () => {
      try {
        const { value } = await Preferences.get({ key: PREF_LANG_KEY });
        if (value === 'vi' || value === 'en') {
          setLanguageState(value);
          if (typeof document !== 'undefined') {
            document.documentElement.lang = value;
          }
        }
      } catch (e) {
        console.warn('Could not load language from preferences', e);
      }
    };
    loadLang();
  }, []);

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(PREF_LANG_KEY, newLang);
      localStorage.setItem('CapacitorStorage.' + PREF_LANG_KEY, newLang);
    } catch {}
    Preferences.set({ key: PREF_LANG_KEY, value: newLang }).catch(console.error);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.vi;
    return dict[key] || TRANSLATIONS.vi[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
