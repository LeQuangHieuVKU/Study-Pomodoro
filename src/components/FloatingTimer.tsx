import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Square, X, GripHorizontal } from 'lucide-react';
import type { SessionMode, TimerStatus } from '../types';

interface FloatingTimerProps {
  pipWindow: Window | null;
  isInPageFloating: boolean;
  onClose: () => void;
  mode: SessionMode;
  formattedTime: string;
  progress: number;
  status: TimerStatus;
  accentColor?: string;
  language: 'vi' | 'en';
  onTogglePlay: () => void;
  onStop: () => void;
}

export const FloatingTimer: React.FC<FloatingTimerProps> = ({
  pipWindow,
  isInPageFloating,
  onClose,
  mode,
  formattedTime,
  progress,
  status,
  accentColor = '#6366F1',
  language,
  onTogglePlay,
  onStop,
}) => {
  // Draggable position state for in-page floating fallback
  const [pos, setPos] = useState({
    x: Math.max(16, typeof window !== 'undefined' ? window.innerWidth - 240 : 20),
    y: 84,
  });
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 230, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 270, e.clientY - dragOffsetRef.current.y));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
  };

  const modeTitle =
    mode === 'focus'
      ? language === 'vi' ? 'Tập trung' : 'Focus'
      : mode === 'longBreak'
      ? language === 'vi' ? 'Nghỉ dài' : 'Long Break'
      : language === 'vi' ? 'Nghỉ ngắn' : 'Short Break';

  // SVG Ring calculation
  const size = 130;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  const content = (
    <div className="floating-timer-inner">
      <div className="floating-mode-tag" style={{ color: accentColor }}>
        {modeTitle}
      </div>

      <div className="floating-ring-stage">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="floating-svg-ring">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>

        <div className="floating-time-readout">{formattedTime}</div>
      </div>

      <div className="floating-actions-row">
        <button
          type="button"
          className="floating-ctrl-btn floating-play-btn"
          style={{ backgroundColor: accentColor }}
          onClick={onTogglePlay}
          title={status === 'running' ? (language === 'vi' ? 'Tạm dừng' : 'Pause') : (language === 'vi' ? 'Bắt đầu' : 'Start')}
          aria-label={status === 'running' ? 'Pause' : 'Start'}
        >
          {status === 'running' ? (
            <Pause size={17} fill="#FFFFFF" color="#FFFFFF" />
          ) : (
            <Play size={17} fill="#FFFFFF" color="#FFFFFF" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          className="floating-ctrl-btn floating-stop-btn"
          onClick={onStop}
          title={language === 'vi' ? 'Đặt lại' : 'Stop'}
          aria-label="Stop"
        >
          <Square size={14} fill="currentColor" />
        </button>
      </div>
    </div>
  );

  // 1. If Document Picture-in-Picture window is open, portal directly into it
  if (pipWindow) {
    return createPortal(
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body {
            background: #0B0F19;
            color: #FFFFFF;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            user-select: none;
          }
          .floating-timer-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 8px;
            background: radial-gradient(circle at center, rgba(30, 41, 59, 0.8) 0%, #0B0F19 100%);
          }
          .floating-mode-tag {
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .floating-ring-stage {
            position: relative;
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .floating-svg-ring {
            position: absolute;
            inset: 0;
          }
          .floating-time-readout {
            font-size: 1.85rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            font-variant-numeric: tabular-nums;
            z-index: 2;
            text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
          }
          .floating-actions-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
          }
          .floating-ctrl-btn {
            border: none;
            outline: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: transform 0.15s ease;
          }
          .floating-ctrl-btn:hover {
            transform: scale(1.08);
          }
          .floating-play-btn {
            width: 40px;
            height: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          }
          .floating-stop-btn {
            width: 34px;
            height: 34px;
            background: rgba(239, 68, 68, 0.2);
            color: #F87171;
            border: 1px solid rgba(239, 68, 68, 0.4);
          }
        `}</style>
        {content}
      </>,
      pipWindow.document.body
    );
  }

  // 2. Fallback: in-page draggable floating card
  if (isInPageFloating) {
    return (
      <div
        className="inpage-floating-timer-card"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div
          className="inpage-floating-header"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <GripHorizontal size={14} className="inpage-drag-handle" />
          <button
            type="button"
            className="inpage-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        {content}
      </div>
    );
  }

  return null;
};
