import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Flame,
  Clock,
  Coffee,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from 'lucide-react';
import { IonAlert } from '@ionic/react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNotes } from '../hooks/useNotes';
import type { StudySession, TodayStats } from '../types';

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  todayStats: TodayStats;
  onClearHistory: () => void;
  accentColor?: string;
}

export type StatsPeriodTab = 'today' | 'week' | 'month';

// Format Date to local YYYY-MM-DD
export const toLocalDateKey = (dateInput: Date | string | number): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format minutes into clean compact string: e.g. "2m", "1h 30m", "45m"
export const formatCompactTime = (minutes: number, _lang: 'vi' | 'en' = 'vi'): string => {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) return '0m';
  if (m < 60) return `${m}m`;
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
};

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  todayStats,
  onClearHistory,
  accentColor = '#6366F1',
}) => {
  const { language, t } = useLanguage();
  const { notes } = useNotes();

  const [activeTab, setActiveTab] = useState<StatsPeriodTab>('today');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Sync state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setWeekOffset(0);
      setMonthOffset(0);
      setHoveredBarIndex(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Calculate Date Range based on activeTab
  const { rangeStart, rangeEnd, periodLabel, isNextDisabled } = useMemo(() => {
    const todayLocalKey = toLocalDateKey(new Date());

    if (activeTab === 'today') {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const start = new Date(year, month, day, 0, 0, 0, 0);
      const end = new Date(year, month, day, 23, 59, 59, 999);

      const selKey = toLocalDateKey(selectedDate);
      const isToday = selKey === todayLocalKey;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = selKey === toLocalDateKey(yesterday);

      const dayNum = selectedDate.getDate();
      const monthNum = selectedDate.getMonth() + 1;
      const monthEn = selectedDate.toLocaleDateString('en-US', { month: 'short' });

      let label = language === 'vi' ? `${dayNum} Th${monthNum}` : `${monthEn} ${dayNum}`;
      if (isToday) {
        label = language === 'vi' ? `Hôm nay, ${dayNum} Th${monthNum}` : `Today, ${monthEn} ${dayNum}`;
      } else if (isYesterday) {
        label = language === 'vi' ? `Hôm qua, ${dayNum} Th${monthNum}` : `Yesterday, ${monthEn} ${dayNum}`;
      }

      return {
        rangeStart: start,
        rangeEnd: end,
        periodLabel: label,
        isNextDisabled: isToday,
      };
    }

    if (activeTab === 'week') {
      const now = new Date();
      const currentDay = now.getDay();
      const distToMonday = (currentDay + 6) % 7; // 0 for Mon, 6 for Sun
      const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMonday);

      const targetMonday = new Date(thisMonday);
      targetMonday.setDate(targetMonday.getDate() + weekOffset * 7);

      const targetSunday = new Date(targetMonday);
      targetSunday.setDate(targetSunday.getDate() + 6);

      const start = new Date(targetMonday.getFullYear(), targetMonday.getMonth(), targetMonday.getDate(), 0, 0, 0, 0);
      const end = new Date(targetSunday.getFullYear(), targetSunday.getMonth(), targetSunday.getDate(), 23, 59, 59, 999);

      const mDay = targetMonday.getDate();
      const mMonth = targetMonday.getMonth() + 1;
      const sDay = targetSunday.getDate();
      const sMonth = targetSunday.getMonth() + 1;

      let label = `${mDay} Th${mMonth} – ${sDay} Th${sMonth}`;
      if (language === 'en') {
        const mEn = targetMonday.toLocaleDateString('en-US', { month: 'short' });
        const sEn = targetSunday.toLocaleDateString('en-US', { month: 'short' });
        label = mMonth === sMonth ? `${mEn} ${mDay} – ${sDay}` : `${mEn} ${mDay} – ${sEn} ${sDay}`;
      }

      return {
        rangeStart: start,
        rangeEnd: end,
        periodLabel: label,
        isNextDisabled: weekOffset >= 0,
      };
    }

    // Month
    const now = new Date();
    const targetMonthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const targetYear = targetMonthDate.getFullYear();
    const targetMonth = targetMonthDate.getMonth();

    const start = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const label =
      language === 'vi'
        ? `Tháng ${targetMonth + 1}, ${targetYear}`
        : `${targetMonthDate.toLocaleDateString('en-US', { month: 'long' })} ${targetYear}`;

    return {
      rangeStart: start,
      rangeEnd: end,
      periodLabel: label,
      isNextDisabled: monthOffset >= 0,
    };
  }, [activeTab, selectedDate, weekOffset, monthOffset, language]);

  // 2. Filter Sessions in Range
  const sessionsInRange = useMemo(() => {
    return sessions.filter((sess) => {
      const sessDate = new Date(sess.completedAt);
      if (isNaN(sessDate.getTime())) return false;
      return sessDate >= rangeStart && sessDate <= rangeEnd;
    });
  }, [sessions, rangeStart, rangeEnd]);

  // 3. Compute 4 Metric KPIs
  const { focusSessionsCount, totalFocusMinutes, breakSessionsCount } = useMemo(() => {
    const focusList = sessionsInRange.filter((s) => s.mode === 'focus');
    const breakList = sessionsInRange.filter((s) => s.mode !== 'focus');

    let fCount = focusList.length;
    let fMinutes = focusList.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
    let bCount = breakList.length;

    // For "today", sync with todayStats to never lose counts if sessions were reset or synced from capacitor
    if (activeTab === 'today') {
      const isViewingToday = toLocalDateKey(selectedDate) === toLocalDateKey(new Date());
      if (isViewingToday && todayStats) {
        fCount = Math.max(fCount, todayStats.sessionsCount || 0);
        fMinutes = Math.max(fMinutes, todayStats.totalFocusMinutes || 0);
        bCount = Math.max(bCount, todayStats.breakCount || 0);
      }
    }

    return {
      focusSessionsCount: fCount,
      totalFocusMinutes: fMinutes,
      breakSessionsCount: bCount,
    };
  }, [sessionsInRange, activeTab, selectedDate, todayStats]);

  // 4. Compute Completed Tasks in Range
  const completedTasksCount = useMemo(() => {
    return notes.filter((n) => {
      if (n.status !== 'completed') return false;
      const timeStr = n.completedAt || n.updatedAt || n.createdAt;
      const taskDate = new Date(timeStr);
      if (isNaN(taskDate.getTime())) return false;
      return taskDate >= rangeStart && taskDate <= rangeEnd;
    }).length;
  }, [notes, rangeStart, rangeEnd]);

  // 5. Generate Chart Columns & Hourly/Daily aggregation
  const chartColumns = useMemo(() => {
    if (activeTab === 'today') {
      // 24 hours (0..23)
      const hours = Array.from({ length: 24 }, (_, h) => ({
        key: `h-${h}`,
        label: `${h}h`,
        showLabel: h % 4 === 0,
        minutes: 0,
        tooltipTitle: `${String(h).padStart(2, '0')}:00 – ${String(h).padStart(2, '0')}:59`,
      }));

      for (const sess of sessionsInRange) {
        if (sess.mode === 'focus') {
          const d = new Date(sess.completedAt);
          const h = d.getHours();
          if (hours[h]) {
            hours[h].minutes += sess.durationMinutes || 0;
          }
        }
      }
      return hours;
    }

    if (activeTab === 'week') {
      // 7 days of week (Mon to Sun)
      const dayLabels = [
        { vi: 'T2', en: 'Mon' },
        { vi: 'T3', en: 'Tue' },
        { vi: 'T4', en: 'Wed' },
        { vi: 'T5', en: 'Thu' },
        { vi: 'T6', en: 'Fri' },
        { vi: 'T7', en: 'Sat' },
        { vi: 'CN', en: 'Sun' },
      ];

      const days = dayLabels.map((lbl, idx) => {
        const itemDate = new Date(rangeStart);
        itemDate.setDate(itemDate.getDate() + idx);
        const dayNum = itemDate.getDate();
        const monthNum = itemDate.getMonth() + 1;
        const textLbl = language === 'vi' ? lbl.vi : lbl.en;

        return {
          key: `d-${idx}`,
          label: textLbl,
          showLabel: true,
          dateKey: toLocalDateKey(itemDate),
          minutes: 0,
          tooltipTitle: `${textLbl} (${dayNum}/${monthNum})`,
        };
      });

      for (const sess of sessionsInRange) {
        if (sess.mode === 'focus') {
          const sessDateKey = toLocalDateKey(new Date(sess.completedAt));
          const found = days.find((d) => d.dateKey === sessDateKey);
          if (found) {
            found.minutes += sess.durationMinutes || 0;
          }
        }
      }
      return days;
    }

    // Month: 1..daysInMonth
    const daysInMonth = rangeEnd.getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const itemDate = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), dayNum);
      const showLabel = dayNum === 1 || dayNum % 5 === 0 || dayNum === daysInMonth;

      return {
        key: `m-${dayNum}`,
        label: String(dayNum),
        showLabel,
        dateKey: toLocalDateKey(itemDate),
        minutes: 0,
        tooltipTitle:
          language === 'vi'
            ? `Ngày ${dayNum} Th${itemDate.getMonth() + 1}`
            : `${itemDate.toLocaleDateString('en-US', { month: 'short' })} ${dayNum}`,
      };
    });

    for (const sess of sessionsInRange) {
      if (sess.mode === 'focus') {
        const sessDateKey = toLocalDateKey(new Date(sess.completedAt));
        const found = monthDays.find((d) => d.dateKey === sessDateKey);
        if (found) {
          found.minutes += sess.durationMinutes || 0;
        }
      }
    }
    return monthDays;
  }, [activeTab, sessionsInRange, rangeStart, rangeEnd, language]);

  // Chart Max Scale (minutes) for proportional heights
  const chartMaxScale = useMemo(() => {
    const maxVal = Math.max(...chartColumns.map((c) => c.minutes), 0);
    if (maxVal <= 30) return 30;
    if (maxVal <= 60) return 60;
    if (maxVal <= 120) return 120;
    if (maxVal <= 180) return 180;
    return Math.ceil(maxVal / 60) * 60;
  }, [chartColumns]);

  // Navigation handlers
  const handlePrevPeriod = () => {
    setHoveredBarIndex(null);
    if (activeTab === 'today') {
      setSelectedDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 1);
        return d;
      });
    } else if (activeTab === 'week') {
      setWeekOffset((prev) => prev - 1);
    } else {
      setMonthOffset((prev) => prev - 1);
    }
  };

  const handleNextPeriod = () => {
    if (isNextDisabled) return;
    setHoveredBarIndex(null);
    if (activeTab === 'today') {
      setSelectedDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 1);
        return d;
      });
    } else if (activeTab === 'week') {
      setWeekOffset((prev) => prev + 1);
    } else {
      setMonthOffset((prev) => prev + 1);
    }
  };

  const handleTabChange = (tab: StatsPeriodTab) => {
    setActiveTab(tab);
    setHoveredBarIndex(null);
  };

  const activeHoveredBar = hoveredBarIndex !== null ? chartColumns[hoveredBarIndex] : null;

  return (
    <div className="theme-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="theme-modal-card history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="theme-modal-title-group">
            <div className="settings-header-badge">
              <BarChart2 size={18} style={{ color: accentColor }} />
              <h2 className="theme-modal-title">{language === 'vi' ? 'Thống kê' : 'Statistics'}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sessions.length > 0 && (
              <button
                type="button"
                className="header-icon-btn btn-danger-subtle"
                onClick={() => setShowClearAlert(true)}
                title={language === 'vi' ? 'Xóa lịch sử' : 'Clear history'}
                aria-label={language === 'vi' ? 'Xóa lịch sử' : 'Clear history'}
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              type="button"
              className="theme-modal-close-btn"
              onClick={onClose}
              aria-label={language === 'vi' ? 'Đóng' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="theme-modal-body history-modal-body">
          {/* 1. Period Selector Tabs */}
          <div className="stats-period-tabs">
            <button
              type="button"
              className={`period-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => handleTabChange('today')}
              style={
                activeTab === 'today'
                  ? { borderColor: accentColor, color: '#FFFFFF', backgroundColor: `${accentColor}28` }
                  : undefined
              }
            >
              {language === 'vi' ? 'Hôm nay' : 'Today'}
            </button>
            <button
              type="button"
              className={`period-tab-btn ${activeTab === 'week' ? 'active' : ''}`}
              onClick={() => handleTabChange('week')}
              style={
                activeTab === 'week'
                  ? { borderColor: accentColor, color: '#FFFFFF', backgroundColor: `${accentColor}28` }
                  : undefined
              }
            >
              {language === 'vi' ? 'Tuần này' : 'This week'}
            </button>
            <button
              type="button"
              className={`period-tab-btn ${activeTab === 'month' ? 'active' : ''}`}
              onClick={() => handleTabChange('month')}
              style={
                activeTab === 'month'
                  ? { borderColor: accentColor, color: '#FFFFFF', backgroundColor: `${accentColor}28` }
                  : undefined
              }
            >
              {language === 'vi' ? 'Tháng này' : 'This month'}
            </button>
          </div>

          {/* 2. 4 Metric KPI Cards (2x2 Grid) */}
          <div className="stats-kpi-grid-4">
            {/* Card 1: Tổng phiên Focus */}
            <div className="stats-kpi-card">
              <div className="kpi-top-row">
                <div className="kpi-icon-pill icon-flame" style={{ color: accentColor }}>
                  <Flame size={14} />
                </div>
                <span className="kpi-label">
                  {language === 'vi' ? 'Tổng phiên Focus' : 'Focus sessions'}
                </span>
              </div>
              <div className="kpi-big-num">{focusSessionsCount}</div>
            </div>

            {/* Card 2: Tổng phút tập trung */}
            <div className="stats-kpi-card">
              <div className="kpi-top-row">
                <div className="kpi-icon-pill icon-clock" style={{ color: '#06B6D4' }}>
                  <Clock size={14} />
                </div>
                <span className="kpi-label">
                  {language === 'vi' ? 'Tổng phút tập trung' : 'Total focus time'}
                </span>
              </div>
              <div className="kpi-big-num">{formatCompactTime(totalFocusMinutes, language)}</div>
            </div>

            {/* Card 3: Phiên nghỉ */}
            <div className="stats-kpi-card">
              <div className="kpi-top-row">
                <div className="kpi-icon-pill icon-coffee" style={{ color: '#10B981' }}>
                  <Coffee size={14} />
                </div>
                <span className="kpi-label">
                  {language === 'vi' ? 'Phiên nghỉ' : 'Breaks taken'}
                </span>
              </div>
              <div className="kpi-big-num">{breakSessionsCount}</div>
            </div>

            {/* Card 4: Task hoàn thành */}
            <div className="stats-kpi-card">
              <div className="kpi-top-row">
                <div className="kpi-icon-pill icon-check" style={{ color: '#F59E0B' }}>
                  <CheckCircle2 size={14} />
                </div>
                <span className="kpi-label">
                  {language === 'vi' ? 'Task hoàn thành' : 'Tasks completed'}
                </span>
              </div>
              <div className="kpi-big-num">{completedTasksCount}</div>
            </div>
          </div>

          {/* 3. Khối biểu đồ cột */}
          <div className="stats-chart-card">
            {/* Navigation Header Row */}
            <div className="chart-header-row">
              <div className="chart-nav-group">
                <button
                  type="button"
                  className="chart-nav-btn"
                  onClick={handlePrevPeriod}
                  aria-label="Previous period"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="chart-period-label">{periodLabel}</span>
                <button
                  type="button"
                  className="chart-nav-btn"
                  onClick={handleNextPeriod}
                  disabled={isNextDisabled}
                  aria-label="Next period"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="chart-total-time-badge">
                <span className="total-time-prefix">
                  {language === 'vi' ? 'Tổng thời gian:' : 'Total time:'}
                </span>
                <span className="total-time-value" style={{ color: accentColor }}>
                  {formatCompactTime(totalFocusMinutes, language)}
                </span>
              </div>
            </div>

            {/* Hover Tooltip / Detail Preview */}
            <div className="chart-tooltip-bar">
              {activeHoveredBar ? (
                <span className="tooltip-active-text">
                  <strong>{activeHoveredBar.tooltipTitle}</strong> —{' '}
                  <span style={{ color: accentColor }}>
                    {formatCompactTime(activeHoveredBar.minutes, language)}
                  </span>
                </span>
              ) : (
                <span className="tooltip-idle-text">
                  {language === 'vi'
                    ? 'Chạm hoặc rê chuột vào cột để xem chi tiết'
                    : 'Hover or tap bars for details'}
                </span>
              )}
            </div>

            {/* Chart Area with Gridlines and Bars */}
            <div className="chart-stage">
              {/* Y-Axis Guide Lines */}
              <div className="chart-gridlines">
                <div className="grid-line top">
                  <span className="grid-label">{formatCompactTime(chartMaxScale, language)}</span>
                </div>
                <div className="grid-line mid">
                  <span className="grid-label">{formatCompactTime(chartMaxScale / 2, language)}</span>
                </div>
                <div className="grid-line bottom">
                  <span className="grid-label">0</span>
                </div>
              </div>

              {/* Bars Columns */}
              <div
                className={`chart-bars-wrap ${
                  activeTab === 'today' ? 'mode-today' : activeTab === 'week' ? 'mode-week' : 'mode-month'
                }`}
              >
                {chartColumns.map((col, index) => {
                  const pct = Math.min(100, Math.max(0, (col.minutes / chartMaxScale) * 100));
                  const hasVal = col.minutes > 0;
                  const isHovered = hoveredBarIndex === index;

                  return (
                    <div
                      key={col.key}
                      className={`chart-col-item ${hasVal ? 'has-data' : ''} ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      onTouchStart={() => setHoveredBarIndex(index)}
                    >
                      <div className="chart-bar-track">
                        <div
                          className="chart-bar-fill"
                          style={{
                            height: hasVal ? `${Math.max(4, pct)}%` : '2px',
                            backgroundColor: hasVal ? accentColor : 'rgba(255, 255, 255, 0.12)',
                            boxShadow: isHovered && hasVal ? `0 0 10px ${accentColor}` : undefined,
                          }}
                        />
                      </div>
                      <div className="chart-x-label-slot">
                        {col.showLabel && <span className="chart-x-label">{col.label}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        <IonAlert
          isOpen={showClearAlert}
          onDidDismiss={() => setShowClearAlert(false)}
          header={language === 'vi' ? 'Xóa lịch sử?' : 'Clear history?'}
          message={
            language === 'vi'
              ? 'Toàn bộ dữ liệu phiên tập trung và phiên nghỉ sẽ bị xóa sạch.'
              : 'All your focus and break sessions will be wiped clean.'
          }
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