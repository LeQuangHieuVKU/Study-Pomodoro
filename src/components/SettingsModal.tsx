import React, { useState } from 'react';
import {
  X,
  Check,
  Settings,
  Globe,
  Clock,
  RotateCcw,
  PlayCircle,
  Volume2,
  VolumeX,
  Volume1,
  Plus,
  Minus,
  Sparkles,
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
  const { language, setLanguage, t } = useLanguage();
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
          <div className="theme-modal-title-group">
            <div className="settings-header-badge">
              <Settings size={18} className="settings-gear-spin-subtle" />
              <h2 className="theme-modal-title">{language === 'vi' ? 'Cài đặt' : 'Settings'}</h2>
            </div>
            <p className="theme-modal-subtitle">
              {language === 'vi'
                ? 'Tùy chỉnh thời lượng phiên, ngôn ngữ và âm báo'
                : 'Customize session lengths, language and alarms'}
            </p>
          </div>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={onClose}
            aria-label={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="theme-modal-body">
          {/* MỤC A: LANGUAGE */}
          <div className="theme-section">
            <div className="theme-section-header">
              <div className="section-title-with-icon">
                <Globe size={16} />
                <h3 className="theme-section-title">
                  {language === 'vi' ? 'A. Ngôn ngữ' : 'A. Language'}
                </h3>
              </div>
              <span className="theme-section-hint">
                {language === 'vi'
                  ? 'Chọn ngôn ngữ hiển thị trên toàn bộ ứng dụng'
                  : 'Choose display language across the entire application'}
              </span>
            </div>

            <div className="settings-lang-dropdown-wrapper">
              <button
                type="button"
                className={`settings-lang-row-trigger ${isLangDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                aria-expanded={isLangDropdownOpen}
              >
                <div className="lang-trigger-left">
                  <Globe size={17} className="lang-globe-icon" />
                  <span className="lang-trigger-label">
                    {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                  </span>
                </div>
                <div className="lang-trigger-right">
                  <span className="lang-trigger-value">
                    {language === 'vi' ? 'Tiếng Việt' : 'English'}
                  </span>
                  <ChevronDown
                    size={16}
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
          </div>

          {/* MỤC B: SESSION LENGTHS */}
          <div className="theme-section">
            <div className="theme-section-header">
              <div className="section-title-with-icon">
                <Clock size={16} />
                <h3 className="theme-section-title">
                  {language === 'vi' ? 'B. Thời lượng phiên' : 'B. Session lengths'}
                </h3>
              </div>
              <span className="theme-section-hint">
                {language === 'vi'
                  ? 'Tùy chỉnh độ dài các phiên Pomodoro (phút)'
                  : 'Customize Pomodoro session durations (minutes)'}
              </span>
            </div>

            <div className="settings-steppers-list">
              {/* Focus */}
              <div className="settings-stepper-row">
                <div className="stepper-label-group">
                  <span className="stepper-title">
                    {language === 'vi' ? 'Tập trung' : 'Focus'}
                  </span>
                  <span className="stepper-subtext">
                    {language === 'vi' ? 'Mặc định: 25 phút' : 'Default: 25 min'}
                  </span>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('focusDuration', -5, 1, 90)}
                    disabled={settings.focusDuration <= 1}
                    aria-label="Giảm Focus"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="stepper-val">
                    {settings.focusDuration} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('focusDuration', 5, 1, 90)}
                    disabled={settings.focusDuration >= 90}
                    aria-label="Tăng Focus"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Short break */}
              <div className="settings-stepper-row">
                <div className="stepper-label-group">
                  <span className="stepper-title">
                    {language === 'vi' ? 'Nghỉ ngắn' : 'Short break'}
                  </span>
                  <span className="stepper-subtext">
                    {language === 'vi' ? 'Mặc định: 5 phút' : 'Default: 5 min'}
                  </span>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('breakDuration', -1, 1, 30)}
                    disabled={settings.breakDuration <= 1}
                    aria-label="Giảm Short break"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="stepper-val">
                    {settings.breakDuration} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('breakDuration', 1, 1, 30)}
                    disabled={settings.breakDuration >= 30}
                    aria-label="Tăng Short break"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Long break */}
              <div className="settings-stepper-row">
                <div className="stepper-label-group">
                  <span className="stepper-title">
                    {language === 'vi' ? 'Nghỉ dài' : 'Long break'}
                  </span>
                  <span className="stepper-subtext">
                    {language === 'vi' ? 'Mặc định: 15 phút' : 'Default: 15 min'}
                  </span>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('longBreakDuration', -5, 1, 60)}
                    disabled={(settings.longBreakDuration || 15) <= 1}
                    aria-label="Giảm Long break"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="stepper-val">
                    {settings.longBreakDuration || 15} {language === 'vi' ? 'phút' : 'min'}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleDurationChange('longBreakDuration', 5, 1, 60)}
                    disabled={(settings.longBreakDuration || 15) >= 60}
                    aria-label="Tăng Long break"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MỤC C: RESET CURRENT COUNTERS */}
          <div className="theme-section">
            <div className="theme-section-header">
              <div className="section-title-with-icon">
                <RotateCcw size={16} />
                <h3 className="theme-section-title">
                  {language === 'vi' ? 'C. Đặt lại bộ đếm' : 'C. Reset current counters'}
                </h3>
              </div>
              <span className="theme-section-hint">
                {language === 'vi'
                  ? 'Đặt lại bộ đếm chu kỳ và số phiên hoàn thành hiện tại'
                  : 'Reset completed session cycle counter to 0'}
              </span>
            </div>

            <div className="settings-counter-card">
              <div className="counter-info-side">
                <span className="counter-label">
                  {language === 'vi' ? 'Bộ đếm phiên hiện tại' : 'Current session counter'}
                </span>
                <span className="counter-badge">
                  {language === 'vi'
                    ? `Phiên ${cycleCount + 1}/4 • Chu kỳ ${cycleCount}`
                    : `Session ${cycleCount + 1}/4 • Cycle ${cycleCount}`}
                </span>
              </div>
              <button
                type="button"
                className={`reset-counter-btn ${resetSuccess ? 'success' : ''}`}
                onClick={handleResetCounters}
              >
                <RotateCcw size={15} className={resetSuccess ? 'spin-anim' : ''} />
                <span>
                  {resetSuccess
                    ? (language === 'vi' ? 'Đã đặt lại ✓' : 'Reset done ✓')
                    : (language === 'vi' ? 'Đặt lại về 0' : 'Reset to 0')}
                </span>
              </button>
            </div>
          </div>

          {/* MỤC D: AUTO-START */}
          <div className="theme-section">
            <div className="theme-section-header">
              <div className="section-title-with-icon">
                <PlayCircle size={16} />
                <h3 className="theme-section-title">
                  {language === 'vi' ? 'D. Tự động chuyển phiên' : 'D. Auto-start'}
                </h3>
              </div>
              <span className="theme-section-hint">
                {language === 'vi'
                  ? 'Tự động chuyển tiếp phiên mà không cần bấm thủ công'
                  : 'Seamless transitions without manual interaction'}
              </span>
            </div>

            <div className="settings-toggle-card">
              <div className="toggle-row">
                <div className="toggle-text-block">
                  <span className="toggle-title">
                    {language === 'vi' ? 'Tự động nghỉ' : 'Auto-start breaks'}
                  </span>
                  <span className="toggle-desc">
                    {language === 'vi'
                      ? 'Tự động chạy thời gian nghỉ khi hết phiên tập trung'
                      : 'Automatically start break when focus finishes'}
                  </span>
                </div>
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
                <div className="toggle-text-block">
                  <span className="toggle-title">
                    {language === 'vi' ? 'Tự động học' : 'Auto-start focus'}
                  </span>
                  <span className="toggle-desc">
                    {language === 'vi'
                      ? 'Tự động bắt đầu phiên tập trung mới khi hết giờ nghỉ'
                      : 'Automatically start focus when break finishes'}
                  </span>
                </div>
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

          {/* MỤC E: ALARM */}
          <div className="theme-section">
            <div className="theme-section-header">
              <div className="section-title-with-icon">
                <Volume2 size={16} />
                <h3 className="theme-section-title">
                  {language === 'vi' ? 'E. Âm báo' : 'E. Alarm'}
                </h3>
              </div>
              <span className="theme-section-hint">
                {language === 'vi'
                  ? 'Cấu hình chuông báo và âm lượng khi hoàn thành phiên'
                  : 'Configure completion chime and sound volume'}
              </span>
            </div>

            <div className="settings-alarm-card">
              {/* Row 1: Bật/Tắt Alarm */}
              <div className="toggle-row">
                <div className="toggle-text-block">
                  <span className="toggle-title">
                    {language === 'vi' ? 'Bật âm báo' : 'Enable alarm'}
                  </span>
                </div>
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

              {/* Row 2: Chọn loại âm thanh (Chime / Bell / Digital) */}
              <div className="alarm-sound-section">
                <span className="alarm-sublabel">
                  {language === 'vi' ? 'Loại âm thanh' : 'Sound type'}
                </span>
                <div className="sound-options-row">
                  {soundOptions.map((opt) => {
                    const isSelected = activeSound === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`sound-chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSoundSelect(opt.id)}
                        disabled={!settings.soundEnabled}
                      >
                        <span className="sound-chip-title">{opt.label}</span>
                        {isSelected && (
                          <span className="sound-chip-check" style={{ backgroundColor: settings.accentColor }}>
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Thanh Volume */}
              <div className="alarm-volume-section">
                <div className="volume-label-row">
                  <div className="volume-label-group">
                    {currentVolume === 0 ? (
                      <VolumeX size={16} />
                    ) : currentVolume < 50 ? (
                      <Volume1 size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                    <span className="volume-label">
                      {language === 'vi' ? 'Âm lượng chuông' : 'Alarm Volume'}
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
      </div>
    </div>
  );
};
export default SettingsModal;
