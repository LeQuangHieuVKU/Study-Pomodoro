import { useState, useEffect, useCallback, useMemo } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { NoteItemType, NoteStatus, NotePriority, AppLabel } from '../types';

const NOTES_KEY = 'study_pomodoro_notes';
const LABELS_KEY = 'study_pomodoro_labels_v2';
const LEGACY_CUSTOM_LABELS_KEY = 'study_pomodoro_custom_labels';

export const DEFAULT_LABEL_COLORS = [
  { id: 'blue', hex: '#3B82F6', name: 'Blue' },
  { id: 'purple', hex: '#8B5CF6', name: 'Purple' },
  { id: 'teal', hex: '#06B6D4', name: 'Teal' },
  { id: 'green', hex: '#10B981', name: 'Green' },
  { id: 'rose', hex: '#F43F5E', name: 'Rose' },
  { id: 'amber', hex: '#F59E0B', name: 'Amber' },
];

export const INITIAL_DEFAULT_LABELS: AppLabel[] = [
  { id: 'study', name: 'Học tập', color: '#3B82F6' },
  { id: 'work', name: 'Công việc', color: '#8B5CF6' },
  { id: 'personal', name: 'Cá nhân', color: '#06B6D4' },
  { id: 'important', name: 'Quan trọng', color: '#F43F5E' },
  { id: 'idea', name: 'Ý tưởng', color: '#F59E0B' },
  { id: 'reminder', name: 'Nhắc nhở', color: '#10B981' },
];

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
  if (!label) return '';
  const found = PRESET_LABELS.find(
    (p) =>
      p.id.toLowerCase() === label.toLowerCase() ||
      p.vi.toLowerCase() === label.toLowerCase() ||
      p.en.toLowerCase() === label.toLowerCase()
  );
  if (found) {
    return lang === 'vi' ? found.vi : found.en;
  }
  return label;
};

