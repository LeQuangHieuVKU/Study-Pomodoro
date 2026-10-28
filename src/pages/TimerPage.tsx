import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Clock,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { TimerDisplay } from '../components/TimerDisplay';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { useTimer } from '../hooks/useTimer';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppSettings, SessionMode, StudySession, TodayStats } from '../types';

// Code-split all modals and slideover panels - loaded on demand only
const ThemeModal = React.lazy(() => import('../components/ThemeModal').then(m => ({ default: m.ThemeModal })));
const SettingsModal = React.lazy(() => import('../components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const HistoryModal = React.lazy(() => import('../components/HistoryModal').then(m => ({ default: m.HistoryModal })));
const TasksSlideover = React.lazy(() => import('../components/TasksSlideover').then(m => ({ default: m.TasksSlideover })));
const MusicPanel = React.lazy(() => import('../components/MusicPanel').then(m => ({ default: m.MusicPanel })));
const FloatingTimer = React.lazy(() => import('../components/FloatingTimer').then(m => ({ default: m.FloatingTimer })));

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
  useSEO({ page: 'timer' });

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [isEmbedActive, setIsEmbedActive] = useState(false);
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


  const pipWindowRef = useRef<Window | null>(null);
  const userClosedPiPRef = useRef(false);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
    // Khi timer ở trạng thái ban đầu (idle), reset lại flag đóng thủ công cho phiên tiếp theo
    if (status === 'idle') {
      userClosedPiPRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    pipWindowRef.current = pipWindow;
  }, [pipWindow]);

  // Hẹn giờ nổi (Document Picture-in-Picture API + fallback in-page mini panel)
  const togglePiP = useCallback(async () => {
    if (pipWindow) {
      userClosedPiPRef.current = true;
      pipWindow.close();
      setPipWindow(null);
      pipWindowRef.current = null;
      return;
    }
    if (isInPageFloating) {
      userClosedPiPRef.current = true;
      setIsInPageFloating(false);
      return;
    }

    userClosedPiPRef.current = false;

    // Ưu tiên Document Picture-in-Picture API (Chrome/Edge hỗ trợ)
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const win = await (window as any).documentPictureInPicture.requestWindow({
          width: 250,
          height: 310,
        });
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
          pipWindowRef.current = null;
          userClosedPiPRef.current = true;
        });
        setPipWindow(win);
        pipWindowRef.current = win;
        return;
      } catch (err) {
        console.warn('Document Picture-in-Picture error, fallback:', err);
      }
    }

    // Fallback: panel mini nổi trong trang
    setIsInPageFloating(true);
  }, [pipWindow, isInPageFloating]);

  // Tự động mở Document Picture-in-Picture khi rời tab và Focus/phiên đang chạy
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Chỉ kích hoạt khi tab bị ẩn
      if (!document.hidden) return;

      // Chỉ kích hoạt khi timer đang chạy thực sự
      if (statusRef.current !== 'running') return;

      // Không mở nếu PiP đã đang mở
      if (pipWindowRef.current || isInPageFloating) return;

      // Không mở lại nếu user đã chủ động đóng PiP trong phiên này
      if (userClosedPiPRef.current) return;

      if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
        try {
          const win = await (window as any).documentPictureInPicture.requestWindow({
            width: 250,
            height: 310,
          });
          win.addEventListener('pagehide', () => {
            setPipWindow(null);
            pipWindowRef.current = null;
            userClosedPiPRef.current = true;
          });
          setPipWindow(win);
          pipWindowRef.current = win;
        } catch (err) {
          // Trình duyệt không cấp quyền auto-open không gesture hoặc không hỗ trợ -> fail safe không crash
          console.warn('Auto Document PiP skipped (gesture required or not permitted):', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInPageFloating]);

  const isPiPActive = !!pipWindow || isInPageFloating;

  // Đồng hồ giờ hệ thống cập nhật mỗi giây
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedCurrentTime = useMemo(() => {
    return currentTime.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: language !== 'vi',
    });
  }, [currentTime, language]);

  // Quản lý Fullscreen API
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  }, []);

  // Hiện nút Đặt lại khi đã bấm Bắt đầu (timer đang chạy hoặc đã từng chạy trong phiên), ẩn khi ở trạng thái ban đầu
  const canReset = status !== 'idle' || timeLeft < totalSeconds;

  // Nút Fullscreen chỉ hiện khi timer đã Bắt đầu (đang chạy hoặc đang tạm dừng), ẩn khi idle
  const canFullscreen = status !== 'idle';

  return (
    <IonPage className="timer-page-root">

      <IonHeader className="ion-no-border app-header">
        <IonToolbar className="app-toolbar">
          <div className="timer-header-inner">
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

            {/* Top Right: Giờ hiện tại & Nút Phóng to (Fullscreen) */}
            <div className="timer-top-right-bar">
              <div
                className="timer-current-time-badge"
                title={language === 'vi' ? 'Giờ hệ thống' : 'Current time'}
              >
                <Clock size={13} className="time-icon" />
                <span className="time-text">{formattedCurrentTime}</span>
              </div>

              {canFullscreen && (
                <button
                  type="button"
                  className="timer-fullscreen-btn"
                  onClick={toggleFullscreen}
                  title={
                    isFullscreen
                      ? (language === 'vi' ? 'Thu nhỏ toàn màn hình (Esc)' : 'Exit fullscreen (Esc)')
                      : (language === 'vi' ? 'Toàn màn hình' : 'Fullscreen')
                  }
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
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
      {isThemeOpen && (
        <React.Suspense fallback={null}>
          <ThemeModal
            isOpen={isThemeOpen}
            onClose={() => setIsThemeOpen(false)}
            settings={settings}
            onUpdateSetting={(key, val) => onUpdateSetting?.(key, val)}
            onUploadCustomBg={onUploadCustomBg}
            onRemoveCustomBg={onRemoveCustomBg}
          />
        </React.Suspense>
      )}

      {isSettingsOpen && (
        <React.Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSetting={(key, val) => onUpdateSetting?.(key, val)}
            cycleCount={cycleCount}
            onResetCycle={resetCycle}
            onResetTimer={resetTimer}
          />
        </React.Suspense>
      )}

      {isHistoryOpen && (
        <React.Suspense fallback={null}>
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            sessions={sessions}
            todayStats={todayStats}
            onClearHistory={onClearHistory}
            accentColor={settings.accentColor}
          />
        </React.Suspense>
      )}

      {isTasksOpen && (
        <React.Suspense fallback={null}>
          <TasksSlideover
            isOpen={isTasksOpen}
            onClose={() => setIsTasksOpen(false)}
            accentColor={settings.accentColor}
          />
        </React.Suspense>
      )}

      {(isMusicOpen || isYtPlaying || isEmbedActive) && (
        <React.Suspense fallback={null}>
          <MusicPanel
            isOpen={isMusicOpen}
            onClose={() => setIsMusicOpen(false)}
            onYtPlayingChange={setIsYtPlaying}
            onEmbedActiveChange={setIsEmbedActive}
            stopYtRef={stopYtRef}
          />
        </React.Suspense>
      )}

      {(pipWindow || isInPageFloating) && (
        <React.Suspense fallback={null}>
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
        </React.Suspense>
      )}
    </IonPage>
  );
};
