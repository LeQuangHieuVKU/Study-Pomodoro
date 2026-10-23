import React, { useCallback } from 'react';
import { Route, Navigate } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { TimerPage } from './pages/TimerPage';
import { AboutPage } from './pages/AboutPage';
import { BackgroundRenderer } from './components/BackgroundRenderer';

import { LanguageProvider } from './i18n/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { useSettings } from './hooks/useSettings';
import { useHistory } from './hooks/useHistory';
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
}

const AppNavigation: React.FC<AppNavigationProps> = ({
  settings,
  updateSetting,
  uploadCustomBg,
  removeCustomBg,
}) => {
  const { sessions, todayStats, addSession, clearHistory } = useHistory();

  const handleRecordSession = useCallback(
    (mode: SessionMode, durationMinutes: number) => {
      addSession(mode, durationMinutes);
    },
    [addSession]
  );

  return (
    <IonRouterOutlet>
      <Route
        path="/timer"
        element={
          <TimerPage
            settings={settings}
            onRecordSession={handleRecordSession}
            onUpdateSetting={updateSetting}
            onUploadCustomBg={uploadCustomBg}
            onRemoveCustomBg={removeCustomBg}
            sessions={sessions}
            todayStats={todayStats}
            onClearHistory={clearHistory}
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
  );
};

const AppRoot: React.FC = () => {
  const {
    settings,
    updateSetting,
    uploadCustomBg,
    removeCustomBg,
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
