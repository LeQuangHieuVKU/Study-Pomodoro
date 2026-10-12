import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
} from '@ionic/react';
import { Plus, BookOpen, Layers, Sparkles } from 'lucide-react';
import { NoteItem } from '../components/NoteItem';
import { NoteModal } from '../components/NoteModal';
import { useNotes } from '../hooks/useNotes';
import { useLanguage } from '../i18n/LanguageContext';
import type { NoteItemType, NoteTag } from '../types';

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItemType | null>(null);

  // Filter notes by search text & category tag
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || n.tag === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItemType) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (title: string, content: string, tag: NoteTag) => {
    if (editingNote) {
      updateNote(editingNote.id, title, content, tag);
    } else {
      addNote(title, content, tag);
    }
  };

  const filterTabs: { key: string; label: string }[] = [
    { key: 'all', label: t('tagAll') },
    { key: 'study', label: t('tagStudy') },
    { key: 'urgent', label: t('tagUrgent') },
    { key: 'idea', label: t('tagIdea') },
    { key: 'review', label: t('tagReview') },
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
          {/* Search bar & Tag chips */}
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

            <div className="tag-pills-scroll">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedTag(tab.key)}
                  className={`filter-pill-btn ${selectedTag === tab.key ? 'active' : ''}`}
                >
                  {selectedTag === tab.key && <Sparkles size={11} className="mr-1" />}
                  <span>{tab.label}</span>
                </button>
              ))}
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
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon-circle">
                <Layers size={36} className="text-indigo-400" />
              </div>
              <h3 className="empty-state-title">{t('noNotes')}</h3>
              <p className="empty-state-desc">{t('noNotesSub')}</p>
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={handleOpenAdd}
              >
                <Plus size={16} />
                <span>{t('addNote')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal for adding/editing */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          initialNote={editingNote}
          t={t}
        />
      </IonContent>
    </IonPage>
  );
};
