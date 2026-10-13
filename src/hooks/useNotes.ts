import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { NoteItemType, NoteStatus, NotePriority } from '../types';

const NOTES_KEY = 'study_pomodoro_notes';
const CUSTOM_LABELS_KEY = 'study_pomodoro_custom_labels';

export const PRESET_LABELS: { id: string; vi: string; en: string }[] = [
  { id: 'personal', vi: 'Cá nhân', en: 'Personal' },
  { id: 'study', vi: 'Học tập', en: 'Study' },
  { id: 'work', vi: 'Công việc', en: 'Work' },
  { id: 'important', vi: 'Quan trọng', en: 'Important' },
  { id: 'idea', vi: 'Ý tưởng', en: 'Idea' },
  { id: 'reminder', vi: 'Nhắc nhở', en: 'Reminder' },
  { id: 'other', vi: 'Khác', en: 'Other' },
];

export const getLabelDisplayName = (label: string, lang: 'vi' | 'en' = 'vi'): string => {
  const found = PRESET_LABELS.find(
    (p) =>
      p.id === label ||
      p.vi.toLowerCase() === label.toLowerCase() ||
      p.en.toLowerCase() === label.toLowerCase()
  );
  if (found) {
    return lang === 'vi' ? found.vi : found.en;
  }
  return label;
};

const INITIAL_SAMPLE_NOTES: NoteItemType[] = [
  {
    id: 'sample-1',
    title: 'Ôn tập thuật toán Dijkstra & DFS/BFS',
    content: 'Xem lại cách cài đặt PriorityQueue trong Java/TypeScript và làm 3 bài LeetCode Medium.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    labels: ['Học tập', 'Quan trọng'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Chuẩn bị tài liệu thuyết trình môn Mobile Dev',
    content: 'Tạo slide về kiến trúc Capacitor Plugins, so sánh hiệu năng Web Audio API và Local Notifications.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    labels: ['Công việc', 'Học tập'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Ý tưởng bài luận: Kỹ thuật Deep Work',
    content: 'Phương pháp phân đoạn thời gian 25-5 giúp giảm thiểu mệt mỏi nhận thức và nâng cao khả năng ghi nhớ dài hạn.',
    status: 'pending',
    priority: 'none',
    dueDate: null,
    labels: ['Ý tưởng', 'Cá nhân'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const normalizeNotes = (raw: any[]): NoteItemType[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    let labels: string[] = [];
    if (Array.isArray(item.labels) && item.labels.length > 0) {
      labels = item.labels;
    } else if (item.tag) {
      const tagMap: Record<string, string> = {
        study: 'Học tập',
        urgent: 'Quan trọng',
        idea: 'Ý tưởng',
        review: 'Nhắc nhở',
      };
      labels = [tagMap[item.tag] || 'Học tập'];
    } else {
      labels = ['Học tập'];
    }

    return {
      id: item.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: item.title || '',
      content: item.content || '',
      status: (item.status as NoteStatus) || 'pending',
      priority: (item.priority as NotePriority) || 'none',
      dueDate: item.dueDate || null,
      labels,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
  });
};

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteItemType[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes and custom labels from Preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        const [notesRes, labelsRes] = await Promise.all([
          Preferences.get({ key: NOTES_KEY }),
          Preferences.get({ key: CUSTOM_LABELS_KEY }),
        ]);

        if (notesRes.value) {
          const parsed = JSON.parse(notesRes.value);
          setNotes(normalizeNotes(parsed));
        } else {
          setNotes(INITIAL_SAMPLE_NOTES);
          await Preferences.set({
            key: NOTES_KEY,
            value: JSON.stringify(INITIAL_SAMPLE_NOTES),
          });
        }

        if (labelsRes.value) {
          try {
            const parsedLabels = JSON.parse(labelsRes.value);
            if (Array.isArray(parsedLabels)) {
              setCustomLabels(parsedLabels);
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn('Failed to load notes data', e);
        setNotes(INITIAL_SAMPLE_NOTES);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

  const addCustomLabel = useCallback(
    async (labelName: string) => {
      const trimmed = labelName.trim();
      if (!trimmed) return;
      const alreadyPreset = PRESET_LABELS.some(
        (p) =>
          p.vi.toLowerCase() === trimmed.toLowerCase() ||
          p.en.toLowerCase() === trimmed.toLowerCase()
      );
      if (alreadyPreset) return;

      if (!customLabels.includes(trimmed)) {
        const updated = [...customLabels, trimmed];
        setCustomLabels(updated);
        try {
          await Preferences.set({
            key: CUSTOM_LABELS_KEY,
            value: JSON.stringify(updated),
          });
        } catch (err) {
          console.error('Error saving custom labels', err);
        }
      }
    },
    [customLabels]
  );

  const addNote = useCallback(
    async (
      title: string,
      content: string,
      status: NoteStatus = 'pending',
      priority: NotePriority = 'none',
      dueDate: string | null = null,
      labels: string[] = ['Học tập']
    ) => {
      const now = new Date().toISOString();
      const newNote: NoteItemType = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        content: content.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        labels: labels.length > 0 ? labels : ['Học tập'],
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
    async (
      id: string,
      title: string,
      content: string,
      status: NoteStatus,
      priority: NotePriority,
      dueDate: string | null = null,
      labels: string[] = []
    ) => {
      const updated = notes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content: content.trim(),
              status,
              priority,
              dueDate: dueDate || null,
              labels: labels.length > 0 ? labels : ['Học tập'],
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
    customLabels,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    addCustomLabel,
    clearAllNotes,
  };
};
