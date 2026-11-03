import type { AccentColorItem, BgImagePreset } from '../types';

export const PRESET_ACCENT_COLORS: AccentColorItem[] = [
  { id: 'indigo', hex: '#6366F1', nameVi: 'Xanh Tím', nameEn: 'Modern Indigo' },
  { id: 'blue', hex: '#3B82F6', nameVi: 'Xanh Dương', nameEn: 'Ocean Blue' },
  { id: 'cyan', hex: '#06B6D4', nameVi: 'Xanh Ngọc', nameEn: 'Vibrant Cyan' },
  { id: 'emerald', hex: '#10B981', nameVi: 'Xanh Lục', nameEn: 'Fresh Emerald' },
  { id: 'amber', hex: '#F59E0B', nameVi: 'Cam Hổ Phách', nameEn: 'Warm Amber' },
  { id: 'rose', hex: '#EC4899', nameVi: 'Hồng Tinh Tế', nameEn: 'Subtle Rose' },
  { id: 'violet', hex: '#8B5CF6', nameVi: 'Tím Mộng Mơ', nameEn: 'Deep Violet' },
  { id: 'teal', hex: '#14B8A6', nameVi: 'Xanh Biển Sâu', nameEn: 'Calm Teal' },
];

export const PRESET_ALIAS_MAP: Record<string, string> = {
  night: 'sky',
  study: 'desk',
};

export const PRESET_BG_IMAGES: BgImagePreset[] = [
  {
    id: 'fantasy',
    nameVi: 'Thế giới ảo',
    nameEn: 'Fantasy',
    url: '/backgrounds/fantasy-dark.png',
    lightUrl: '/backgrounds/fantasy-light.png',
    darkUrl: '/backgrounds/fantasy-dark.png',
  },
  {
    id: 'pastel',
    nameVi: 'Pastel',
    nameEn: 'Pastel',
    url: '/backgrounds/pastel-dark.png',
    lightUrl: '/backgrounds/pastel-light.png',
    darkUrl: '/backgrounds/pastel-dark.png',
  },
  {
    id: 'lofi',
    nameVi: 'Lofi',
    nameEn: 'Lofi',
    url: '/backgrounds/lofi-dark.png',
    lightUrl: '/backgrounds/lofi-light.png',
    darkUrl: '/backgrounds/lofi-dark.png',
  },
  {
    id: 'cyberpunk',
    nameVi: 'Cyberpunk',
    nameEn: 'Cyberpunk',
    url: '/backgrounds/cyberpunk-dark.png',
    lightUrl: '/backgrounds/cyberpunk-light.png',
    darkUrl: '/backgrounds/cyberpunk-dark.png',
  },
  {
    id: 'cafe',
    nameVi: 'Quán cafe',
    nameEn: 'Cafe',
    url: '/backgrounds/cafe-dark.png',
    lightUrl: '/backgrounds/cafe-light.png',
    darkUrl: '/backgrounds/cafe-dark.png',
  },
  {
    id: 'forest',
    nameVi: 'Rừng sương',
    nameEn: 'Forest',
    url: '/backgrounds/forest-dark.png',
    lightUrl: '/backgrounds/forest-light.png',
    darkUrl: '/backgrounds/forest-dark.png',
  },
  {
    id: 'sky',
    nameVi: 'Bầu trời',
    nameEn: 'Sky',
    url: '/backgrounds/sky-dark.png',
    lightUrl: '/backgrounds/sky-light.png',
    darkUrl: '/backgrounds/sky-dark.png',
  },
  {
    id: 'desk',
    nameVi: 'Bàn học',
    nameEn: 'Desk',
    url: '/backgrounds/desk-dark.png',
    lightUrl: '/backgrounds/desk-light.png',
    darkUrl: '/backgrounds/desk-dark.png',
  },
];
