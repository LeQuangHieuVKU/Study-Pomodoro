import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { NoteItemType, NoteTag } from '../types';

const NOTES_KEY = 'study_pomodoro_notes';

const INITIAL_SAMPLE_NOTES: NoteItemType[] = [
  {
    id: 'sample-1',
    title: 'Ôn tập thuật toán Dijkstra & DFS/BFS',
    content: 'Xem lại cách cài đặt PriorityQueue trong Java/TypeScript và làm 3 bài LeetCode Medium.',
    tag: 'study',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Chuẩn bị tài liệu thuyết trình môn Mobile Dev',
    content: 'Tạo slide về kiến trúc Capacitor Plugins, so sánh hiệu năng Web Audio API và Local Notifications.',
    tag: 'urgent',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Ý tưởng bài luận: Kỹ thuật Deep Work',
    content: 'Phương pháp phân đoạn thời gian 25-5 giúp giảm thiểu mệt mỏi nhận thức và nâng cao khả năng ghi nhớ dài hạn.',
    tag: 'idea',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from Preferences
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { value } = await Preferences.get({ key: NOTES_KEY });
        if (value) {
          const parsed = JSON.parse(value);
          setNotes(parsed);
        } else {
          // Initialize with helpful demo notes
          setNotes(INITIAL_SAMPLE_NOTES);
          await Preferences.set({
            key: NOTES_KEY,
            value: JSON.stringify(INITIAL_SAMPLE_NOTES),
          });
        }
      } catch (e) {
        console.warn('Failed to load notes', e);
        setNotes(INITIAL_SAMPLE_NOTES);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const saveNotes = async (newNotes: NoteItemType[]) => {
    setNotes(newNotes);
    try {
      await Preferences.set({
        key: NOTES_KEY,
        value: JSON.stringify(newNotes),
      });
    } catch (err) {
      console.error('Error saving notes to preferences', err);
    }
  };

  const addNote = useCallback(
    async (title: string, content: string, tag: NoteTag = 'study') => {
      const now = new Date().toISOString();
      const newNote: NoteItemType = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        content: content.trim(),
        tag,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newNote, ...notes];
      await saveNotes(updated);
      return newNote;
    },
    [notes]
  );

  const updateNote = useCallback(
    async (id: string, title: string, content: string, tag: NoteTag) => {
      const updated = notes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content: content.trim(),
              tag,
              updatedAt: new Date().toISOString(),
            }
          : note
      );
      await saveNotes(updated);
    },
    [notes]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      await saveNotes(updated);
    },
    [notes]
  );

  const clearAllNotes = useCallback(async () => {
    setNotes([]);
    await Preferences.remove({ key: NOTES_KEY });
  }, []);

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    clearAllNotes,
  };
};
