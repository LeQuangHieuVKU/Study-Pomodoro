import React, { useState, useEffect } from 'react';
import type { NoteItemType, NoteTag } from '../types';
import { X, Check, Bookmark, AlertCircle, Lightbulb, BookOpen } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, tag: NoteTag) => void;
  initialNote?: NoteItemType | null;
  t: (key: any) => string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  t,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<NoteTag>('study');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTag(initialNote.tag);
    } else {
      setTitle('');
      setContent('');
      setTag('study');
    }
    setError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề ghi chú');
      return;
    }
    onSave(title, content, tag);
    onClose();
  };

  const tagOptions: { key: NoteTag; label: string; icon: React.ReactNode }[] = [
    { key: 'study', label: t('tagStudy'), icon: <Bookmark size={14} /> },
    { key: 'urgent', label: t('tagUrgent'), icon: <AlertCircle size={14} /> },
    { key: 'idea', label: t('tagIdea'), icon: <Lightbulb size={14} /> },
    { key: 'review', label: t('tagReview'), icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="note-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {initialNote ? t('editNote') : t('addNote')}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t('cancel')}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Tag Selection */}
          <div className="form-group">
            <label className="form-label">{t('noteTagLabel')}</label>
            <div className="tag-selector-row">
              {tagOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTag(opt.key)}
                  className={`tag-choice-btn tag-${opt.key} ${tag === opt.key ? 'selected' : ''}`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-title-input">
              {t('noteTitleLabel')}
            </label>
            <input
              id="note-title-input"
              type="text"
              className="form-input"
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

          {/* Content */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-content-input">
              {t('noteContentLabel')}
            </label>
            <textarea
              id="note-content-input"
              rows={4}
              className="form-textarea"
              placeholder={t('noteContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Check size={16} />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
