import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import {
  Play,
  Pause,
  FastForward,
  Timer,
  Headphones,
  Square,
  PictureInPicture2,
  ListTodo,
  Flame,
  Palette,
  BarChart2,
  Settings,
} from 'lucide-react';
import { TimerDisplay } from '../components/TimerDisplay';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { ThemeModal } from '../components/ThemeModal';
import { SettingsModal } from '../components/SettingsModal';
import { HistoryModal } from '../components/HistoryModal';
import { TasksSlideover } from '../components/TasksSlideover';
import { MusicPanel } from '../components/MusicPanel';
import { FloatingTimer } from '../components/FloatingTimer';
import { useTimer } from '../hooks/useTimer';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppSettings, SessionMode, StudySession, TodayStats } from '../types';

interface TimerPageProps {
  settings: AppSettings;
  onRecordSession: (mode: SessionMode, durationMinutes: number) => void;
  onUpdateSetting?: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  onUploadCustomBg?: (file: File) => Promise<void>;
  onRemoveCustomBg?: () => Promise<void>;
  sessions?: StudySession[];
  todayStats?: TodayStats;
  onClearHistory?: () => void;
}

export const TimerPage: React.FC<TimerPageProps> = ({
  settings,
  onRecordSession,
  onUpdateSetting,
  onUploadCustomBg,
  onRemoveCustomBg,
  sessions = [],
  todayStats = { sessionsCount: 0, totalFocusMinutes: 0, breakCount: 0 },
  onClearHistory = () => {},
}) => {
  const { language, t } = useLanguage();
  const router = useIonRouter();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const stopYtRef = useRef<(() => void) | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isInPageFloating, setIsInPageFloating] = useState(false);

  const {
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
  } = useTimer({
    settings,
    onSessionComplete: onRecordSession,
    t,
  });

  const [appTitle, setAppTitle] = useState(
    () => localStorage.getItem('study_pomodoro_app_title') || 'Study Pomodoro'
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(appTitle);

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    const finalTitle = trimmed || 'Study Pomodoro';
    setAppTitle(finalTitle);
    setTitleDraft(finalTitle);
    localStorage.setItem('study_pomodoro_app_title', finalTitle);
    setIsEditingTitle(false);
  };


  // Hẹn giờ nổi (Document Picture-in-Picture API + fallback in-page mini panel)
  const togglePiP = useCallback(async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }
    if (isInPageFloating) {
      setIsInPageFloating(false);
      return;
    }

    // Ưu tiên Document Picture-in-Picture API (Chrome/Edge hỗ trợ)
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const win = await (window as any).documentPictureInPicture.requestWindow({
          width: 250,
          height: 310,
        });
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
        });
        setPipWindow(win);
        return;
      } catch (err) {
        console.warn('Document Picture-in-Picture error, fallback:', err);
      }
    }

    // Fallback: panel mini nổi trong trang
    setIsInPageFloating(true);
  }, [pipWindow, isInPageFloating]);

  const isPiPActive = !!pipWindow || isInPageFloating;

  // Hiện nút Đặt lại khi đã bấm Bắt đầu (timer đang chạy hoặc đã từng chạy trong phiên), ẩn khi ở trạng thái ban đầu
  const canReset = status !== 'idle' || timeLeft < totalSeconds;

  return (
    <IonPage className="timer-page-root">

      <IonHeader className="ion-no-border app-header">
        <IonToolbar className="app-toolbar">
          <div className="header-brand-container">
            <div className="brand-logo-mark">
              <Timer size={18} className="brand-logo-icon" />
            </div>
            <div className="brand-text-block">
              {isEditingTitle ? (
                <input
                  type="text"
                  className="brand-title-input"
                  value={titleDraft}
                  autoFocus
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setTitleDraft(appTitle);
                      setIsEditingTitle(false);
                    }
                  }}
                  maxLength={40}
                  aria-label="Tên ứng dụng"
                />
              ) : (
                <span
                  className="brand-title brand-title-editable"
                  onClick={() => {
                    setTitleDraft(appTitle);
                    setIsEditingTitle(true);
                  }}
                  title={language === 'vi' ? 'Bấm để đổi tên' : 'Click to edit title'}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setTitleDraft(appTitle);
                      setIsEditingTitle(true);
                    }
                  }}
                >
                  {appTitle}
                </span>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="timer-content-area">
        {/* SIDEBAR BÊN TRÁI – CHỈ TRANG TIMER */}
        <aside className="timer-left-sidebar" aria-label="Sidebar điều khiển">
          {/* 1. Streak */}
          <div className="sidebar-item">
            <button
              type="button"
              className="sidebar-icon-btn streak-btn"
              onClick={() =>
                setToastMessage(
                  language === 'vi'
                    ? 'Tính năng Streak (Chuỗi ngày tập trung) sắp ra mắt!'
                    : 'Streak feature coming soon!'
                )
              }
              title="Streak"
              aria-label="Streak"
            >
              <Flame size={19} className="sidebar-icon icon-streak" />
              <span className="sidebar-badge-soon">{language === 'vi' ? 'Sắp có' : 'Soon'}</span>
            </button>
          </div>

          {/* 2. Theme / Đổi nền */}
          <div className="sidebar-item">
            <button
              type="button"
              className={`sidebar-icon-btn ${isThemeOpen ? 'active' : ''}`}
              onClick={() => setIsThemeOpen(true)}
              title={language === 'vi' ? 'Đổi nền / Theme' : 'Theme & Wallpaper'}
              aria-label={language === 'vi' ? 'Đổi nền / Theme' : 'Theme & Wallpaper'}
            >
              <Palette size={19} className="sidebar-icon icon-theme" />
            </button>
          </div>

          {/* 3. Thống kê (Lịch sử) */}
          <div className="sidebar-item">
            <button
              type="button"
              className={`sidebar-icon-btn ${isHistoryOpen ? 'active' : ''}`}
              onClick={() => setIsHistoryOpen(true)}
              title={t('tabHistory')}
              aria-label={t('tabHistory')}
            >
              <BarChart2 size={19} className="sidebar-icon icon-stats" />
            </button>
          </div>

          {/* 4. Cài đặt (Icon bánh răng gear / cog) */}
          <div className="sidebar-item">
            <button
              type="button"
              className={`sidebar-icon-btn ${isSettingsOpen ? 'active' : ''}`}
              onClick={() => setIsSettingsOpen(true)}
              title={t('tabSettings')}
              aria-label={t('tabSettings')}
            >
              <Settings size={19} className="sidebar-icon icon-settings" />
            </button>
          </div>
        </aside>

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

          {/* Inspirational Motivational Quote Card */}
          <div className="timer-quote-section">
            <MotivationalQuote
              quote={currentQuote}
              language={language}
              accentColor={settings.accentColor}
              t={t}
            />
          </div>
        </div>

        {/* THANH ĐIỀU KHIỂN (CONTROL BAR) – FLOATING BAR DƯỚI TIMER */}
        <nav className="timer-floating-control-bar" aria-label="Điều khiển timer">
          {/* 1. Music: Mở / đóng panel Âm thanh */}
          <button
            type="button"
            className={`control-bar-btn ${isMusicOpen ? 'active active-music' : ''}`}
            onClick={() => setIsMusicOpen((prev) => !prev)}
            title={language === 'vi' ? 'Âm thanh' : 'Music'}
            aria-label={language === 'vi' ? 'Âm thanh' : 'Music'}
          >
            <Headphones size={20} />
            {isMusicOpen && (
              <span className="control-bar-btn-label">
                {language === 'vi' ? 'Nhạc' : 'Music'}
              </span>
            )}
          </button>

          {/* 2. Đặt lại (Reset): Hiện khi đã bấm Bắt đầu, ẩn khi ở trạng thái ban đầu, bấm vào reset timer */}
          {canReset && (
            <button
              type="button"
              className="control-bar-btn control-bar-stop-btn"
              onClick={resetTimer}
              title={t('reset')}
              aria-label={t('reset')}
            >
              <Square size={16} fill="currentColor" />
            </button>
          )}

          {/* 3. Start / Pause: Nút lớn ở giữa, hover hiện chữ "Bắt đầu" / "Tạm dừng" */}
          <button
            type="button"
            className="control-bar-primary-btn"
            onClick={status === 'running' ? pauseTimer : startTimer}
            style={{ backgroundColor: settings.accentColor }}
            title={status === 'running' ? t('pause') : status === 'paused' ? t('resume') : t('start')}
            aria-label={status === 'running' ? t('pause') : t('start')}
          >
            {status === 'running' ? (
              <Pause size={24} className="btn-icon" />
            ) : (
              <Play size={24} className="btn-icon fill-current ml-0.5" />
            )}
            <span className="control-bar-primary-label">
              {status === 'running'
                ? (language === 'vi' ? 'Tạm dừng' : 'Pause')
                : (language === 'vi' ? 'Bắt đầu' : 'Start')}
            </span>
          </button>

          {/* 4. Chuyển phiên (Skip session): Thêm bên phải nút Start/Pause */}
          <button
            type="button"
            className="control-bar-btn control-bar-skip-btn"
            onClick={skipSession}
            title={language === 'vi' ? 'Chuyển phiên' : 'Skip session'}
            aria-label={language === 'vi' ? 'Chuyển phiên' : 'Skip session'}
          >
            <FastForward size={18} />
          </button>

          {/* 4. PiP: Picture-in-Picture / thu nhỏ */}
          <button
            type="button"
            className={`control-bar-btn ${isPiPActive ? 'active-pip' : ''}`}
            onClick={togglePiP}
            title={language === 'vi' ? 'Picture-in-Picture / Thu nhỏ' : 'Picture-in-Picture'}
            aria-label="Picture-in-Picture"
          >
            <PictureInPicture2 size={20} />
          </button>

          {/* 5. Tasks: Mở panel trượt bên phải */}
          <button
            type="button"
            className={`control-bar-btn ${isTasksOpen ? 'active active-tasks' : ''}`}
            onClick={() => setIsTasksOpen((prev) => !prev)}
            title={language === 'vi' ? 'Ghi chú' : 'Tasks'}
            aria-label={language === 'vi' ? 'Ghi chú' : 'Tasks'}
          >
            <ListTodo size={20} />
            {isTasksOpen && (
              <span className="control-bar-btn-label">
                {language === 'vi' ? 'Ghi chú' : 'Tasks'}
              </span>
            )}
          </button>
        </nav>

        {/* Nút Giới thiệu góc dưới bên trái */}
        <button
          type="button"
          className="timer-about-chip"
          onClick={() => router.push('/about', 'forward')}
          title={language === 'vi' ? 'Giới thiệu về Study Pomodoro' : 'About Study Pomodoro'}
          aria-label={language === 'vi' ? 'Giới thiệu' : 'About'}
        >
          {language === 'vi' ? 'GIỚI THIỆU' : 'ABOUT'}
        </button>

        {/* Thông báo Toast ngắn */}
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={2400}
          onDidDismiss={() => setToastMessage(null)}
          position="top"
          className="timer-toast"
        />
      </IonContent>

      {/* Modals & Slideovers rendered at IonPage level to ensure they sit above IonHeader and all content */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        settings={settings}
        onUpdateSetting={(key, val) => onUpdateSetting?.(key, val)}
        onUploadCustomBg={onUploadCustomBg}
        onRemoveCustomBg={onRemoveCustomBg}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={(key, val) => onUpdateSetting?.(key, val)}
        cycleCount={cycleCount}
        onResetCycle={resetCycle}
        onResetTimer={resetTimer}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        todayStats={todayStats}
        onClearHistory={onClearHistory}
      />
      <TasksSlideover
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        accentColor={settings.accentColor}
      />
      <MusicPanel
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        onYtPlayingChange={setIsYtPlaying}
        stopYtRef={stopYtRef}
      />
      <FloatingTimer
        pipWindow={pipWindow}
        isInPageFloating={isInPageFloating}
        onClose={() => {
          if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
          }
          setIsInPageFloating(false);
        }}
        mode={mode}
        formattedTime={formattedTime}
        progress={progress}
        status={status}
        accentColor={settings.accentColor}
        language={language}
        onTogglePlay={status === 'running' ? pauseTimer : startTimer}
        onStop={resetTimer}
      />
    </IonPage>
  );
};
