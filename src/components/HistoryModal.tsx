import React, { useState } from 'react';
import {
  X,
  Flame,
  Clock,
  Coffee,
  Trash2,
  Calendar,
  Award,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { IonAlert } from '@ionic/react';
import { useLanguage } from '../i18n/LanguageContext';
import type { StudySession, TodayStats } from '../types';

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  todayStats: TodayStats;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  todayStats,
  onClearHistory,
}) => {
  const { language, t } = useLanguage();
  const [showClearAlert, setShowClearAlert] = useState(false);

  if (!isOpen) return null;

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
    <div className="theme-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="theme-modal-card history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="theme-modal-title-group">
            <div className="settings-header-badge">
              <BarChart2 size={18} />
              <h2 className="theme-modal-title">{t('historyTitle')}</h2>
            </div>
            <p className="theme-modal-subtitle">{t('historySubtitle')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(sessions.length > 0 || todayStats.sessionsCount > 0 || todayStats.breakCount > 0) && (
              <button
                type="button"
                className="header-icon-btn btn-danger-subtle"
                onClick={() => setShowClearAlert(true)}
                title={t('clearHistoryBtn')}
                aria-label={t('clearHistoryBtn')}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              className="theme-modal-close-btn"
              onClick={onClose}
              aria-label={language === 'vi' ? 'Đóng' : 'Close'}
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="theme-modal-body">
          {/* Today Overview Header */}
          <div className="section-label-row">
            <Calendar size={15} className="text-indigo-400" />
            <span className="section-label-text">{t('todayStats')}</span>
          </div>

          {/* Metric KPI Cards */}
          <div className="stats-kpi-grid">
            <div className="kpi-card card-sessions">
              <div className="kpi-icon-wrap icon-indigo">
                <Flame size={20} />
              </div>
              <div className="kpi-value">{todayStats.sessionsCount}</div>
              <div className="kpi-title">{t('sessionsCompleted')}</div>
            </div>

            <div className="kpi-card card-time">
              <div className="kpi-icon-wrap icon-cyan">
                <Clock size={20} />
              </div>
              <div className="kpi-value">{formatFocusTime(todayStats.totalFocusMinutes)}</div>
              <div className="kpi-title">{t('totalFocusTime')}</div>
            </div>

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
                <span className="milestone-title">
                  {language === 'vi' ? 'Đạt mốc 4 phiên tập trung!' : 'Reached 4 focus sessions milestone!'}
                </span>
                <span className="milestone-sub">
                  {language === 'vi'
                    ? 'Bạn đang duy trì nhịp độ học tập xuất sắc hôm nay.'
                    : 'You are keeping up great study momentum today.'}
                </span>
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
            <div className="empty-state-card" style={{ padding: '36px 16px', textAlign: 'center' }}>
              <div className="empty-icon-circle" style={{ margin: '0 auto 12px auto' }}>
                <Clock size={36} className="text-indigo-400" />
              </div>
              <h3 className="empty-state-title" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                {t('noHistory')}
              </h3>
              <p className="empty-state-desc" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('noHistorySub')}
              </p>
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
      </div>
    </div>
  );
};
export default HistoryModal;
