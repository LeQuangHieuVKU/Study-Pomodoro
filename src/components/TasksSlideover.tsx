import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Search,
  Filter,
  Tag,
  Calendar,
  Flame,
  Flag,
  Clock,
  Circle,
  CircleDot,
  CircleDashed,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  ListTodo,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Minus,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Sun,
  Hourglass,
} from 'lucide-react';
import { useNotes, PRESET_LABELS, getLabelDisplayName, getLabelColor } from '../hooks/useNotes';
import { ManageLabelsModal } from './ManageLabelsModal';
import { useLanguage } from '../i18n/LanguageContext';
import { NoteModal, formatSmartDueDate, toLocalDateString } from './NoteModal';
import {
  STATUS_LIST,
  STATUS_CONFIG,
  getStatusLabel,
  StatusIcon,
} from '../constants/statusConfig';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';

interface TasksSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const TasksSlideover: React.FC<TasksSlideoverProps> = ({
  isOpen,
  onClose,
  accentColor = '#6366F1',
}) => {
  const { notes, labels, customLabels, addNote, updateNote, deleteNote, addCustomLabel, deleteCustomLabel } =
    useNotes();
  const { language, t } = useLanguage();

  // Task edit modal state
  const [editingTask, setEditingTask] = useState<NoteItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status popover state for left status icon
  const [statusPopover, setStatusPopover] = useState<{
    taskId: string;
    currentStatus: NoteStatus;
    x: number;
    y: number;
  } | null>(null);

  const handleOpenStatusPopover = (e: React.MouseEvent, task: NoteItemType) => {
    e.stopPropagation();
    if (statusPopover?.taskId === task.id) {
      setStatusPopover(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;

    if (top + 200 > window.innerHeight) {
      top = Math.max(10, rect.top - 200);
    }
    if (left + 190 > window.innerWidth) {
      left = Math.max(10, window.innerWidth - 200);
    }

    setStatusPopover({
      taskId: task.id,
      currentStatus: task.status,
      x: left,
      y: top,
    });
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [quickUnfinished, setQuickUnfinished] = useState(false);
  const [quickOverdue, setQuickOverdue] = useState(false);
  const [quickHighPriority, setQuickHighPriority] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<NotePriority[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<NoteStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isManagingLabels, setIsManagingLabels] = useState(false);
  const [newCustomLabelName, setNewCustomLabelName] = useState('');

  // Quick Add Form state
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<NoteStatus>('todo');
  const [newPriority, setNewPriority] = useState<NotePriority>('none');
  const [newDueDate, setNewDueDate] = useState('');
  const [newLabels, setNewLabels] = useState<string[]>(['Học tập']);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'due' | 'labels' | null>(null);
  const [addMore, setAddMore] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Close dropdowns, panels, or slideover on click outside or Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Close status popover
      if (statusPopover && !target.closest('.status-floating-popover') && !target.closest('.task-row-status-btn')) {
        setStatusPopover(null);
      }

      // Close chip dropdown in quick add form
      if (activeDropdown && !target.closest('.chip-dropdown-wrapper')) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (statusPopover) {
          setStatusPopover(null);
        } else if (activeDropdown) {
          setActiveDropdown(null);
        } else if (showSearch) {
          setShowSearch(false);
          setSearchQuery('');
        } else if (showFilters) {
          setShowFilters(false);
        } else if (isManagingLabels) {
          setIsManagingLabels(false);
        } else if (showAddForm) {
          setShowAddForm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [statusPopover, activeDropdown, showFilters, isManagingLabels, showSearch, showAddForm, onClose]);

  // Calendar calculations
  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekdays = language === 'vi'
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const todayStr = toLocalDateString(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowObj);

  const handleSelectToday = () => {
    const today = new Date();
    setNewDueDate(toLocalDateString(today));
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setActiveDropdown(null);
  };

  const handleSelectTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDueDate(toLocalDateString(tomorrow));
    setCalendarMonth(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
    setActiveDropdown(null);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setNewDueDate(dateStr);
    setActiveDropdown(null);
  };

  const handleClearDueDate = () => {
    setNewDueDate('');
    setActiveDropdown(null);
  };

  // Chip label helpers

  const getPriorityLabel = (p: NotePriority) => {
    switch (p) {
      case 'high': return language === 'vi' ? 'Cao' : 'High';
      case 'medium': return language === 'vi' ? 'Vừa' : 'Medium';
      case 'low': return language === 'vi' ? 'Thấp' : 'Low';
      case 'none':
      default:
        return language === 'vi' ? 'Ưu tiên' : 'Priority';
    }
  };

  const getDueDateLabel = (dateStr: string) => {
    if (!dateStr) return language === 'vi' ? 'Hạn cuối' : 'Due date';
    if (dateStr === todayStr) return language === 'vi' ? 'Hôm nay' : 'Today';
    if (dateStr === tomorrowStr) return language === 'vi' ? 'Ngày mai' : 'Tomorrow';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  };

  const getLabelsChipLabel = () => {
    if (newLabels.length === 0) return language === 'vi' ? 'Nhãn' : 'Labels';
    return getLabelDisplayName(newLabels[0], language);
  };


  // Helper check overdue
  const checkIsOverdue = (dateStr?: string | null, status?: NoteStatus): boolean => {
    if (!dateStr || status === 'completed' || status === 'cancelled') return false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dateStr.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      return due.getTime() < today.getTime();
    } catch {
      return false;
    }
  };

  // Progress metrics
  const totalCount = notes.length;
  const completedCount = notes.filter((n) => n.status === 'completed').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return notes.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matches =
          n.title.toLowerCase().includes(q) ||
          (Array.isArray(n.labels) && n.labels.some((l) => l.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      if (quickUnfinished && (n.status === 'completed' || n.status === 'cancelled')) return false;
      if (quickOverdue && !checkIsOverdue(n.dueDate, n.status)) return false;
      if (quickHighPriority && n.priority !== 'high') return false;

      if (selectedPriorities.length > 0 && !selectedPriorities.includes(n.priority)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(n.status)) return false;

      return true;
    });
  }, [notes, searchQuery, quickUnfinished, quickOverdue, quickHighPriority, selectedPriorities, selectedStatuses]);

  const hasActiveFilters =
    quickUnfinished ||
    quickOverdue ||
    quickHighPriority ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    !!searchQuery;

  const clearAllFilters = () => {
    setSearchQuery('');
    setQuickUnfinished(false);
    setQuickOverdue(false);
    setQuickHighPriority(false);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
  };

  // Split filtered tasks into Open (pending, todo, in_progress) and Closed (completed, cancelled)
  const openTasks = useMemo(() => {
    return filteredTasks.filter(
      (n) => n.status === 'pending' || n.status === 'todo' || n.status === 'in_progress'
    );
  }, [filteredTasks]);

  const closedTasks = useMemo(() => {
    return filteredTasks.filter(
      (n) => n.status === 'completed' || n.status === 'cancelled'
    );
  }, [filteredTasks]);

  // Handle task detail modal
  const handleOpenTaskModal = (task: NoteItemType) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveEditingTask = async (
    title: string,
    content: string,
    status: NoteStatus,
    priority: NotePriority,
    dueDate: string | null,
    labels: string[]
  ) => {
    if (editingTask) {
      await updateNote(editingTask.id, title, content, status, priority, dueDate, labels);
      setEditingTask(null);
      setIsModalOpen(false);
    }
  };

  // Handle Add
  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    await addNote(
      newTitle.trim(),
      '',
      newStatus,
      newPriority,
      newDueDate || null,
      newLabels.length > 0 ? newLabels : ['Học tập']
    );
    setNewTitle('');
    setActiveDropdown(null);
    if (!addMore) {
      setShowAddForm(false);
      setNewDueDate('');
      setNewPriority('none');
      setNewStatus('todo');
      setNewLabels(['Học tập']);
    }
  };

  // Toggle complete / reopen
  const handleToggleTask = async (task: NoteItemType) => {
    const nextStatus: NoteStatus =
      task.status === 'completed' || task.status === 'cancelled' ? 'todo' : 'completed';
    await updateNote(
      task.id,
      task.title,
      task.content || '',
      nextStatus,
      task.priority,
      task.dueDate || null,
      task.labels
    );
  };

  // Delete all closed tasks
  const handleDeleteAllClosed = async () => {
    if (closedTasks.length === 0) return;
    const confirmMsg = t('confirmDeleteAllClosed').replace('{count}', String(closedTasks.length));
    if (window.confirm(confirmMsg)) {
      for (const t of closedTasks) {
        await deleteNote(t.id);
      }
    }
  };

  // Label toggling for new task (Rule 6: Max 1 label)
  const toggleLabelSelection = (label: string) => {
    setNewLabels((prev) => (prev.includes(label) ? [] : [label]));
    setActiveDropdown(null);
  };

  if (!isOpen) return null;

  return (
    <div className="tasks-slideover-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tasks-slideover-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tasks-panel-header-wrap">
          {!showSearch ? (
            <div className="tasks-panel-top-row">
              <h2 className="header-title">{language === 'vi' ? 'Ghi chú' : 'Tasks'}</h2>
              <div className="header-actions-row">
                <button
                  type="button"
                  className="header-tool-btn btn-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSearch(true);
                    setShowFilters(false);
                    setIsManagingLabels(false);
                  }}
                  title={language === 'vi' ? 'Tìm kiếm' : 'Search'}
                  aria-label={language === 'vi' ? 'Tìm kiếm' : 'Search'}
                >
                  <Search size={18} />
                </button>

                <button
                  type="button"
                  className={`header-tool-btn btn-filter ${showFilters || hasActiveFilters ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !showFilters;
                    setShowFilters(next);
                    if (next) {
                      setShowSearch(false);
                      setIsManagingLabels(false);
                    }
                  }}
                  title={language === 'vi' ? 'Bộ lọc' : 'Filters'}
                  aria-label={language === 'vi' ? 'Bộ lọc' : 'Filters'}
                >
                  <Filter size={18} />
                  {hasActiveFilters && <span className="header-filter-dot" style={{ backgroundColor: accentColor }} />}
                </button>

                <button
                  type="button"
                  className={`header-tool-btn btn-labels ${isManagingLabels ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !isManagingLabels;
                    setIsManagingLabels(next);
                    if (next) {
                      setShowSearch(false);
                      setShowFilters(false);
                    }
                  }}
                  title={language === 'vi' ? 'Quản lý nhãn' : 'Manage labels'}
                  aria-label={language === 'vi' ? 'Quản lý nhãn' : 'Manage labels'}
                >
                  <Tag size={18} />
                </button>

                <button
                  type="button"
                  className="header-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  title={language === 'vi' ? 'Đóng' : 'Close'}
                  aria-label={language === 'vi' ? 'Đóng' : 'Close'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="tasks-search-header-row">
              <div
                className="tasks-search-pill-wrap"
                style={{ borderColor: accentColor }}
                onClick={(e) => e.stopPropagation()}
              >
                <Search size={18} className="search-pill-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'vi' ? 'Tìm kiếm công việc…' : 'Search tasks'}
                  className="tasks-search-pill-input"
                  autoFocus
                />
                <button
                  type="button"
                  className="search-pill-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  title={language === 'vi' ? 'Đóng tìm kiếm' : 'Close search'}
                  aria-label={language === 'vi' ? 'Đóng tìm kiếm' : 'Close search'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Progress bar + fraction */}
          <div className="tasks-progress-row">
            <div className="mini-progress-bar-track">
              <div
                className="mini-progress-bar-fill"
                style={{ width: `${progressPercent}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="progress-fraction-text">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* 2. Filter Panel (only when toggled on) */}
        {showFilters && (
          <div className="tasks-filter-dropdown-panel">
            <div className="filter-panel-header">
              <span className="filter-panel-title">
                {language === 'vi' ? 'Bộ lọc' : 'Filters'}
              </span>
              <div className="filter-panel-actions">
                {hasActiveFilters && (
                  <button type="button" className="filter-clear-all-btn" onClick={clearAllFilters}>
                    <RotateCcw size={13} />
                    <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="filter-panel-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilters(false);
                  }}
                  title={language === 'vi' ? 'Đóng' : 'Close'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="filter-group">
              <span className="filter-group-title">{language === 'vi' ? 'Bộ lọc nhanh' : 'Quick filters'}</span>
              <div className="filter-chips-row">
                <button
                  type="button"
                  className={`filter-val-chip ${quickUnfinished ? 'selected' : ''}`}
                  onClick={() => setQuickUnfinished(!quickUnfinished)}
                  style={quickUnfinished ? { borderColor: accentColor, background: `${accentColor}25`, color: '#FFFFFF' } : undefined}
                >
                  <CircleDot size={13} className="text-blue" />
                  <span>{language === 'vi' ? 'Đang mở' : 'Open only'}</span>
                </button>
                <button
                  type="button"
                  className={`filter-val-chip ${quickOverdue ? 'selected' : ''}`}
                  onClick={() => setQuickOverdue(!quickOverdue)}
                  style={quickOverdue ? { borderColor: accentColor, background: `${accentColor}25`, color: '#FFFFFF' } : undefined}
                >
                  <Hourglass size={13} className="text-amber" />
                  <span>{language === 'vi' ? 'Quá hạn' : 'Overdue'}</span>
                </button>
                <button
                  type="button"
                  className={`filter-val-chip ${quickHighPriority ? 'selected' : ''}`}
                  onClick={() => setQuickHighPriority(!quickHighPriority)}
                  style={quickHighPriority ? { borderColor: accentColor, background: `${accentColor}25`, color: '#FFFFFF' } : undefined}
                >
                  <SignalHigh size={13} className="text-red" />
                  <span>{language === 'vi' ? 'Ưu tiên cao' : 'High priority'}</span>
                </button>
              </div>
            </div>

            {/* Priority: High, Medium, Low */}
            <div className="filter-group">
              <span className="filter-group-title">{language === 'vi' ? 'Mức ưu tiên' : 'Priority'}</span>
              <div className="filter-chips-row">
                {(['high', 'medium', 'low'] as NotePriority[]).map((p) => {
                  const isSelected = selectedPriorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`filter-val-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        setSelectedPriorities((prev) =>
                          prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
                        )
                      }
                      style={isSelected ? { borderColor: accentColor, background: `${accentColor}25`, color: '#FFFFFF' } : undefined}
                    >
                      {p === 'high' && <SignalHigh size={13} className="text-red" />}
                      {p === 'medium' && <SignalMedium size={13} className="text-amber" />}
                      {p === 'low' && <SignalLow size={13} className="text-blue" />}
                      <span>
                        {p === 'high'
                          ? language === 'vi' ? 'Cao' : 'High'
                          : p === 'medium'
                          ? language === 'vi' ? 'Vừa' : 'Medium'
                          : language === 'vi' ? 'Thấp' : 'Low'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="filter-group">
              <span className="filter-group-title">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
              <div className="filter-chips-row">
                {STATUS_LIST.map((s) => {
                  const isSelected = selectedStatuses.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`filter-val-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        setSelectedStatuses((prev) =>
                          prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
                        )
                      }
                      style={isSelected ? { borderColor: accentColor, background: `${accentColor}25`, color: '#FFFFFF' } : undefined}
                    >
                      <StatusIcon status={s} size={14} />
                      <span>{getStatusLabel(s, language)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Manage Labels Modal */}
        <ManageLabelsModal
          isOpen={isManagingLabels}
          onClose={() => setIsManagingLabels(false)}
          accentColor={accentColor}
        />

            {/* Quick Add Form Section */}
            <div className="tasks-quick-add-section">
              {!showAddForm ? (
                <button
                  type="button"
                  className="quick-add-trigger-btn"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={18} />
                  <span>{language === 'vi' ? 'Tiêu đề công việc...' : 'New task...'}</span>
                </button>
              ) : (
                <form onSubmit={handleAddTask} className="quick-add-form-card">
                  {/* Row 1: Header / Input with transparent styling and close X button */}
                  <div className="form-input-header-row">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={language === 'vi' ? 'Tiêu đề công việc...' : 'New task...'}
                      className="quick-add-text-input"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="form-close-card-btn"
                      onClick={() => {
                        setShowAddForm(false);
                        setActiveDropdown(null);
                      }}
                      title={language === 'vi' ? 'Đóng' : 'Close'}
                      aria-label={language === 'vi' ? 'Đóng' : 'Close'}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Row 2: Grid 2x2 for attributes (Trạng thái, Ưu tiên, Hạn cuối, Nhãn) */}
                  <div className="form-attributes-grid">
                    {/* Chip 1: Status */}
                    <div className="chip-dropdown-wrapper">
                      <button
                        type="button"
                        className={`form-chip-btn ${activeDropdown === 'status' ? 'active' : ''}`}
                        onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                      >
                        <StatusIcon status={newStatus} size={15} />
                        <span className="chip-text">{getStatusLabel(newStatus, language)}</span>
                        <ChevronDown size={14} className={`chip-chevron ${activeDropdown === 'status' ? 'open' : ''}`} />
                      </button>

                      {activeDropdown === 'status' && (
                        <div className="chip-dropdown-menu status-dropdown">
                          {STATUS_LIST.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`dropdown-item ${newStatus === s ? 'selected' : ''}`}
                              onClick={() => {
                                setNewStatus(s);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className="dropdown-item-left">
                                <StatusIcon status={s} size={16} />
                                <span className="dropdown-item-text">{getStatusLabel(s, language)}</span>
                              </div>
                              {newStatus === s && (
                                <Check size={16} style={{ color: accentColor }} className="dropdown-check-icon" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chip 2: Priority */}
                    <div className="chip-dropdown-wrapper">
                      <button
                        type="button"
                        className={`form-chip-btn ${activeDropdown === 'priority' ? 'active' : ''} ${newPriority !== 'none' ? `priority-active priority-${newPriority}` : ''}`}
                        onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                      >
                        {newPriority === 'high' ? (
                          <SignalHigh size={15} className="chip-icon text-red" />
                        ) : newPriority === 'medium' ? (
                          <SignalMedium size={15} className="chip-icon text-amber" />
                        ) : newPriority === 'low' ? (
                          <SignalLow size={15} className="chip-icon text-blue" />
                        ) : (
                          <Minus size={15} className="chip-icon text-slate" />
                        )}
                        <span className="chip-text">{getPriorityLabel(newPriority)}</span>
                        <ChevronDown size={14} className={`chip-chevron ${activeDropdown === 'priority' ? 'open' : ''}`} />
                      </button>

                      {activeDropdown === 'priority' && (
                        <div className="chip-dropdown-menu priority-dropdown">
                          {[
                            {
                              key: 'none' as NotePriority,
                              label: language === 'vi' ? 'Không có' : 'None',
                              icon: <Minus size={15} className="text-slate" />,
                            },
                            {
                              key: 'high' as NotePriority,
                              label: language === 'vi' ? 'Cao' : 'High',
                              icon: <SignalHigh size={15} className="text-red" />,
                            },
                            {
                              key: 'medium' as NotePriority,
                              label: language === 'vi' ? 'Vừa' : 'Medium',
                              icon: <SignalMedium size={15} className="text-amber" />,
                            },
                            {
                              key: 'low' as NotePriority,
                              label: language === 'vi' ? 'Thấp' : 'Low',
                              icon: <SignalLow size={15} className="text-blue" />,
                            },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              className={`dropdown-item ${newPriority === item.key ? 'selected' : ''}`}
                              onClick={() => {
                                setNewPriority(item.key);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className="dropdown-item-left">
                                {item.icon}
                                <span className="dropdown-item-text">{item.label}</span>
                              </div>
                              {newPriority === item.key && (
                                <Check size={16} style={{ color: accentColor }} className="dropdown-check-icon" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chip 3: Due date */}
                    <div className="chip-dropdown-wrapper">
                      <button
                        type="button"
                        className={`form-chip-btn ${activeDropdown === 'due' ? 'active' : ''} ${newDueDate ? 'due-active' : ''}`}
                        onClick={() => setActiveDropdown(activeDropdown === 'due' ? null : 'due')}
                      >
                        <Calendar size={15} className="chip-icon" />
                        <span className="chip-text">{getDueDateLabel(newDueDate)}</span>
                        <ChevronDown size={14} className={`chip-chevron ${activeDropdown === 'due' ? 'open' : ''}`} />
                      </button>

                      {activeDropdown === 'due' && (
                        <div className="chip-dropdown-menu due-dropdown due-calendar-dropdown">
                          {/* Quick row: Today & Tomorrow */}
                          <div className="cal-quick-row">
                            <button
                              type="button"
                              className={`cal-quick-pill ${newDueDate === todayStr ? 'active' : ''}`}
                              onClick={handleSelectToday}
                            >
                              <Clock size={14} className="text-amber" />
                              <span>{language === 'vi' ? 'Hôm nay' : 'Today'}</span>
                            </button>
                            <button
                              type="button"
                              className={`cal-quick-pill ${newDueDate === tomorrowStr ? 'active' : ''}`}
                              onClick={handleSelectTomorrow}
                            >
                              <Sun size={14} className="text-indigo" />
                              <span>{language === 'vi' ? 'Ngày mai' : 'Tomorrow'}</span>
                            </button>
                          </div>

                          {/* Month Nav */}
                          <div className="cal-month-nav">
                            <button
                              type="button"
                              className="cal-nav-btn"
                              onClick={handlePrevMonth}
                              aria-label="Previous month"
                            >
                              <ChevronLeft size={16} />
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
                              <ChevronRight size={16} />
                            </button>
                          </div>

                          {/* Weekdays */}
                          <div className="cal-weekdays-grid">
                            {weekdays.map((wd) => (
                              <span key={wd} className="cal-weekday-label">
                                {wd}
                              </span>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="cal-days-grid">
                            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                              <span key={`empty-${idx}`} className="cal-day-cell empty" />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                              const dayNum = idx + 1;
                              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                              const isSelected = newDueDate === dateStr;
                              const isToday = todayStr === dateStr;

                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  className={`cal-day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                                  onClick={() => handleSelectDay(dateStr)}
                                  style={isSelected ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                                >
                                  {dayNum}
                                </button>
                              );
                            })}
                          </div>

                          {/* Clear option */}
                          {newDueDate && (
                            <>
                              <div className="dropdown-divider" />
                              <button
                                type="button"
                                className="cal-clear-action-btn"
                                onClick={handleClearDueDate}
                              >
                                <Trash2 size={15} />
                                <span>{language === 'vi' ? 'Xóa hạn chót' : 'Clear due date'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chip 4: Labels */}
                    <div className="chip-dropdown-wrapper">
                      <button
                        type="button"
                        className={`form-chip-btn ${activeDropdown === 'labels' ? 'active' : ''} ${newLabels.length > 0 ? 'labels-active' : ''}`}
                        onClick={() => setActiveDropdown(activeDropdown === 'labels' ? null : 'labels')}
                      >
                        {newLabels.length > 0 ? (
                          <span
                            className="chip-color-dot"
                            style={{ backgroundColor: getLabelColor(newLabels[0], labels) }}
                          />
                        ) : (
                          <Tag size={15} className="chip-icon" />
                        )}
                        <span className="chip-text">{getLabelsChipLabel()}</span>
                        <ChevronDown size={14} className={`chip-chevron ${activeDropdown === 'labels' ? 'open' : ''}`} />
                      </button>

                      {activeDropdown === 'labels' && (
                        <div className="chip-dropdown-menu labels-dropdown">
                          <div className="dropdown-labels-scroll">
                            {labels.map((l) => {
                              const isSel = newLabels.includes(l.name);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  className={`dropdown-item ${isSel ? 'selected' : ''}`}
                                  onClick={() => toggleLabelSelection(l.name)}
                                >
                                  <div className="dropdown-item-left">
                                    <span
                                      className="label-color-dot"
                                      style={{ backgroundColor: l.color }}
                                    />
                                    <span>{getLabelDisplayName(l.name, language)}</span>
                                  </div>
                                  {isSel && <Check size={15} style={{ color: accentColor }} />}
                                </button>
                              );
                            })}
                          </div>

                          <div className="dropdown-divider" />

                          <button
                            type="button"
                            className="dropdown-manage-labels-btn"
                            onClick={() => {
                              setActiveDropdown(null);
                              setIsManagingLabels(true);
                            }}
                          >
                            <Tag size={14} />
                            <span>{language === 'vi' ? 'Quản lý nhãn…' : 'Manage labels…'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Checkbox Add more & Nút Add */}
                  <div className="quick-add-footer-row">
                    <label className="add-more-checkbox-label">
                      <input
                        type="checkbox"
                        checked={addMore}
                        onChange={(e) => setAddMore(e.target.checked)}
                        className="add-more-checkbox"
                        style={{ accentColor }}
                      />
                      <span>{language === 'vi' ? 'Thêm tiếp' : 'Add more'}</span>
                    </label>

                    <div className="quick-add-btn-group">
                      <button
                        type="button"
                        className="form-cancel-btn"
                        onClick={() => {
                          setShowAddForm(false);
                          setActiveDropdown(null);
                        }}
                      >
                        {language === 'vi' ? 'Hủy' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="form-submit-btn"
                        style={{ backgroundColor: accentColor }}
                        disabled={!newTitle.trim()}
                      >
                        <Plus size={17} />
                        <span>{language === 'vi' ? 'Thêm' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Task List (chia 2 nhóm: Open và Closed) */}
            <div className="tasks-list-content">
              {openTasks.length === 0 && closedTasks.length === 0 ? (
                <div className="tasks-empty-state">
                  <ListTodo size={32} className="empty-icon" />
                  <p className="empty-title">
                    {language === 'vi' ? 'Không có công việc nào' : 'No tasks found'}
                  </p>
                  <p className="empty-hint">
                    {hasActiveFilters
                      ? language === 'vi'
                        ? 'Thử xóa các bộ lọc để xem tất cả công việc'
                        : 'Try clearing filters to see all tasks'
                      : language === 'vi'
                      ? 'Thêm công việc đầu tiên ở trên để bắt đầu'
                      : 'Add your first task above to get started'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Nhóm Open (Chờ xử lý, Cần làm, Đang làm) */}
                  {openTasks.length > 0 && (
                    <div className="tasks-group open-group">
                      {openTasks.map((task) => {
                        const isOverdue = checkIsOverdue(task.dueDate, task.status);

                        return (
                          <div
                            key={task.id}
                            className="task-row-item"
                            onClick={() => handleOpenTaskModal(task)}
                          >
                            {/* Trái: icon status */}
                            <button
                              type="button"
                              className={`task-row-status-btn ${statusPopover?.taskId === task.id ? 'active' : ''}`}
                              onClick={(e) => handleOpenStatusPopover(e, task)}
                              title={getStatusLabel(task.status, language)}
                            >
                              <StatusIcon status={task.status} size={18} />
                            </button>

                            {/* Giữa: tên task */}
                            <div className="task-row-middle">
                              <span className="task-row-title">{task.title}</span>
                              {(task.dueDate || task.priority !== 'none' || (task.labels && task.labels.length > 0)) && (
                                <div className="task-row-submeta">
                                  {task.dueDate && (
                                    <span className={`task-submeta-due ${isOverdue ? 'overdue' : ''}`}>
                                      <Calendar size={12} />
                                      <span>{formatSmartDueDate(task.dueDate, language)}</span>
                                      {isOverdue && <AlertCircle size={11} className="overdue-icon" />}
                                    </span>
                                  )}
                                  {task.priority !== 'none' && (
                                    <span className={`task-submeta-priority priority-${task.priority}`}>
                                      {task.priority === 'high' && <SignalHigh size={12} />}
                                      {task.priority === 'medium' && <SignalMedium size={12} />}
                                      {task.priority === 'low' && <SignalLow size={12} />}
                                      <span>
                                        {task.priority === 'high'
                                          ? language === 'vi' ? 'Cao' : 'High'
                                          : task.priority === 'medium'
                                          ? language === 'vi' ? 'Vừa' : 'Med'
                                          : language === 'vi' ? 'Thấp' : 'Low'}
                                      </span>
                                    </span>
                                  )}
                                  {task.labels && task.labels.slice(0, 1).map((lbl) => {
                                    const lblColor = getLabelColor(lbl, labels);
                                    return (
                                      <span
                                        key={lbl}
                                        className="task-submeta-label"
                                        style={{
                                          borderColor: `${lblColor}40`,
                                          backgroundColor: `${lblColor}15`,
                                          color: lblColor,
                                        }}
                                      >
                                        <span className="submeta-label-dot" style={{ backgroundColor: lblColor }} />
                                        <span>{getLabelDisplayName(lbl, language)}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Phải: mũi tên > */}
                            <div className="task-row-right">
                              <button
                                type="button"
                                className="task-row-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(task.id);
                                }}
                                title={language === 'vi' ? 'Xóa công việc' : 'Delete task'}
                              >
                                <Trash2 size={15} />
                              </button>
                              <ChevronRight size={18} className="task-row-arrow" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nhóm Closed (Đã xong, Đã hủy) */}
                  {closedTasks.length > 0 && (
                    <div className="tasks-group closed-group">
                      <div className="closed-group-header">
                        <span className="closed-header-title">
                          {t('statusClosed')} · {closedTasks.length}
                        </span>
                        <button
                          type="button"
                          className="closed-delete-all-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAllClosed();
                          }}
                          title={t('deleteAllClosedTasks')}
                        >
                          <Trash2 size={14} />
                          <span>{language === 'vi' ? 'Xóa tất cả' : 'Delete all'}</span>
                        </button>
                      </div>

                      <div className="closed-tasks-list">
                        {closedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="task-row-item closed-item"
                            onClick={() => handleOpenTaskModal(task)}
                          >
                            {/* Trái: icon status */}
                            <button
                              type="button"
                              className={`task-row-status-btn ${statusPopover?.taskId === task.id ? 'active' : ''}`}
                              onClick={(e) => handleOpenStatusPopover(e, task)}
                              title={getStatusLabel(task.status, language)}
                            >
                              <StatusIcon status={task.status} size={18} />
                            </button>

                            {/* Giữa: tên task */}
                            <div className="task-row-middle">
                              <span className="task-row-title line-through">{task.title}</span>
                            </div>

                            {/* Phải: mũi tên > */}
                            <div className="task-row-right">
                              <button
                                type="button"
                                className="task-row-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(task.id);
                                }}
                                title={language === 'vi' ? 'Xóa công việc' : 'Delete task'}
                              >
                                <Trash2 size={15} />
                              </button>
                              <ChevronRight size={18} className="task-row-arrow" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
      </div>

      {/* Popover chọn Status khi bấm vào icon Status bên trái của task */}
      {statusPopover && (
        <div
          className="status-floating-popover"
          style={{ top: statusPopover.y, left: statusPopover.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="status-popover-header">
            <span>{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
          </div>
          <div className="status-popover-list">
            {STATUS_LIST.map((s) => {
              const isSelected = statusPopover.currentStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={`status-popover-item ${isSelected ? 'selected' : ''}`}
                  onClick={async () => {
                    const tId = statusPopover.taskId;
                    const target = notes.find((n) => n.id === tId);
                    if (target) {
                      await updateNote(
                        target.id,
                        target.title,
                        target.content || '',
                        s,
                        target.priority,
                        target.dueDate || null,
                        target.labels
                      );
                    }
                    setStatusPopover(null);
                  }}
                >
                  <div className="status-popover-item-left">
                    <StatusIcon status={s} size={17} />
                    <span className="status-popover-name">{getStatusLabel(s, language)}</span>
                  </div>
                  {isSelected && (
                    <Check size={16} className="status-popover-check" style={{ color: accentColor }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa chi tiết task khi bấm vào dòng */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEditingTask}
        initialNote={editingTask}
        customLabels={customLabels}
        onAddCustomLabel={addCustomLabel}
        t={t}
        language={language}
      />
    </div>
  );
};
export default TasksSlideover;
