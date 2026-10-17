import React, { useState } from 'react';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';
import {
  Trash2,
  Edit3,
  Copy,
  Check,
  Flame,
  Flag,
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { getLabelDisplayName, getLabelColor } from '../hooks/useNotes';
import { formatSmartDueDate } from './NoteModal';
import { getStatusConfig, getStatusLabel, StatusIcon } from '../constants/statusConfig';

interface NoteItemProps {
  note: NoteItemType;
  onEdit: (note: NoteItemType) => void;
  onDelete: (id: string) => void;
  t: (key: any) => string;
  language?: 'vi' | 'en';
}

const getPriorityConfig = (priority: NotePriority, t: (key: any) => string) => {
  switch (priority) {
    case 'high':
      return {
        label: t('priorityHigh'),
        className: 'priority-high',
        icon: <Flame size={14} />,
      };
    case 'medium':
      return {
        label: t('priorityMedium'),
        className: 'priority-medium',
        icon: <Flag size={14} />,
      };
    case 'low':
      return {
        label: t('priorityLow'),
        className: 'priority-low',
        icon: <Flag size={14} />,
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

  const statusCfg = getStatusConfig(note.status);
  const statusLabel = getStatusLabel(note.status, language);
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
          <span className={`note-status-pill ${statusCfg.className}`}>
            <StatusIcon status={note.status} size={14} />
            <span>{statusLabel}</span>
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
              {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
              <span>{formatSmartDueDate(note.dueDate, language)}</span>
              {isOverdue && <span className="overdue-text">({t('overdueBadge')})</span>}
            </div>
          )}

          {/* Labels chips */}
          {note.labels && note.labels.length > 0 && (
            <div className="note-labels-list">
              {note.labels.slice(0, 1).map((lbl, idx) => {
                const color = getLabelColor(lbl);
                return (
                  <span
                    key={`${lbl}-${idx}`}
                    className="note-label-chip"
                    style={{
                      borderColor: `${color}40`,
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  >
                    <span className="label-color-dot-mini" style={{ backgroundColor: color }} />
                    <span>{getLabelDisplayName(lbl, language)}</span>
                  </span>
                );
              })}
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
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>

        <button
          type="button"
          onClick={() => onEdit(note)}
          className="note-action-btn btn-edit"
          title={t('editNote')}
        >
          <Edit3 size={16} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="note-action-btn btn-delete"
          title={t('delete')}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
