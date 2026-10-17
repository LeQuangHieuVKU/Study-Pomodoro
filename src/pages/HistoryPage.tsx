import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonAlert,
  useIonRouter,
} from '@ionic/react';
import { ArrowLeft, Flame, Clock, Coffee, Trash2, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import type { StudySession, TodayStats } from '../types';

interface HistoryPageProps {
  sessions: StudySession[];
  todayStats: TodayStats;
  onClearHistory: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  sessions,
  todayStats,
  onClearHistory,
}) => {
  const router = useIonRouter();
  const { t } = useLanguage();
  const { isHeaderHidden, handleIonScroll } = useHeaderScroll();
  const [showClearAlert, setShowClearAlert] = useState(false);

  // Format focus minutes to hours & minutes display
  const formatFocusTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('minutesSuffix')}`;
    }
    const hrs = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    return `${hrs} ${t('hoursSuffix')} ${remMins > 0 ? `${remMins} ${t('minutesSuffix')}` : ''}`;
  };

  return (
    <IonPage className="history-page-root">
      <IonHeader className={`ion-no-border app-header ${isHeaderHidden ? 'header-hidden' : ''}`}>
        <IonToolbar className="app-toolbar">
          <div className="header-title-row">
            <div className="header-left-group">
              <button
                type="button"
                className="header-back-button"
                onClick={() => router.push('/timer', 'back')}
                title="Quay lại Timer"
                aria-label="Quay lại"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <IonTitle className="page-header-title">{t('historyTitle')}</IonTitle>
                <p className="page-header-subtitle">{t('historySubtitle')}</p>
              </div>
            </div>
            {sessions.length > 0 && (
              <button
                type="button"
                className="header-icon-btn btn-danger-subtle"
                onClick={() => setShowClearAlert(true)}
                title={t('clearHistoryBtn')}
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        scrollEvents={true}
        onIonScroll={handleIonScroll}
        className="history-content-area"
      >
        <div className="history-page-wrapper">
          {/* Today Overview Header */}
          <div className="section-label-row">
            <Calendar size={15} className="text-indigo-400" />
            <span className="section-label-text">{t('todayStats')}</span>
          </div>

          {/* Metric KPI Cards */}
          <div className="stats-kpi-grid">
            {/* Sessions count */}
            <div className="kpi-card card-sessions">
              <div className="kpi-icon-wrap icon-indigo">
                <Flame size={20} />
              </div>
              <div className="kpi-value">{todayStats.sessionsCount}</div>
              <div className="kpi-title">{t('sessionsCompleted')}</div>
            </div>

            {/* Total focus time */}
            <div className="kpi-card card-time">
              <div className="kpi-icon-wrap icon-cyan">
                <Clock size={20} />
              </div>
              <div className="kpi-value">{formatFocusTime(todayStats.totalFocusMinutes)}</div>
              <div className="kpi-title">{t('totalFocusTime')}</div>
            </div>

            {/* Breaks count */}
            <div className="kpi-card card-break">
              <div className="kpi-icon-wrap icon-emerald">
                <Coffee size={20} />
              </div>
              <div className="kpi-value">{todayStats.breakCount}</div>
              <div className="kpi-title">{t('breaksTaken')}</div>
            </div>
          </div>

          {/* Motivation Milestone Banner */}
          {todayStats.sessionsCount >= 4 && (
            <div className="milestone-banner">
              <Award size={20} className="milestone-icon" />
              <div className="milestone-text">
                <span className="milestone-title">Đạt mốc 4 phiên tập trung!</span>
                <span className="milestone-sub">Bạn đang duy trì nhịp độ học tập xuất sắc hôm nay.</span>
              </div>
            </div>
          )}

          {/* Recent Timeline */}
          <div className="section-label-row mt-6">
            <CheckCircle2 size={15} className="text-indigo-400" />
            <span className="section-label-text">{t('recentSessions')}</span>
          </div>

          {sessions.length > 0 ? (
            <div className="session-timeline-list">
              {sessions.map((sess) => {
                const isFocus = sess.mode === 'focus';
                const dateObj = new Date(sess.completedAt);
                const timeStr = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateStr = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={sess.id} className={`timeline-session-card ${isFocus ? 'type-focus' : 'type-break'}`}>
                    <div className="timeline-indicator">
                      <div className={`indicator-dot ${isFocus ? 'dot-focus' : 'dot-break'}`} />
                      <div className="indicator-line" />
                    </div>

                    <div className="session-info-body">
                      <div className="session-headline">
                        <span className="session-type-name">
                          {isFocus ? t('focusSession') : t('breakSession')}
                        </span>
                        <span className="session-badge">
                          {sess.durationMinutes} {t('minutesSuffix')}
                        </span>
                      </div>
                      <div className="session-meta-time">
                        <span>{dateStr}</span>
                        <span className="bullet-sep">•</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon-circle">
                <Clock size={36} className="text-indigo-400" />
              </div>
              <h3 className="empty-state-title">{t('noHistory')}</h3>
              <p className="empty-state-desc">{t('noHistorySub')}</p>
            </div>
          )}
        </div>

        {/* Clear History Confirmation Alert */}
        <IonAlert
          isOpen={showClearAlert}
          onDidDismiss={() => setShowClearAlert(false)}
          header={t('clearHistoryBtn')}
          message={t('clearHistoryConfirm')}
          buttons={[
            {
              text: t('cancel'),
              role: 'cancel',
            },
            {
              text: t('delete'),
              role: 'destructive',
              handler: () => {
                onClearHistory();
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};
