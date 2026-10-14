import React, { useCallback } from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Timer, FileText, BarChart2, Headphones, Settings2 } from 'lucide-react';

import { TimerPage } from './pages/TimerPage';
import { NotesPage } from './pages/NotesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SoundPage } from './pages/SoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { BackgroundRenderer } from './components/BackgroundRenderer';

import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { useSettings } from './hooks/useSettings';
import { useHistory } from './hooks/useHistory';
import { useNotes } from './hooks/useNotes';
import type { SessionMode, AppSettings } from './types';

// Import Master Stylesheet
import './theme/main.scss';

setupIonicReact({
  mode: 'ios', // Sleek modern iOS mobile feel
});

interface AppNavigationProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  uploadCustomBg: (file: File) => Promise<void>;
  removeCustomBg: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const AppNavigation: React.FC<AppNavigationProps> = ({
  settings,
  updateSetting,
  uploadCustomBg,
  removeCustomBg,
  resetSettings,
}) => {
  const { t } = useLanguage();
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';
  const { sessions, todayStats, addSession, clearHistory } = useHistory();
  const { clearAllNotes } = useNotes();

  const handleRecordSession = useCallback(
    (mode: SessionMode, durationMinutes: number) => {
      addSession(mode, durationMinutes);
    },
    [addSession]
  );

  const handleResetAllData = useCallback(async () => {
    await clearHistory();
    await clearAllNotes();
    await resetSettings();
  }, [clearHistory, clearAllNotes, resetSettings]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route
          path="/timer"
          element={
            <TimerPage
              settings={settings}
              onRecordSession={handleRecordSession}
            />
          }
        />
        <Route
          path="/notes"
          element={<NotesPage />}
        />
        <Route
          path="/history"
          element={
            <HistoryPage
              sessions={sessions}
              todayStats={todayStats}
              onClearHistory={clearHistory}
            />
          }
        />
        <Route
          path="/sound"
          element={<SoundPage />}
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              settings={settings}
              onUpdateSetting={updateSetting}
              onUploadCustomBg={uploadCustomBg}
              onRemoveCustomBg={removeCustomBg}
              onResetAllData={handleResetAllData}
            />
          }
        />
        <Route
          path="/about"
          element={<AboutPage />}
        />
        <Route path="/" element={<Navigate to="/timer" replace />} />
        <Route path="*" element={<Navigate to="/timer" replace />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className={`custom-tab-bar ${isAboutPage ? 'tab-bar-hidden' : ''}`}>
        <IonTabButton tab="timer" href="/timer">
          <Timer className="tab-icon" size={21} />
          <IonLabel>{t('tabTimer')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="notes" href="/notes">
          <FileText className="tab-icon" size={21} />
          <IonLabel>{t('tabNotes')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="history" href="/history">
          <BarChart2 className="tab-icon" size={21} />
          <IonLabel>{t('tabHistory')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="sound" href="/sound">
          <Headphones className="tab-icon" size={21} />
          <IonLabel>{t('tabSound')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="settings" href="/settings">
          <Settings2 className="tab-icon" size={21} />
          <IonLabel>{t('tabSettings')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const AppRoot: React.FC = () => {
  const {
    settings,
    updateSetting,
    uploadCustomBg,
    removeCustomBg,
    resetSettings,
  } = useSettings();

  return (
    <IonApp>
      {/* Real-time Atmospheric Background & Wallpapers */}
      <BackgroundRenderer settings={settings} />

      <IonReactRouter>
        <AppNavigation
          settings={settings}
          updateSetting={updateSetting}
          uploadCustomBg={uploadCustomBg}
          removeCustomBg={removeCustomBg}
          resetSettings={resetSettings}
        />
      </IonReactRouter>
    </IonApp>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <SoundProvider>
        <AppRoot />
      </SoundProvider>
    </LanguageProvider>
  );
};

export default App;
