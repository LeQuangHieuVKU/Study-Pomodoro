import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
} from '@ionic/react';
import {
  Plus,
  Layers,
  Filter,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  Flag,
  Clock,
  CircleDot,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { NoteItem } from '../components/NoteItem';
import { NoteModal } from '../components/NoteModal';
import { useNotes } from '../hooks/useNotes';
import { useLanguage } from '../i18n/LanguageContext';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';

export const NotesPage: React.FC = () => {
  const { notes, customLabels, addNote, updateNote, deleteNote, addCustomLabel } = useNotes();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  // A. Quick toggle filters
  const [quickUnfinished, setQuickUnfinished] = useState(false);
  const [quickOverdue, setQuickOverdue] = useState(false);
  const [quickHighPriority, setQuickHighPriority] = useState(false);

  // B. Priority toggle chips
  const [selectedPriorities, setSelectedPriorities] = useState<NotePriority[]>([]);

  // C. Status toggle chips
  const [selectedStatuses, setSelectedStatuses] = useState<NoteStatus[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItemType | null>(null);

  // Helper to check if a note is overdue
  const checkIsOverdue = (dateStr?: string | null, status?: NoteStatus): boolean => {
    if (!dateStr) return false;
    if (status === 'completed' || status === 'cancelled') return false;
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

  // Multi-Filter combining Quick, Priority, Status, and Search text
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // 1. Search text in title, content, or labels
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matches =
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (Array.isArray(n.labels) && n.labels.some((l) => l.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      // 2. Quick filters (AND conditions)
      if (quickUnfinished && (n.status === 'completed' || n.status === 'cancelled')) {
        return false;
      }
      if (quickOverdue && !checkIsOverdue(n.dueDate, n.status)) {
        return false;
      }
      if (quickHighPriority && n.priority !== 'high') {
        return false;
      }

      // 3. Priority filter (OR among selected priorities)
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(n.priority)) {
        return false;
      }

      // 4. Status filter (OR among selected statuses)
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(n.status)) {
        return false;
      }

      return true;
    });
  }, [
    notes,
    searchQuery,
    quickUnfinished,
    quickOverdue,
    quickHighPriority,
    selectedPriorities,
    selectedStatuses,
  ]);

  const hasActiveFilters =
    quickUnfinished ||
    quickOverdue ||
    quickHighPriority ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setQuickUnfinished(false);
    setQuickOverdue(false);
    setQuickHighPriority(false);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  const togglePriorityFilter = (priority: NotePriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const toggleStatusFilter = (status: NoteStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItemType) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (
    title: string,
    content: string,
    status: NoteStatus,
    priority: NotePriority,
    dueDate: string | null,
    labels: string[]
  ) => {
    if (editingNote) {
      updateNote(editingNote.id, title, content, status, priority, dueDate, labels);
    } else {
      addNote(title, content, status, priority, dueDate, labels);
    }
  };

  const priorityFilterList: { key: NotePriority; label: string; icon: React.ReactNode }[] = [
    { key: 'high', label: t('priorityHigh'), icon: <Flame size={12} /> },
    { key: 'medium', label: t('priorityMedium'), icon: <Flag size={12} /> },
    { key: 'low', label: t('priorityLow'), icon: <Flag size={12} /> },
  ];

  const statusFilterList: { key: NoteStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: t('statusPending'), icon: <Clock size={12} /> },
    { key: 'todo', label: t('statusTodo'), icon: <CircleDot size={12} /> },
    { key: 'in_progress', label: t('statusInProgress'), icon: <PlayCircle size={12} /> },
    { key: 'completed', label: t('statusCompleted'), icon: <CheckCircle2 size={12} /> },
    { key: 'cancelled', label: t('statusCancelled'), icon: <XCircle size={12} /> },
  ];

  return (
    <IonPage className="notes-page-root">
      <IonHeader className="ion-no-border app-header">
        <IonToolbar className="app-toolbar">
          <div className="header-title-row">
            <div>
              <IonTitle className="page-header-title">{t('notesTitle')}</IonTitle>
              <p className="page-header-subtitle">{t('notesSubtitle')}</p>
            </div>
            <button
              type="button"
              className="header-action-pill-btn"
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              <span>{t('addNote')}</span>
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="notes-content-area">
        <div className="notes-page-wrapper">
          {/* Search bar */}
          <div className="notes-filter-bar">
            <div className="search-input-wrap">
              <IonSearchbar
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
                placeholder={t('searchNotes')}
                debounce={150}
                className="custom-search-input"
              />
            </div>

            {/* TOGGLE CHIPS FILTER SYSTEM */}
            <div className="notes-filter-chips-card">
              <div className="filter-card-header">
                <div className="filter-header-title">
                  <Filter size={14} className="text-indigo-400" />
                  <span>Bộ lọc</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="filter-reset-btn"
                    title={t('clearFilters')}
                  >
                    <RotateCcw size={12} />
                    <span>{t('clearFilters')}</span>
                  </button>
                )}
              </div>

              {/* A. BỘ LỌC NHANH (HÀNG RIÊNG) */}
              <div className="filter-section-group">
                <span className="filter-group-label">{t('filterSectionQuick')}</span>
                <div className="filter-toggle-row">
                  <button
                    type="button"
                    className={`filter-toggle-chip chip-quick ${quickUnfinished ? 'active' : ''}`}
                    onClick={() => setQuickUnfinished(!quickUnfinished)}
                  >
                    <CheckCircle2 size={13} />
                    <span>{t('filterQuickUnfinished')}</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-chip chip-quick chip-quick-overdue ${quickOverdue ? 'active' : ''}`}
                    onClick={() => setQuickOverdue(!quickOverdue)}
                  >
                    <AlertCircle size={13} />
                    <span>{t('filterQuickOverdue')}</span>
                  </button>

                  <button
                    type="button"
                    className={`filter-toggle-chip chip-quick chip-quick-high ${quickHighPriority ? 'active' : ''}`}
                    onClick={() => setQuickHighPriority(!quickHighPriority)}
                  >
                    <Flame size={13} />
                    <span>{t('filterQuickHighPriority')}</span>
                  </button>
                </div>
              </div>

              {/* B. MỨC ƯU TIÊN (CHIPS) */}
              <div className="filter-section-group">
                <span className="filter-group-label">{t('notePriorityLabel')}</span>
                <div className="filter-toggle-row">
                  {priorityFilterList.map((opt) => {
                    const isSelected = selectedPriorities.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className={`filter-toggle-chip priority-chip-${opt.key} ${isSelected ? 'active' : ''}`}
                        onClick={() => togglePriorityFilter(opt.key)}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* C. TRẠNG THÁI (CHIPS) */}
              <div className="filter-section-group">
                <span className="filter-group-label">{t('noteStatusLabel')}</span>
                <div className="filter-toggle-row">
                  {statusFilterList.map((opt) => {
                    const isSelected = selectedStatuses.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className={`filter-toggle-chip status-chip-${opt.key} ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleStatusFilter(opt.key)}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active summary */}
              {hasActiveFilters && (
                <div className="filter-active-summary">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>
                    {filteredNotes.length} {t('filterResultCount')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Grid / List */}
          {filteredNotes.length > 0 ? (
            <div className="notes-list-grid">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEdit}
                  onDelete={deleteNote}
                  t={t}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon-circle">
                <Layers size={36} className="text-indigo-400" />
              </div>
              <h3 className="empty-state-title">
                {hasActiveFilters ? t('noMatchingNotes') : t('noNotes')}
              </h3>
              <p className="empty-state-desc">
                {hasActiveFilters ? 'Thử tắt bớt các chip lọc để xem các ghi chú khác.' : t('noNotesSub')}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="btn-secondary mt-4"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={14} className="mr-1" />
                  <span>{t('clearFilters')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-4"
                  onClick={handleOpenAdd}
                >
                  <Plus size={16} />
                  <span>{t('addNote')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal for adding/editing */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          initialNote={editingNote}
          customLabels={customLabels}
          onAddCustomLabel={addCustomLabel}
          t={t}
          language={language}
        />
      </IonContent>
    </IonPage>
  );
};
