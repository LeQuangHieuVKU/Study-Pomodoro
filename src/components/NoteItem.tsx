import React, { useState } from 'react';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';
import {
  Trash2,
  Edit3,
  Copy,
  Check,
  Clock,
  CircleDot,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Flag,
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { getLabelDisplayName } from '../hooks/useNotes';
import { formatSmartDueDate } from './NoteModal';

interface NoteItemProps {
  note: NoteItemType;
  onEdit: (note: NoteItemType) => void;
  onDelete: (id: string) => void;
  t: (key: any) => string;
  language?: 'vi' | 'en';
}

const getStatusConfig = (status: NoteStatus, t: (key: any) => string) => {
  switch (status) {
    case 'todo':
      return {
        label: t('statusTodo'),
        className: 'status-todo',
        icon: <CircleDot size={12} />,
      };
    case 'in_progress':
      return {
        label: t('statusInProgress'),
        className: 'status-in-progress',
        icon: <PlayCircle size={12} />,
      };
    case 'completed':
      return {
        label: t('statusCompleted'),
        className: 'status-completed',
        icon: <CheckCircle2 size={12} />,
      };
    case 'cancelled':
      return {
        label: t('statusCancelled'),
        className: 'status-cancelled',
        icon: <XCircle size={12} />,
      };
    case 'pending':
    default:
      return {
        label: t('statusPending'),
        className: 'status-pending',
        icon: <Clock size={12} />,
      };
  }
};

const getPriorityConfig = (priority: NotePriority, t: (key: any) => string) => {
  switch (priority) {
    case 'high':
      return {
        label: t('priorityHigh'),
        className: 'priority-high',
        icon: <Flame size={12} />,
      };
    case 'medium':
      return {
        label: t('priorityMedium'),
        className: 'priority-medium',
        icon: <Flag size={12} />,
      };
    case 'low':
      return {
        label: t('priorityLow'),
        className: 'priority-low',
        icon: <Flag size={12} />,
      };
    case 'none':
    default:
      return null;
  }
};

const formatDueDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

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

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onEdit,
  onDelete,
  t,
  language = 'vi',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = getStatusConfig(note.status, t);
  const priorityConfig = getPriorityConfig(note.priority, t);
  const isOverdue = checkIsOverdue(note.dueDate, note.status);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(note.id);
    }, 280);
  };

  const handleCopy = () => {
    const labelsText = note.labels.length > 0 ? `\nNhãn: ${note.labels.join(', ')}` : '';
    const dueText = note.dueDate ? `\nHạn chót: ${formatDueDate(note.dueDate)}` : '';
    navigator.clipboard?.writeText(`${note.title}\n${note.content}${dueText}${labelsText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`note-card ${isDeleting ? 'note-card-exit' : 'note-card-enter'} status-border-${note.status}`}
    >
      {/* Top Meta Bar: Status & Priority Badges */}
      <div className="note-card-header">
        <div className="note-badges-left">
          <span className={`note-status-pill ${statusConfig.className}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>

          {priorityConfig && (
            <span className={`note-priority-pill ${priorityConfig.className}`}>
              {priorityConfig.icon}
              <span>{priorityConfig.label}</span>
            </span>
          )}
        </div>

        <span className="note-date">{formattedDate}</span>
      </div>

      {/* Title & Body */}
      <h3 className={`note-title ${note.status === 'completed' ? 'completed-strike' : ''}`}>
        {note.title}
      </h3>
      {note.content && <p className="note-content-text">{note.content}</p>}

      {/* Due Date & Labels Area */}
      {(note.dueDate || (note.labels && note.labels.length > 0)) && (
        <div className="note-meta-details">
          {/* Due date info */}
          {note.dueDate && (
            <div className={`note-due-date-pill ${isOverdue ? 'is-overdue' : ''}`}>
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{formatSmartDueDate(note.dueDate, language)}</span>
              {isOverdue && <span className="overdue-text">({t('overdueBadge')})</span>}
            </div>
          )}

          {/* Labels chips */}
          {note.labels && note.labels.length > 0 && (
            <div className="note-labels-list">
              {note.labels.map((lbl, idx) => (
                <span key={`${lbl}-${idx}`} className="note-label-chip">
                  <Tag size={10} className="opacity-60" />
                  <span>{getLabelDisplayName(lbl, language)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="note-actions">
        <button
          type="button"
          onClick={handleCopy}
          className="note-action-btn btn-copy"
          title={copied ? t('copied') : 'Copy'}
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>

        <button
          type="button"
          onClick={() => onEdit(note)}
          className="note-action-btn btn-edit"
          title={t('editNote')}
        >
          <Edit3 size={14} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="note-action-btn btn-delete"
          title={t('delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
