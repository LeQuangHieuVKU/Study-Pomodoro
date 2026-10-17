import type { AccentColorItem, BgImagePreset } from '../types';
import lofiBg from '../assets/backgrounds/lofi.png';
import cyberpunkBg from '../assets/backgrounds/cyberpunk.jpg';
import cafeBg from '../assets/backgrounds/cafe.png';

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

export const PRESET_BG_IMAGES: BgImagePreset[] = [
  {
    id: 'fantasy',
    nameVi: 'Thế Giới Ảo',
    nameEn: 'Fantasy World',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pastel',
    nameVi: 'Pastel Dịu Êm',
    nameEn: 'Soft Pastel',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'lofi',
    nameVi: 'Không Gian Lofi',
    nameEn: 'Lofi Study Aesthetic',
    url: lofiBg,
  },
  {
    id: 'cyberpunk',
    nameVi: 'Cyberpunk Neon',
    nameEn: 'Cyberpunk Neon',
    url: cyberpunkBg,
  },
  {
    id: 'cafe',
    nameVi: 'Quán Cafe Ấm Áp',
    nameEn: 'Cozy Cafe',
    url: cafeBg,
  },
  {
    id: 'forest',
    nameVi: 'Rừng Sương Mù',
    nameEn: 'Misty Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'night',
    nameVi: 'Bầu Trời Đêm',
    nameEn: 'Starry Sky',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'study',
    nameVi: 'Bàn Học Tối Giản',
    nameEn: 'Study Desk',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  },
];
