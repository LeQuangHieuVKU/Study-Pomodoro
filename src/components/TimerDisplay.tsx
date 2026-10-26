import React from 'react';
import type { SessionMode, TimerStatus } from '../types';
import { Flame, Coffee, Eye } from 'lucide-react';

// Defer 3D Three.js particle orb so initial SVG timer ring paints instantly without WebGL overhead
const Focus3DOrb = React.lazy(() => import('./Focus3DOrb').then(m => ({ default: m.Focus3DOrb })));

interface TimerDisplayProps {
  mode: SessionMode;
  status: TimerStatus;
  cycleCount?: number;
  progress: number;
  formattedTime: string;
  isAwake: boolean;
  accentColor?: string;
  t: (key: any) => string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  status,
  cycleCount = 0,
  progress,
  formattedTime,
  isAwake,
  accentColor = '#6366F1',
  t,
}) => {
  // SVG Ring calculations
  const size = 300;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from 0 (full circle remaining) to 1 (all done)
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  const isFocus = mode === 'focus';
  const isLongBreak = mode === 'longBreak';

  return (
    <div className={`timer-display-container ${isFocus ? 'mode-focus' : isLongBreak ? 'mode-long-break' : 'mode-break'} status-${status}`}>
      {/* 3D Ambient Orb layer with dynamic accent color (async lazy loaded) */}
      <div className="orb-backdrop">
        <React.Suspense fallback={null}>
          <Focus3DOrb
            mode={mode}
            status={status}
            progress={progress}
            accentColor={isLongBreak ? '#F59E0B' : accentColor}
          />
        </React.Suspense>
      </div>

      {/* SVG Circular Progress Ring */}
      <svg
        className="timer-svg-ring"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="60%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>

          <linearGradient id="longBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer track background */}
        <circle
          className="timer-ring-track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress Ring */}
        <circle
          className="timer-ring-progress"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={
            isFocus
              ? 'url(#focusGradient)'
              : isLongBreak
              ? 'url(#longBreakGradient)'
              : 'url(#breakGradient)'
          }
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
          filter="url(#glow)"
        />
      </svg>

      {/* Center Digital Readout & State Badges */}
      <div className="timer-center-content">
        {/* Status Pill with Cycle Fraction */}
        <div className={`session-pill ${isFocus ? 'pill-focus' : isLongBreak ? 'pill-long-break' : 'pill-break'}`}>
          {isFocus ? (
            <>
              <Flame size={15} className="pill-icon animate-pulse" />
              <span>{t('focusSession')}</span>
            </>
          ) : isLongBreak ? (
            <>
              <Coffee size={15} className="pill-icon text-amber-500" />
              <span>{t('longBreakSession')}</span>
            </>
          ) : (
            <>
              <Coffee size={15} className="pill-icon" />
              <span>{t('shortBreakSession')}</span>
            </>
          )}
        </div>

        {/* Pomodoro 4-session Cycle Dots */}
        <div className="cycle-progress-badge" title={`${t('cycleLabel')}: ${cycleCount}/4`}>
          <div className="cycle-dots-row">
            {[1, 2, 3, 4].map((step) => {
              const isFilled = step <= cycleCount;
              const isNext = step === cycleCount + 1 && isFocus;
              return (
                <span
                  key={step}
                  className={`cycle-dot ${isFilled ? 'filled' : ''} ${isNext ? 'current' : ''}`}
                />
              );
            })}
          </div>
          <span className="cycle-number">{cycleCount}/4</span>
        </div>

        {/* Giant Countdown Digits */}
        <div className="time-digits" aria-live="polite">
          {formattedTime}
        </div>



        {/* Keep Awake micro-indicator */}
        {isAwake && status === 'running' && (
          <div className="keep-awake-badge" title={t('keepAwakeActive')}>
            <Eye size={12} />
            <span>{t('keepAwakeActive')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
