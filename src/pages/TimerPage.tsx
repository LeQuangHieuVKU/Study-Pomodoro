import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { Play, Pause, RotateCcw, FastForward, Sparkles } from 'lucide-react';
import { TimerDisplay } from '../components/TimerDisplay';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { useTimer } from '../hooks/useTimer';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppSettings, SessionMode } from '../types';

interface TimerPageProps {
  settings: AppSettings;
  onRecordSession: (mode: SessionMode, durationMinutes: number) => void;
}

export const TimerPage: React.FC<TimerPageProps> = ({ settings, onRecordSession }) => {
  const { language, t } = useLanguage();

  const {
    mode,
    status,
    cycleCount,
    progress,
    formattedTime,
    currentQuote,
    isAwake,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  } = useTimer({
    settings,
    onSessionComplete: onRecordSession,
    t,
  });

  const getModeTitle = () => {
    if (mode === 'focus') {
      return `${t('focusSession')} (${cycleCount + 1}/4)`;
    }
    if (mode === 'longBreak') {
      return t('longBreakSession');
    }
    return t('shortBreakSession');
  };

  const getPrimaryBtnClass = () => {
    if (mode === 'focus') return 'primary-focus';
    if (mode === 'longBreak') return 'primary-long-break';
    return 'primary-break';
  };

  return (
    <IonPage className="timer-page-root">
      <IonHeader className="ion-no-border app-header">
        <IonToolbar className="app-toolbar">
          <div className="header-brand-container">
            <div className="brand-logo-mark">
              <Sparkles size={18} className="brand-sparkle" />
            </div>
            <div className="brand-text-block">
              <IonTitle className="brand-title">StudyPomodoro</IonTitle>
              <span className="brand-subtitle">
                {getModeTitle()}
              </span>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="timer-content-area">
        <div className="timer-page-wrapper">
          {/* Main Visual Clock Ring with 3D Background */}
          <div className="timer-center-stage">
            <TimerDisplay
              mode={mode}
              status={status}
              cycleCount={cycleCount}
              progress={progress}
              formattedTime={formattedTime}
              isAwake={isAwake}
              accentColor={settings.accentColor}
              t={t}
            />
          </div>

          {/* Tactical Controls with Micro-Interactions */}
          <div className="timer-controls-deck">
            {/* Reset Button */}
            <button
              type="button"
              className="control-btn control-secondary"
              onClick={resetTimer}
              title={t('reset')}
              aria-label={t('reset')}
            >
              <RotateCcw size={20} />
            </button>

            {/* Start / Pause Primary Button */}
            {status === 'running' ? (
              <button
                type="button"
                className={`control-btn control-primary btn-pause ${getPrimaryBtnClass()}`}
                onClick={pauseTimer}
                title={t('pause')}
                aria-label={t('pause')}
              >
                <Pause size={28} className="btn-icon" />
                <span className="btn-label">{t('pause')}</span>
              </button>
            ) : (
              <button
                type="button"
                className={`control-btn control-primary btn-start ${getPrimaryBtnClass()}`}
                onClick={startTimer}
                title={status === 'paused' ? t('resume') : t('start')}
                aria-label={status === 'paused' ? t('resume') : t('start')}
              >
                <Play size={28} className="btn-icon fill-current ml-0.5" />
                <span className="btn-label">
                  {status === 'paused' ? t('resume') : t('start')}
                </span>
              </button>
            )}

            {/* Skip / Switch Mode Button */}
            <button
              type="button"
              className="control-btn control-secondary"
              onClick={skipSession}
              title={t('skip')}
              aria-label={t('skip')}
            >
              <FastForward size={20} />
            </button>
          </div>

          {/* Inspirational Motivational Quote Card */}
          <div className="timer-quote-section">
            <MotivationalQuote
              quote={currentQuote}
              language={language}
              t={t}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
