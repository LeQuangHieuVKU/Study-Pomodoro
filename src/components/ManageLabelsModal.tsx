import React, { useState, useEffect } from 'react';
import { X, Plus, MoreVertical, Trash2, Check, AlertCircle, Tag } from 'lucide-react';
import {
  useNotes,
  DEFAULT_LABEL_COLORS,
  getLabelDisplayName,
} from '../hooks/useNotes';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppLabel } from '../types';

export interface ManageLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const ManageLabelsModal: React.FC<ManageLabelsModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#6366F1',
}) => {
  const { notes, labels, addLabel, updateLabel, deleteLabel } = useNotes();
  const { language } = useLanguage();

  const [newLabelName, setNewLabelName] = useState('');
  const [addError, setAddError] = useState('');

  // Popover state for editing a label
  const [editingPopover, setEditingPopover] = useState<{
    label: AppLabel;
    x: number;
    y: number;
  } | null>(null);
  const [popoverNameInput, setPopoverNameInput] = useState('');
  const [popoverColor, setPopoverColor] = useState('');
  const [popoverError, setPopoverError] = useState('');

  // Confirmation dialog state for deleting
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<AppLabel | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewLabelName('');
      setAddError('');
      setEditingPopover(null);
      setConfirmDeleteLabel(null);
      setPopoverError('');
    }
  }, [isOpen]);

  // Handle Escape and click-outside for popover
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDeleteLabel) {
          setConfirmDeleteLabel(null);
        } else if (editingPopover) {
          setEditingPopover(null);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        editingPopover &&
        !target.closest('.manage-label-popover') &&
        !target.closest('.label-row-menu-btn')
      ) {
        setEditingPopover(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, confirmDeleteLabel, editingPopover, onClose]);

  if (!isOpen) return null;

  // Calculate actual note count per label
  const getNoteCountForLabel = (labelName: string): number => {
    return notes.filter((n) => Array.isArray(n.labels) && n.labels.includes(labelName)).length;
  };

  // Add new label
  const handleAddLabel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLabelName.trim();
    if (!trimmed) return;

    const exists = labels.some(
      (l) => l.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setAddError(language === 'vi' ? 'Tên nhãn đã tồn tại' : 'Label already exists');
      return;
    }

    const success = await addLabel(trimmed);
    if (success) {
      setNewLabelName('');
      setAddError('');
    }
  };

  // Open Popover next to row button
  const handleOpenPopover = (e: React.MouseEvent, label: AppLabel) => {
    e.stopPropagation();
    if (editingPopover?.label.id === label.id) {
      setEditingPopover(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.right - 210;

    if (top + 260 > window.innerHeight) {
      top = Math.max(10, rect.top - 260);
    }
    if (left < 10) {
      left = 10;
    }
    if (left + 220 > window.innerWidth) {
      left = Math.max(10, window.innerWidth - 230);
    }

    setEditingPopover({ label, x: left, y: top });
    setPopoverNameInput(label.name);
    setPopoverColor(label.color);
    setPopoverError('');
  };

  // Save changes from popover
  const handleSavePopoverName = async () => {
    if (!editingPopover) return;
    const trimmed = popoverNameInput.trim();
    if (!trimmed) {
      setPopoverError(language === 'vi' ? 'Tên không được để trống' : 'Name cannot be empty');
      return;
    }

    const existsOther = labels.some(
      (l) => l.id !== editingPopover.label.id && l.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existsOther) {
      setPopoverError(language === 'vi' ? 'Tên nhãn đã tồn tại' : 'Label already exists');
      return;
    }

    await updateLabel(editingPopover.label.id, trimmed, popoverColor);
    setPopoverError('');
    setEditingPopover(null);
  };

  const handleSelectColor = async (colorHex: string) => {
    if (!editingPopover) return;
    setPopoverColor(colorHex);
    const trimmed = popoverNameInput.trim() || editingPopover.label.name;
    await updateLabel(editingPopover.label.id, trimmed, colorHex);
  };

  // Prompt delete confirmation
  const handlePromptDelete = () => {
    if (!editingPopover) return;
    const target = editingPopover.label;
    setEditingPopover(null);
    setConfirmDeleteLabel(target);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!confirmDeleteLabel) return;
    await deleteLabel(confirmDeleteLabel.id);
    setConfirmDeleteLabel(null);
  };

  return (
    <div className="manage-labels-modal-backdrop" onClick={onClose}>
      <div
        className="manage-labels-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="manage-labels-modal-header">
          <h2 className="manage-labels-modal-title">
            {language === 'vi' ? 'Quản lý nhãn' : 'Manage labels'}
          </h2>
          <button
            type="button"
            className="manage-labels-close-btn"
            onClick={onClose}
            aria-label={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Add Label Row */}
        <div className="manage-labels-add-section">
          <form onSubmit={handleAddLabel} className="manage-labels-add-form">
            <div className="manage-labels-input-wrap">
              <Plus size={18} className="add-icon" />
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => {
                  setNewLabelName(e.target.value);
                  if (addError) setAddError('');
                }}
                placeholder={language === 'vi' ? 'Tên nhãn mới…' : 'New label name…'}
                className="manage-labels-input"
              />
            </div>
            <button
              type="submit"
              className="manage-labels-add-btn"
              disabled={!newLabelName.trim()}
              style={{ backgroundColor: accentColor }}
            >
              <span>{language === 'vi' ? 'Thêm' : 'Add'}</span>
            </button>
          </form>
          {addError && <p className="manage-labels-error-text">{addError}</p>}
        </div>

        {/* Labels List */}
        <div className="manage-labels-list-wrap">
          {labels.length === 0 ? (
            <div className="manage-labels-empty-state">
              <Tag size={28} className="empty-tag-icon" />
              <p>{language === 'vi' ? 'Chưa có nhãn nào' : 'No labels yet'}</p>
            </div>
          ) : (
            <div className="manage-labels-list">
              {labels.map((lbl) => {
                const noteCount = getNoteCountForLabel(lbl.name);
                const isPopoverActive = editingPopover?.label.id === lbl.id;

                return (
                  <div
                    key={lbl.id}
                    className={`manage-label-row ${isPopoverActive ? 'popover-active' : ''}`}
                  >
                    <div className="manage-label-row-left">
                      <span
                        className="label-color-dot"
                        style={{ backgroundColor: lbl.color }}
                      />
                      <span className="label-row-title" title={lbl.name}>
                        {getLabelDisplayName(lbl.name, language)}
                      </span>
                    </div>

                    <div className="manage-label-row-right">
                      <span className="label-note-count" title={`${noteCount} tasks`}>
                        {noteCount}
                      </span>
                      <button
                        type="button"
                        className={`label-row-menu-btn ${isPopoverActive ? 'active' : ''}`}
                        onClick={(e) => handleOpenPopover(e, lbl)}
                        title={language === 'vi' ? 'Chỉnh sửa nhãn' : 'Edit label'}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popover Chỉnh sửa nhãn */}
        {editingPopover && (
          <div
            className="manage-label-popover"
            style={{ top: editingPopover.y, left: editingPopover.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input sửa tên */}
            <div className="popover-section">
              <label className="popover-section-title">
                {language === 'vi' ? 'Tên nhãn' : 'Label name'}
              </label>
              <div className="popover-input-row">
                <input
                  type="text"
                  value={popoverNameInput}
                  onChange={(e) => {
                    setPopoverNameInput(e.target.value);
                    if (popoverError) setPopoverError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSavePopoverName();
                    }
                  }}
                  onBlur={handleSavePopoverName}
                  className="popover-name-input"
                  autoFocus
                />
              </div>
              {popoverError && <p className="popover-error-text">{popoverError}</p>}
            </div>

            {/* Bảng chọn màu (6 màu hình tròn) */}
            <div className="popover-section">
              <label className="popover-section-title">
                {language === 'vi' ? 'Màu sắc' : 'Color'}
              </label>
              <div className="popover-colors-grid">
                {DEFAULT_LABEL_COLORS.map((c) => {
                  const isSelected =
                    popoverColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`popover-color-circle ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => handleSelectColor(c.hex)}
                      title={c.name}
                    >
                      {isSelected && <Check size={14} className="color-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="popover-divider" />

            {/* Nút Delete đỏ */}
            <button
              type="button"
              className="popover-delete-btn"
              onClick={handlePromptDelete}
            >
              <Trash2 size={16} />
              <span>{language === 'vi' ? 'Xóa nhãn' : 'Delete'}</span>
            </button>
          </div>
        )}

        {/* Confirmation Dialog khi xóa */}
        {confirmDeleteLabel && (
          <div
            className="manage-label-confirm-backdrop"
            onClick={() => setConfirmDeleteLabel(null)}
          >
            <div
              className="manage-label-confirm-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-icon-wrap">
                <AlertCircle size={26} className="text-red-500" />
              </div>
              <h3 className="confirm-title">
                {language === 'vi'
                  ? `Xóa nhãn "${confirmDeleteLabel.name}"?`
                  : `Delete "${confirmDeleteLabel.name}"?`}
              </h3>
              <p className="confirm-message">
                {language === 'vi'
                  ? `Nhãn này sẽ được gỡ khỏi ${getNoteCountForLabel(confirmDeleteLabel.name)} ghi chú liên quan. Ghi chú của bạn sẽ không bị xóa.`
                  : `This label will be removed from ${getNoteCountForLabel(confirmDeleteLabel.name)} associated notes. Your notes will not be deleted.`}
              </p>
              <div className="confirm-actions-row">
                <button
                  type="button"
                  className="confirm-cancel-btn"
                  onClick={() => setConfirmDeleteLabel(null)}
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={handleConfirmDelete}
                >
                  {language === 'vi' ? 'Xóa' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageLabelsModal;