export const getLabelColor = (labelName: string, allLabels: AppLabel[] = []): string => {
  if (!labelName) return DEFAULT_LABEL_COLORS[0].hex;

  // 1. Check in custom/provided labels
  const found = allLabels.find(
    (l) =>
      l.name.toLowerCase() === labelName.toLowerCase() ||
      l.id.toLowerCase() === labelName.toLowerCase()
  );
  if (found) return found.color;

  // 2. Check in initial presets
  const preset = INITIAL_DEFAULT_LABELS.find(
    (p) =>
      p.name.toLowerCase() === labelName.toLowerCase() ||
      p.id.toLowerCase() === labelName.toLowerCase()
  );
  if (preset) return preset.color;

  // 3. Fallback deterministic hash
  let hash = 0;
  for (let i = 0; i < labelName.length; i++) {
    hash = labelName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DEFAULT_LABEL_COLORS.length;
  return DEFAULT_LABEL_COLORS[idx].hex;
};

const INITIAL_SAMPLE_NOTES: NoteItemType[] = [
  {
    id: 'sample-1',
    title: 'Ôn tập thuật toán Dijkstra & DFS/BFS',
    content: 'Xem lại cách cài đặt PriorityQueue trong Java/TypeScript và làm 3 bài LeetCode Medium.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    labels: ['Học tập'],
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
    labels: ['Công việc'],
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
    labels: ['Ý tưởng'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Enforce rule 6: Each note has at most 1 label
const normalizeNotes = (raw: any[]): NoteItemType[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    let labels: string[] = [];
    if (Array.isArray(item.labels) && item.labels.length > 0) {
      labels = [item.labels[0]]; // Max 1 label
    } else if (item.tag) {
      const tagMap: Record<string, string> = {
        study: 'Học tập',
        urgent: 'Quan trọng',
        idea: 'Ý tưởng',
        review: 'Nhắc nhở',
      };
      labels = [tagMap[item.tag] || 'Học tập'];
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

const parseLoadedLabels = (rawJson?: string | null): AppLabel[] | null => {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            id: `label-${idx}-${item.toLowerCase().replace(/\s+/g, '-')}`,
            name: item,
            color: DEFAULT_LABEL_COLORS[idx % DEFAULT_LABEL_COLORS.length].hex,
          };
        }
        return {
          id: item.id || `label-${idx}`,
          name: item.name || '',
          color: item.color || DEFAULT_LABEL_COLORS[idx % DEFAULT_LABEL_COLORS.length].hex,
        };
      });
    }
  } catch {
    // Ignore parse error
  }
  return null;
};

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteItemType[]>([]);
  const [labels, setLabels] = useState<AppLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived legacy customLabels array
  const customLabels = useMemo(() => labels.map((l) => l.name), [labels]);

  // Load notes and labels from Preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        const [notesRes, labelsV2Res, legacyLabelsRes] = await Promise.all([
          Preferences.get({ key: NOTES_KEY }),
          Preferences.get({ key: LABELS_KEY }),
          Preferences.get({ key: LEGACY_CUSTOM_LABELS_KEY }),
        ]);

        // Notes
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

        // Labels
        const parsedV2 = parseLoadedLabels(labelsV2Res.value);
        if (parsedV2) {
          setLabels(parsedV2);
        } else {
          // Check legacy custom labels
          const parsedLegacy = parseLoadedLabels(legacyLabelsRes.value);
          if (parsedLegacy && parsedLegacy.length > 0) {
            // Merge with initial defaults
            const merged = [...INITIAL_DEFAULT_LABELS];
            parsedLegacy.forEach((cl) => {
              if (!merged.some((m) => m.name.toLowerCase() === cl.name.toLowerCase())) {
                merged.push(cl);
              }
            });
            setLabels(merged);
            await Preferences.set({
              key: LABELS_KEY,
              value: JSON.stringify(merged),
            });
          } else {
            setLabels(INITIAL_DEFAULT_LABELS);
            await Preferences.set({
              key: LABELS_KEY,
              value: JSON.stringify(INITIAL_DEFAULT_LABELS),
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load notes data', e);
        setNotes(INITIAL_SAMPLE_NOTES);
        setLabels(INITIAL_DEFAULT_LABELS);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Cross-component sync
    const handleSync = async () => {
      try {
        const [notesRes, labelsV2Res] = await Promise.all([
          Preferences.get({ key: NOTES_KEY }),
          Preferences.get({ key: LABELS_KEY }),
        ]);
        if (notesRes.value) {
          setNotes(normalizeNotes(JSON.parse(notesRes.value)));
        }
        if (labelsV2Res.value) {
          const parsed = parseLoadedLabels(labelsV2Res.value);
          if (parsed) setLabels(parsed);
        }
      } catch (err) {
        console.warn('Sync failed', err);
      }
    };

    window.addEventListener('study_notes_changed', handleSync);
    return () => window.removeEventListener('study_notes_changed', handleSync);
  }, []);

  const saveNotes = async (newNotes: NoteItemType[]) => {
    setNotes(newNotes);
    try {
      await Preferences.set({
        key: NOTES_KEY,
        value: JSON.stringify(newNotes),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('study_notes_changed'));
      }
    } catch (err) {
      console.error('Error saving notes to preferences', err);
    }
  };

  const saveLabels = async (newLabels: AppLabel[]) => {
    setLabels(newLabels);
    try {
      await Preferences.set({
        key: LABELS_KEY,
        value: JSON.stringify(newLabels),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('study_notes_changed'));
      }
    } catch (err) {
      console.error('Error saving labels to preferences', err);
    }
  };

  // Add a new label
  const addLabel = useCallback(
    async (labelName: string, color?: string): Promise<boolean> => {
      const trimmed = labelName.trim();
      if (!trimmed) return false;

      // Duplicate check (case-insensitive)
      const isDuplicate = labels.some(
        (l) => l.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) return false;

      const chosenColor =
        color || DEFAULT_LABEL_COLORS[labels.length % DEFAULT_LABEL_COLORS.length].hex;

      const newLabel: AppLabel = {
        id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        color: chosenColor,
      };

      const updated = [...labels, newLabel];
      await saveLabels(updated);
      return true;
    },
    [labels]
  );

  // Update a label (rename or change color)
  const updateLabel = useCallback(
    async (id: string, newName: string, newColor?: string): Promise<boolean> => {
      const trimmed = newName.trim();
      if (!trimmed) return false;

      const targetIndex = labels.findIndex((l) => l.id === id);
      if (targetIndex === -1) return false;

      const oldLabel = labels[targetIndex];

      // Check duplicate name with other labels
      const isDuplicate = labels.some(
        (l) => l.id !== id && l.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) return false;

      const updatedColor = newColor || oldLabel.color;
      const updatedLabel: AppLabel = {
        ...oldLabel,
        name: trimmed,
        color: updatedColor,
      };

      const updatedLabels = [...labels];
      updatedLabels[targetIndex] = updatedLabel;
      await saveLabels(updatedLabels);

      // If name changed, update all notes that had this label name
      if (oldLabel.name !== trimmed) {
        const updatedNotes = notes.map((note) => {
          if (note.labels && note.labels.includes(oldLabel.name)) {
            return {
              ...note,
              labels: note.labels.map((l) => (l === oldLabel.name ? trimmed : l)),
              updatedAt: new Date().toISOString(),
            };
          }
          return note;
        });
        await saveNotes(updatedNotes);
      }
      return true;
    },
    [labels, notes]
  );

  // Delete a label and unlink it from all associated notes
  const deleteLabel = useCallback(
    async (id: string): Promise<boolean> => {
      const target = labels.find((l) => l.id === id || l.name === id);
      if (!target) return false;

      const updatedLabels = labels.filter((l) => l.id !== target.id);
      await saveLabels(updatedLabels);

      // Remove label from all notes that had it (notes are NOT deleted!)
      const updatedNotes = notes.map((note) => {
        if (note.labels && note.labels.includes(target.name)) {
          return {
            ...note,
            labels: note.labels.filter((l) => l !== target.name),
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });

      await saveNotes(updatedNotes);
      return true;
    },
    [labels, notes]
  );

  // Backward compatibility methods
  const addCustomLabel = useCallback(
    async (labelName: string): Promise<void> => {
      await addLabel(labelName);
    },
    [addLabel]
  );

  const deleteCustomLabel = useCallback(
    async (labelName: string): Promise<void> => {
      await deleteLabel(labelName);
    },
    [deleteLabel]
  );

  // Add Note with max 1 label rule
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
      // Enforce max 1 label
      const singleLabel = labels.length > 0 ? [labels[0]] : [];
      const newNote: NoteItemType = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        content: content.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        labels: singleLabel,
        createdAt: now,
        updatedAt: now,
        completedAt: status === 'completed' ? now : undefined,
      };
      const updated = [newNote, ...notes];
      await saveNotes(updated);
      return newNote;
    },
    [notes]
  );

  // Update Note with max 1 label rule
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
      const singleLabel = labels.length > 0 ? [labels[0]] : [];
      const updated = notes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content: content.trim(),
              status,
              priority,
              dueDate: dueDate || null,
              labels: singleLabel,
              updatedAt: new Date().toISOString(),
              completedAt:
                status === 'completed'
                  ? (note.status === 'completed' && note.completedAt ? note.completedAt : new Date().toISOString())
                  : undefined,
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
    labels,
    customLabels,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    addLabel,
    updateLabel,
    deleteLabel,
    addCustomLabel,
    deleteCustomLabel,
    clearAllNotes,
  };
};
