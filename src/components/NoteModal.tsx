import React, { useState, useEffect } from 'react';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';
import {
  X,
  Check,
  Clock,
  CircleDot,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Flag,
  Calendar,
  Tag,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Trash2,
} from 'lucide-react';
import { PRESET_LABELS, getLabelDisplayName, getLabelColor } from '../hooks/useNotes';
import {
  STATUS_LIST,
  getStatusLabel,
  StatusIcon,
} from '../constants/statusConfig';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    content: string,
    status: NoteStatus,
    priority: NotePriority,
    dueDate: string | null,
    labels: string[]
  ) => void;
  initialNote?: NoteItemType | null;
  customLabels: string[];
  onAddCustomLabel: (label: string) => Promise<void>;
  t: (key: any) => string;
  language?: 'vi' | 'en';
}

export const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatSmartDueDate = (dateStr: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!dateStr) return lang === 'vi' ? 'Hạn chót' : 'Due date';

  const today = new Date();
  const todayStr = toLocalDateString(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrow);

  if (dateStr === todayStr) {
    return lang === 'vi' ? 'Hôm nay' : 'Today';
  }
  if (dateStr === tomorrowStr) {
    return lang === 'vi' ? 'Ngày mai' : 'Tomorrow';
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    return lang === 'vi' ? `${day} thg ${month}` : `${day}/${month}`;
  }
  return dateStr;
};

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  customLabels,
  onAddCustomLabel,
  t,
  language = 'vi',
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<NoteStatus>('pending');
  const [priority, setPriority] = useState<NotePriority>('none');
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(['Học tập']);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [error, setError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'due' | 'labels' | null>(null);

  // Calendar view month & year state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setStatus(initialNote.status || 'pending');
      setPriority(initialNote.priority || 'none');
      setDueDate(initialNote.dueDate || '');
      setSelectedLabels(
        Array.isArray(initialNote.labels) && initialNote.labels.length > 0
          ? initialNote.labels
          : ['Học tập']
      );
      if (initialNote.dueDate) {
        const parts = initialNote.dueDate.split('-');
        if (parts.length === 3) {
          setCalendarMonth(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
        }
      } else {
        setCalendarMonth(new Date());
      }
    } else {
      setTitle('');
      setContent('');
      setStatus('pending');
      setPriority('none');
      setDueDate('');
      setSelectedLabels(['Học tập']);
      setCalendarMonth(new Date());
    }
    setNewLabelInput('');
    setError('');
    setActiveDropdown(null);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập tiêu đề ghi chú' : 'Please enter note title');
      return;
    }
    onSave(
      title.trim(),
      content.trim(),
      status,
      priority,
      dueDate.trim() ? dueDate : null,
      selectedLabels
    );
    onClose();
  };

  const toggleDropdown = (name: 'status' | 'priority' | 'due' | 'labels') => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleSelectStatus = (newStatus: NoteStatus) => {
    setStatus(newStatus);
    setActiveDropdown(null);
  };

  const handleSelectPriority = (newPriority: NotePriority) => {
    setPriority(newPriority);
    setActiveDropdown(null);
  };

  const handleClearDueDate = () => {
    setDueDate('');
    setActiveDropdown(null);
  };

  const handleSelectToday = () => {
    const today = new Date();
    setDueDate(toLocalDateString(today));
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setActiveDropdown(null);
  };

  const handleSelectTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(toLocalDateString(tomorrow));
    setCalendarMonth(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
    setActiveDropdown(null);
  };

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToggleLabel = (labelName: string) => {
    setSelectedLabels((prev) => (prev.includes(labelName) ? [] : [labelName]));
    setActiveDropdown(null);
  };

  const handleAddNewLabel = async () => {
    const trimmed = newLabelInput.trim();
    if (!trimmed) return;
    await onAddCustomLabel(trimmed);
    if (!selectedLabels.includes(trimmed)) {
      setSelectedLabels((prev) => [...prev, trimmed]);
    }
    setNewLabelInput('');
  };

  const statusOptions = STATUS_LIST.map((key) => ({
    key,
    label: getStatusLabel(key, language),
    icon: <StatusIcon status={key} size={16} />,
  }));

  const priorityOptions: { key: NotePriority; labelKey: string; icon?: React.ReactNode }[] = [
    { key: 'none', labelKey: 'priorityNone', icon: <Flag size={16} className="opacity-40" /> },
    { key: 'high', labelKey: 'priorityHigh', icon: <Flame size={16} className="text-rose-500" /> },
    { key: 'medium', labelKey: 'priorityMedium', icon: <Flag size={16} className="text-amber-500" /> },
    { key: 'low', labelKey: 'priorityLow', icon: <Flag size={16} className="text-sky-500" /> },
  ];

  const allAvailableLabels: string[] = [
    ...PRESET_LABELS.map((p) => p.vi),
    ...customLabels.filter((c) => !PRESET_LABELS.some((p) => p.vi === c || p.en === c)),
  ];

  const getStatusChipConfig = () => {
    return {
      text: getStatusLabel(status, language),
      icon: <StatusIcon status={status} size={15} />,
      className: `chip-status-${status}`,
    };
  };

  const getPriorityChipConfig = () => {
    switch (priority) {
      case 'high':
        return { text: t('priorityHigh'), icon: <Flame size={15} />, className: 'chip-priority-high' };
      case 'medium':
        return { text: t('priorityMedium'), icon: <Flag size={15} />, className: 'chip-priority-medium' };
      case 'low':
        return { text: t('priorityLow'), icon: <Flag size={15} />, className: 'chip-priority-low' };
      case 'none':
      default:
        return { text: t('notePriorityLabel'), icon: <Flag size={15} />, className: 'chip-priority-none' };
    }
  };

  const getLabelsChipText = (): string => {
    if (!selectedLabels || selectedLabels.length === 0) {
      return t('noteLabelsLabel');
    }
    return getLabelDisplayName(selectedLabels[0], language);
  };

  // Calendar calculations
  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = language === 'vi' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const todayStr = toLocalDateString(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowObj);

  const statusChipInfo = getStatusChipConfig();
  const priorityChipInfo = getPriorityChipConfig();

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="note-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">{initialNote ? t('editNote') : t('addNote')}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-streamlined">
          {/* 1. TITLE INPUT (BẮT BUỘC) */}
          <div className="form-group-title">
            <input
              id="note-title-input"
              type="text"
              className={`form-input-streamlined ${error ? 'input-has-error' : ''}`}
              placeholder={t('noteTitlePlaceholder')}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          {/* 2. HÀNG 4 CHIP NGAY DƯỚI TITLE */}
          <div className="chips-action-bar">
            {/* CHIP 1: TRẠNG THÁI */}
            <button
              type="button"
              className={`note-meta-chip ${statusChipInfo.className} ${activeDropdown === 'status' ? 'is-active' : ''}`}
              onClick={() => toggleDropdown('status')}
            >
              {statusChipInfo.icon}
              <span className="chip-text">{statusChipInfo.text}</span>
              <ChevronDown size={15} className={`chip-chevron ${activeDropdown === 'status' ? 'rotated' : ''}`} />
            </button>

            {/* CHIP 2: MỨC ƯU TIÊN */}
            <button
              type="button"
              className={`note-meta-chip ${priorityChipInfo.className} ${priority !== 'none' ? 'has-value' : ''} ${activeDropdown === 'priority' ? 'is-active' : ''}`}
              onClick={() => toggleDropdown('priority')}
            >
              {priorityChipInfo.icon}
              <span className="chip-text">{priorityChipInfo.text}</span>
              <ChevronDown size={15} className={`chip-chevron ${activeDropdown === 'priority' ? 'rotated' : ''}`} />
            </button>

            {/* CHIP 3: HẠN CHÓT (SMART CHIP TEXT: Hôm nay, Ngày mai, 13 thg 10) */}
            <button
              type="button"
              className={`note-meta-chip chip-due ${dueDate ? 'has-value' : ''} ${activeDropdown === 'due' ? 'is-active' : ''}`}
              onClick={() => toggleDropdown('due')}
            >
              <Calendar size={15} />
              <span className="chip-text">{formatSmartDueDate(dueDate, language)}</span>
              <ChevronDown size={15} className={`chip-chevron ${activeDropdown === 'due' ? 'rotated' : ''}`} />
            </button>

            {/* CHIP 4: NHÃN */}
            <button
              type="button"
              className={`note-meta-chip chip-labels ${selectedLabels.length > 0 ? 'has-value' : ''} ${activeDropdown === 'labels' ? 'is-active' : ''}`}
              onClick={() => toggleDropdown('labels')}
            >
              {selectedLabels.length > 0 ? (
                <span
                  className="chip-color-dot"
                  style={{ backgroundColor: getLabelColor(selectedLabels[0]) }}
                />
              ) : (
                <Tag size={15} />
              )}
              <span className="chip-text">{getLabelsChipText()}</span>
              <ChevronDown size={15} className={`chip-chevron ${activeDropdown === 'labels' ? 'rotated' : ''}`} />
            </button>
          </div>

          {/* KHAY SỔ XUỐNG DƯỚI HÀNG CHIP */}
          {activeDropdown && (
            <div className={`chip-dropdown-tray tray-${activeDropdown}`}>
              {/* DROPDOWN: TRẠNG THÁI */}
              {activeDropdown === 'status' && (
                <div className="tray-content">
                  <div className="tray-header">
                    <span>{t('noteStatusLabel')}</span>
                    <button type="button" className="tray-close-btn" onClick={() => setActiveDropdown(null)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="tray-status-grid">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`tray-status-btn status-btn-${opt.key} ${status === opt.key ? 'selected' : ''}`}
                        onClick={() => handleSelectStatus(opt.key)}
                      >
                        <span className="item-icon">{opt.icon}</span>
                        <span className="item-label">{opt.label}</span>
                        {status === opt.key && <Check size={16} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DROPDOWN: MỨC ƯU TIÊN */}
              {activeDropdown === 'priority' && (
                <div className="tray-content">
                  <div className="tray-header">
                    <span>{t('notePriorityLabel')}</span>
                    <button type="button" className="tray-close-btn" onClick={() => setActiveDropdown(null)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="tray-priority-row">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`tray-priority-btn priority-btn-${opt.key} ${priority === opt.key ? 'selected' : ''}`}
                        onClick={() => handleSelectPriority(opt.key)}
                      >
                        <span className="item-icon">{opt.icon}</span>
                        <span className="item-label">{t(opt.labelKey)}</span>
                        {priority === opt.key && <Check size={16} className="ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DROPDOWN: HẠN CHÓT (LỊCH TỐI ĐẸP, TRÒN TRỊA, NÚT NHANH TODAY/TOMORROW) */}
              {activeDropdown === 'due' && (
                <div className="tray-content tray-calendar-content">
                  <div className="tray-header">
                    <span>{t('noteDueDateLabel')}</span>
                    <button type="button" className="tray-close-btn" onClick={() => setActiveDropdown(null)}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* 1. Nút chọn nhanh Hôm nay & Ngày mai */}
                  <div className="calendar-quick-buttons">
                    <button
                      type="button"
                      className={`quick-date-btn ${dueDate === todayStr ? 'active' : ''}`}
                      onClick={handleSelectToday}
                    >
                      <Clock size={15} className="text-amber-500" />
                      <span>{t('today')}</span>
                    </button>

                    <button
                      type="button"
                      className={`quick-date-btn ${dueDate === tomorrowStr ? 'active' : ''}`}
                      onClick={handleSelectTomorrow}
                    >
                      <Sun size={15} className="text-indigo-400" />
                      <span>{t('tomorrow')}</span>
                    </button>
                  </div>

                  {/* 2. Điều hướng Tháng & Năm */}
                  <div className="calendar-month-nav">
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="cal-month-title">
                      {language === 'vi'
                        ? `Tháng ${calMonth + 1}, ${calYear}`
                        : `${monthNamesEn[calMonth]} ${calYear}`}
                    </span>
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={handleNextMonth}
                      aria-label="Next month"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* 3. Tiêu đề các thứ trong tuần (T2 - CN) */}
                  <div className="calendar-weekdays-grid">
                    {weekdays.map((wd) => (
                      <span key={wd} className="cal-weekday-label">
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* 4. Lưới các ngày tròn trịa (Đẹp trong Dark Mode) */}
                  <div className="calendar-days-grid">
                    {/* Ô trống ngày tháng trước */}
                    {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                      <span key={`empty-${idx}`} className="cal-day-cell empty" />
                    ))}

                    {/* Các ngày trong tháng */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isSelected = dueDate === dateStr;
                      const isToday = todayStr === dateStr;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          className={`cal-day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                          onClick={() => {
                            setDueDate(dateStr);
                            setActiveDropdown(null);
                          }}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* 5. Chân lịch: Nút Xóa hạn chót (nếu đang có hạn chót) */}
                  {dueDate && (
                    <div className="calendar-footer-actions">
                      <button
                        type="button"
                        className="cal-clear-btn"
                        onClick={handleClearDueDate}
                      >
                        <Trash2 size={15} className="mr-1" />
                        <span>{t('clearDueDate')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DROPDOWN: NHÃN */}
              {activeDropdown === 'labels' && (
                <div className="tray-content tray-labels-content">
                  <div className="tray-header">
                    <span>{t('noteLabelsLabel')}</span>
                    <button type="button" className="tray-close-btn" onClick={() => setActiveDropdown(null)}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="tray-labels-wrap">
                    {allAvailableLabels.map((lbl) => {
                      const isSelected = selectedLabels.includes(lbl);
                      const color = getLabelColor(lbl);
                      return (
                        <button
                          key={lbl}
                          type="button"
                          className={`tray-label-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleLabel(lbl)}
                        >
                          <span className="label-color-dot" style={{ backgroundColor: color }} />
                          <span>{getLabelDisplayName(lbl, language)}</span>
                          {isSelected && <Check size={14} className="ml-1 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="tray-add-label-row">
                    <input
                      type="text"
                      placeholder={t('newCustomLabelPlaceholder')}
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewLabel();
                        }
                      }}
                      className="form-input-subtle"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewLabel}
                      className="btn-add-label"
                      disabled={!newLabelInput.trim()}
                      title={t('addCustomLabel')}
                    >
                      <Plus size={16} />
                      <span>{t('addCustomLabel')}</span>
                    </button>
                  </div>

                  <div className="tray-footer">
                    <button
                      type="button"
                      className="tray-btn-done ml-auto"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {language === 'vi' ? 'Xong' : 'Done'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. NỘI DUNG (CONTENT - CÓ THỂ ĐỂ TRỐNG) */}
          <div className="form-group-content">
            <textarea
              id="note-content-input"
              rows={4}
              className="form-textarea-streamlined"
              placeholder={t('noteContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 4. NÚT THÊM (HOẶC LƯU) & HỦY */}
          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              <Check size={18} />
              <span>
                {language === 'vi'
                  ? initialNote
                    ? 'Lưu'
                    : 'Thêm'
                  : initialNote
                  ? 'Save'
                  : 'Add'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
