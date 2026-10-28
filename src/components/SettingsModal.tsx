import React, { useState } from 'react';
import {
  X,
  Check,
  Globe,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Plus,
  Minus,
  ChevronDown,
} from 'lucide-react';
import type { AppSettings, AppLanguage, NotificationSoundType } from '../types';
import { soundManager } from '../utils/audioChime';
import { useLanguage } from '../i18n/LanguageContext';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  cycleCount: number;
  onResetCycle: () => void;
  onResetTimer?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  cycleCount,
  onResetCycle,
  onResetTimer,
}) => {
  const { language, setLanguage } = useLanguage();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    onUpdateSetting('language', lang);
  };

  const handleDurationChange = (
    key: 'focusDuration' | 'breakDuration' | 'longBreakDuration',
    delta: number,
    min: number,
    max: number
  ) => {
    const currentVal =
      key === 'longBreakDuration'
        ? settings.longBreakDuration || 15
        : settings[key];
    const nextVal = Math.min(max, Math.max(min, currentVal + delta));
    onUpdateSetting(key, nextVal);
  };

  const handleResetCounters = () => {
    onResetCycle();
    if (onResetTimer) onResetTimer();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2200);
  };

  const handleSoundSelect = (sound: NotificationSoundType) => {
    onUpdateSetting('notificationSound', sound);
    soundManager.playNotification(sound, (settings.alarmVolume ?? 80) / 100);
  };

  const currentVolume = settings.alarmVolume ?? 80;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onUpdateSetting('alarmVolume', val);
  };

  const soundOptions: { id: NotificationSoundType; label: string }[] = [
    { id: 'chime', label: 'Chime' },
    { id: 'bell', label: 'Bell' },
    { id: 'digital', label: 'Digital' },
    { id: 'soft', label: 'Soft' },
    { id: 'wood', label: 'Wood' },
    { id: 'digitalSoft', label: 'Digital Soft' },
  ];

  const activeSound: NotificationSoundType = settings.notificationSound || 'bell';

  return (
    <div className="theme-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="theme-modal-card settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <h2 className="theme-modal-title">{language === 'vi' ? 'Cài đặt' : 'Settings'}</h2>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={onClose}
            aria-label={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="theme-modal-body">
          {/* 1. Language Row */}
          <div className="settings-lang-dropdown-wrapper">
            <button
              type="button"
              className={`settings-lang-row-trigger ${isLangDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              aria-expanded={isLangDropdownOpen}
            >
              <div className="lang-trigger-left">
                <Globe size={16} className="lang-globe-icon" />
                <span className="lang-trigger-label">
                  {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                </span>
              </div>
              <div className="lang-trigger-right">
                <span className="lang-trigger-value">
                  {language === 'vi' ? 'Tiếng Việt' : 'English'}
                </span>
                <ChevronDown
                  size={15}
                  className={`lang-chevron-icon ${isLangDropdownOpen ? 'open' : ''}`}
                />
              </div>
            </button>

            {isLangDropdownOpen && (
              <div className="settings-lang-dropdown-menu">
                <button
                  type="button"
                  className={`lang-dropdown-item ${language === 'en' ? 'active' : ''}`}
                  onClick={() => {
                    handleLanguageChange('en');
                    setIsLangDropdownOpen(false);
                  }}
                >
                  <div className="lang-item-content">
                    <span className="lang-flag">🇺🇸</span>
                    <span className="lang-item-name">English</span>
                  </div>
                  {language === 'en' && (
                    <span className="lang-item-check" style={{ color: settings.accentColor }}>
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`lang-dropdown-item ${language === 'vi' ? 'active' : ''}`}
                  onClick={() => {
                    handleLanguageChange('vi');
                    setIsLangDropdownOpen(false);
                  }}
                >
                  <div className="lang-item-content">
                    <span className="lang-flag">🇻🇳</span>
                    <span className="lang-item-name">Tiếng Việt</span>
                  </div>
                  {language === 'vi' && (
                    <span className="lang-item-check" style={{ color: settings.accentColor }}>
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 2. Session Lengths (3 horizontal columns) */}
          <div className="theme-section">
            <div className="theme-section-header">
              <h3 className="theme-section-title">
                {language === 'vi' ? 'Thời lượng phiên' : 'Session lengths'}
              </h3>
            </div>

            <div className="settings-session-lengths-grid">
              {/* Focus */}
              <div className="session-col">
                <span className="session-col-title">
                  {language === 'vi' ? 'Tập trung' : 'Focus'}
                </span>
                <div className="session-stepper">
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('focusDuration', -5, 1, 90)}
                    disabled={settings.focusDuration <= 1}
                    aria-label="Decrease focus"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="session-stepper-val">
                    {settings.focusDuration} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('focusDuration', 5, 1, 90)}
                    disabled={settings.focusDuration >= 90}
                    aria-label="Increase focus"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Short break */}
              <div className="session-col">
                <span className="session-col-title">
                  {language === 'vi' ? 'Nghỉ ngắn' : 'Short break'}
                </span>
                <div className="session-stepper">
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('breakDuration', -1, 1, 30)}
                    disabled={settings.breakDuration <= 1}
                    aria-label="Decrease short break"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="session-stepper-val">
                    {settings.breakDuration} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('breakDuration', 1, 1, 30)}
                    disabled={settings.breakDuration >= 30}
                    aria-label="Increase short break"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Long break */}
              <div className="session-col">
                <span className="session-col-title">
                  {language === 'vi' ? 'Nghỉ dài' : 'Long break'}
                </span>
                <div className="session-stepper">
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('longBreakDuration', -5, 1, 60)}
                    disabled={(settings.longBreakDuration || 15) <= 1}
                    aria-label="Decrease long break"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="session-stepper-val">
                    {settings.longBreakDuration || 15} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="session-stepper-btn"
                    onClick={() => handleDurationChange('longBreakDuration', 5, 1, 60)}
                    disabled={(settings.longBreakDuration || 15) >= 60}
                    aria-label="Increase long break"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Reset Current Counters */}
          <div className="settings-reset-row">
            <button
              type="button"
              className={`settings-reset-chip-btn ${resetSuccess ? 'success' : ''}`}
              onClick={handleResetCounters}
            >
              <RotateCcw size={14} className={resetSuccess ? 'spin-anim' : ''} />
              <span>
                {resetSuccess
                  ? (language === 'vi' ? 'Đã đặt lại ✓' : 'Reset done ✓')
                  : (language === 'vi' ? 'Đặt lại bộ đếm' : 'Reset current counters')}
              </span>
            </button>
            {cycleCount > 0 && (
              <span className="settings-cycle-badge">
                {language === 'vi' ? `Chu kỳ: ${cycleCount}` : `Cycle: ${cycleCount}`}
              </span>
            )}
          </div>

          {/* 4. Auto-start */}
          <div className="theme-section">
            <div className="settings-toggle-card">
              <div className="toggle-row">
                <span className="toggle-title">
                  {language === 'vi' ? 'Tự bắt đầu nghỉ' : 'Auto-start breaks'}
                </span>
                <button
                  type="button"
                  className={`settings-switch ${settings.autoStartBreaks ? 'active' : ''}`}
                  style={{
                    backgroundColor: settings.autoStartBreaks ? settings.accentColor : undefined,
                  }}
                  onClick={() => onUpdateSetting('autoStartBreaks', !settings.autoStartBreaks)}
                  role="switch"
                  aria-checked={Boolean(settings.autoStartBreaks)}
                >
                  <span className="switch-thumb" />
                </button>
              </div>

              <div className="toggle-divider" />

              <div className="toggle-row">
                <span className="toggle-title">
                  {language === 'vi' ? 'Tự bắt đầu tập trung' : 'Auto-start focus'}
                </span>
                <button
                  type="button"
                  className={`settings-switch ${settings.autoStartFocus ? 'active' : ''}`}
                  style={{
                    backgroundColor: settings.autoStartFocus ? settings.accentColor : undefined,
                  }}
                  onClick={() => onUpdateSetting('autoStartFocus', !settings.autoStartFocus)}
                  role="switch"
                  aria-checked={Boolean(settings.autoStartFocus)}
                >
                  <span className="switch-thumb" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. Alarm */}
          <div className="theme-section">
            <div className="settings-alarm-card">
              <div className="toggle-row">
                <span className="toggle-title">
                  {language === 'vi' ? 'Âm báo' : 'Alarm'}
                </span>
                <button
                  type="button"
                  className={`settings-switch ${settings.soundEnabled ? 'active' : ''}`}
                  style={{
                    backgroundColor: settings.soundEnabled ? settings.accentColor : undefined,
                  }}
                  onClick={() => onUpdateSetting('soundEnabled', !settings.soundEnabled)}
                  role="switch"
                  aria-checked={settings.soundEnabled}
                >
                  <span className="switch-thumb" />
                </button>
              </div>

              <div className="sound-chips-row">
                {soundOptions.map((opt) => {
                  const isSelected = activeSound === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`sound-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSoundSelect(opt.id)}
                      disabled={!settings.soundEnabled}
                      style={
                        isSelected && settings.soundEnabled && settings.accentColor
                          ? {
                              borderColor: settings.accentColor,
                              backgroundColor: `${settings.accentColor}24`,
                            }
                          : undefined
                      }
                    >
                      <span className="sound-chip-title">{opt.label}</span>
                      {isSelected && (
                        <span
                          className="sound-chip-check"
                          style={{ backgroundColor: settings.accentColor }}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Volume Control at Bottom */}
          <div className="settings-volume-footer">
            <div className="volume-label-row">
              <div className="volume-label-left">
                {currentVolume === 0 ? (
                  <VolumeX size={15} />
                ) : currentVolume < 50 ? (
                  <Volume1 size={15} />
                ) : (
                  <Volume2 size={15} />
                )}
                <span className="volume-title">
                  {language === 'vi' ? 'Âm lượng' : 'Volume'}
                </span>
              </div>
              <span className="volume-val-badge">{currentVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentVolume}
              onChange={handleVolumeChange}
              disabled={!settings.soundEnabled}
              className="settings-volume-slider"
              style={{
                accentColor: settings.accentColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
