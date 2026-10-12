import React, { useState } from 'react';
import type { NoteItemType, NoteTag } from '../types';
import { Trash2, Edit3, Bookmark, AlertCircle, Lightbulb, BookOpen, Copy, Check } from 'lucide-react';

interface NoteItemProps {
  note: NoteItemType;
  onEdit: (note: NoteItemType) => void;
  onDelete: (id: string) => void;
  t: (key: any) => string;
}

const getTagConfig = (tag: NoteTag, t: (key: any) => string) => {
  switch (tag) {
    case 'urgent':
      return {
        label: t('tagUrgent'),
        className: 'tag-urgent',
        icon: <AlertCircle size={12} />,
      };
    case 'idea':
      return {
        label: t('tagIdea'),
        className: 'tag-idea',
        icon: <Lightbulb size={12} />,
      };
    case 'review':
      return {
        label: t('tagReview'),
        className: 'tag-review',
        icon: <BookOpen size={12} />,
      };
    case 'study':
    default:
      return {
        label: t('tagStudy'),
        className: 'tag-study',
        icon: <Bookmark size={12} />,
      };
  }
};

export const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete, t }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const tagConfig = getTagConfig(note.tag, t);

  const handleDelete = () => {
    setIsDeleting(true);
    // Allow CSS fade-out exit animation before removing from state
    setTimeout(() => {
      onDelete(note.id);
    }, 280);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${note.title}\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`note-card ${isDeleting ? 'note-card-exit' : 'note-card-enter'}`}>
      <div className="note-card-header">
        <span className={`note-tag-pill ${tagConfig.className}`}>
          {tagConfig.icon}
          <span>{tagConfig.label}</span>
        </span>
        <span className="note-date">{formattedDate}</span>
      </div>

      <h3 className="note-title">{note.title}</h3>
      <p className="note-content-text">{note.content}</p>

      <div className="note-actions">
        <button
          type="button"
          onClick={handleCopy}
          className="note-action-btn btn-copy"
          title={copied ? t('copied') : 'Copy'}
        >
          {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
        </button>

        <button
          type="button"
          onClick={() => onEdit(note)}
          className="note-action-btn btn-edit"
          title={t('editNote')}
        >
          <Edit3 size={15} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="note-action-btn btn-delete"
          title={t('delete')}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
