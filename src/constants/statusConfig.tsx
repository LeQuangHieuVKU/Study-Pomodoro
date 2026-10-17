import React from 'react';
import { CircleDashed, Circle, CircleDot, CheckCircle2, XCircle } from 'lucide-react';
import type { NoteStatus, AppLanguage } from '../types';

export interface StatusItemConfig {
  id: NoteStatus;
  label: {
    vi: string;
    en: string;
  };
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;
  color: string;
  bgColor: string;
  className: string;
}

export const STATUS_LIST: NoteStatus[] = [
  'pending',
  'todo',
  'in_progress',
  'completed',
  'cancelled',
];

export const STATUS_CONFIG: Record<NoteStatus, StatusItemConfig> = {
  pending: {
    id: 'pending',
    label: { vi: 'Chờ xử lý', en: 'Backlog' },
    icon: CircleDashed,
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    className: 'status-pending',
  },
  todo: {
    id: 'todo',
    label: { vi: 'Cần làm', en: 'Todo' },
    icon: Circle,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    className: 'status-todo',
  },
  in_progress: {
    id: 'in_progress',
    label: { vi: 'Đang làm', en: 'In Progress' },
    icon: CircleDot,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    className: 'status-in_progress',
  },
  completed: {
    id: 'completed',
    label: { vi: 'Đã xong', en: 'Done' },
    icon: CheckCircle2,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    className: 'status-completed',
  },
  cancelled: {
    id: 'cancelled',
    label: { vi: 'Đã hủy', en: 'Canceled' },
    icon: XCircle,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    className: 'status-cancelled',
  },
};

/**
 * Safely get status configuration, falling back to 'pending' if invalid/undefined
 */
export const getStatusConfig = (status?: NoteStatus | string): StatusItemConfig => {
  if (status && status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as NoteStatus];
  }
  return STATUS_CONFIG.pending;
};

/**
 * Get localized display name for a given status
 */
export const getStatusLabel = (status?: NoteStatus | string, lang: AppLanguage = 'vi'): string => {
  const cfg = getStatusConfig(status);
  return lang === 'vi' ? cfg.label.vi : cfg.label.en;
};

/**
 * Standard Status Icon component used across the entire application
 */
export interface StatusIconProps {
  status?: NoteStatus | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 18,
  className = '',
  style = {},
  color,
}) => {
  const cfg = getStatusConfig(status);
  const IconComponent = cfg.icon;
  const strokeWidth = cfg.id === 'todo' ? 1.8 : 2;
  const iconColor = color || cfg.color;

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`status-icon ${cfg.className} ${className}`}
      style={{ color: iconColor, ...style }}
    />
  );
};
