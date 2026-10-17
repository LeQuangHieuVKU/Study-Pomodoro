import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonAlert,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import {
  ArrowLeft,
  Clock,
  Coffee,
  Vibrate,
  Moon,
  Volume2,
  RefreshCw,
  Globe,
  Trash2,
  BookOpen,
  ShieldCheck,
  Palette,
  Image as ImageIcon,
  Check,
  Upload,
  Ban,
  Waves,
  Eye,
  CloudRain,
  Sun,
  Bell,
  Play,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import type { AppSettings, AppLanguage, BackgroundEffectType } from '../types';
import { PRESET_ACCENT_COLORS, PRESET_BG_IMAGES } from '../data/themePresets';
import { soundManager, NOTIFICATION_SOUNDS } from '../utils/audioChime';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  onUploadCustomBg: (file: File) => Promise<void>;
  onRemoveCustomBg: () => Promise<void>;
  onResetAllData: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSetting,
  onUploadCustomBg,
  onRemoveCustomBg,
  onResetAllData,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const router = useIonRouter();
  const { isHeaderHidden, handleIonScroll } = useHeaderScroll();
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    onUpdateSetting('language', lang);
  };

  const handleConfirmReset = async () => {
    await onResetAllData();
    setShowToast(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadCustomBg(file);
    }
  };

  const bgEffectOptions: { key: BackgroundEffectType; labelKey: any; icon: React.ReactNode }[] = [
    { key: 'none', labelKey: 'effectNone', icon: <Ban size={16} /> },
    { key: 'gradient', labelKey: 'effectGradient', icon: <Palette size={16} /> },
    { key: 'particles', labelKey: 'effectParticles', icon: <Eye size={16} /> },
    { key: 'wave', labelKey: 'effectWave', icon: <Waves size={16} /> },
    { key: 'rain', labelKey: 'effectRain', icon: <CloudRain size={16} /> },
  ];

  return (
    <IonPage className="settings-page-root">
      <IonHeader className={`ion-no-border app-header ${isHeaderHidden ? 'header-hidden' : ''}`}>
        <IonToolbar className="app-toolbar">
          <div className="header-title-row">
            <div className="header-left-group">
              <button
                type="button"
                className="header-back-button"
                onClick={() => router.push('/timer', 'back')}
                title="Quay lại Timer"
                aria-label="Quay lại"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <IonTitle className="page-header-title">{t('settingsTitle')}</IonTitle>
                <p className="page-header-subtitle">{t('settingsSubtitle')}</p>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        scrollEvents={true}
        onIonScroll={handleIonScroll}
        className="settings-content-area"
      >
        <div className="settings-page-wrapper">
          {/* Section 1: Màu nhấn (Accent Color) */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('accentColorSection')}</h3>
            <p className="settings-group-subdesc">{t('accentColorDesc')}</p>

            <div className="setting-card">
              {/* Live Preview Bar */}
              <div className="accent-preview-banner">
                <div
                  className="accent-preview-circle"
                  style={{ backgroundColor: settings.accentColor }}
                />
                <div className="accent-preview-text">
                  <span className="accent-preview-title">{t('previewPill')}</span>
                  <span className="accent-preview-hex">{settings.accentColor}</span>
                </div>
                <button
                  type="button"
                  className="preview-test-btn"
                  style={{
                    backgroundColor: settings.accentColor,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <span>Nút mẫu</span>
                </button>
              </div>

              {/* Color Swatches Grid */}
              <div className="color-swatches-grid">
                {PRESET_ACCENT_COLORS.map((col) => {
                  const isSelected = settings.accentColor.toLowerCase() === col.hex.toLowerCase();
                  const colName = language === 'vi' ? col.nameVi : col.nameEn;

                  return (
                    <button
                      key={col.id}
                      type="button"
                      className={`color-swatch-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onUpdateSetting('accentColor', col.hex)}
                      title={colName}
                      aria-label={colName}
                    >
                      <div
                        className="color-circle"
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                      <span className="color-label">{colName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Hiệu ứng nền (Background Effect) */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('bgEffectSection')}</h3>
            <p className="settings-group-subdesc">{t('bgEffectDesc')}</p>

            <div className="setting-card">
              <div className="effect-options-grid">
                {bgEffectOptions.map((eff) => {
                  const isSelected = settings.backgroundEffect === eff.key;
                  return (
                    <button
                      key={eff.key}
                      type="button"
                      className={`effect-option-card ${isSelected ? 'active' : ''}`}
                      onClick={() => onUpdateSetting('backgroundEffect', eff.key)}
                    >
                      <div className="effect-icon-box">
                        {eff.icon}
                      </div>
                      <span className="effect-title">{t(eff.labelKey)}</span>
                      {isSelected && (
                        <div className="active-badge-indicator">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Hình nền (Background Image) */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('bgImageSection')}</h3>
            <p className="settings-group-subdesc">{t('bgImageDesc')}</p>

            <div className="setting-card">
              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div className="bg-image-cards-grid">
                {/* No image option */}
                <button
                  type="button"
                  className={`bg-preset-thumb-card ${settings.backgroundImage === 'none' ? 'selected' : ''}`}
                  onClick={() => onUpdateSetting('backgroundImage', 'none')}
                >
                  <div className="thumb-no-image">
                    <Ban size={22} className="text-slate-400" />
                  </div>
                  <span className="thumb-name">{t('noBgImage')}</span>
                  {settings.backgroundImage === 'none' && (
                    <div className="thumb-check-pill">
                      <Check size={12} />
                    </div>
                  )}
                </button>

                {/* Preset image cards */}
                {PRESET_BG_IMAGES.map((preset) => {
                  const isSelected = settings.backgroundImage === preset.id;
                  const name = language === 'vi' ? preset.nameVi : preset.nameEn;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`bg-preset-thumb-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => onUpdateSetting('backgroundImage', preset.id)}
                    >
                      <div
                        className="thumb-image"
                        style={{ backgroundImage: `url(${preset.url})` }}
                      />
                      <span className="thumb-name">{name}</span>
                      {isSelected && (
                        <div className="thumb-check-pill">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Custom User Uploaded Image Card */}
                {settings.customBgData && (
                  <button
                    type="button"
                    className={`bg-preset-thumb-card ${settings.backgroundImage === 'custom' ? 'selected' : ''}`}
                    onClick={() => onUpdateSetting('backgroundImage', 'custom')}
                  >
                    <div
                      className="thumb-image"
                      style={{ backgroundImage: `url(${settings.customBgData})` }}
                    />
                    <span className="thumb-name">{t('customImageActive')}</span>
                    {settings.backgroundImage === 'custom' && (
                      <div className="thumb-check-pill">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                )}
              </div>

              {/* Upload actions row */}
              <div className="custom-bg-actions-row">
                <button
                  type="button"
                  className="btn-upload-custom"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>{t('uploadCustomBg')}</span>
                </button>

                {settings.customBgData && (
                  <button
                    type="button"
                    className="btn-remove-custom"
                    onClick={onRemoveCustomBg}
                    title={t('removeCustomBg')}
                  >
                    <Trash2 size={16} />
                    <span>{t('removeCustomBg')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Giao Diện & Ngôn Ngữ */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('appearanceSection')}</h3>

            {/* Dark Mode */}
            <div className="setting-card setting-toggle-row">
              <div className="setting-info">
                <div className="setting-icon-box icon-blue">
                  <Moon size={18} />
                </div>
                <div>
                  <span className="setting-name">{t('darkModeLabel')}</span>
                  <span className="setting-description">{t('darkModeDesc')}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => onUpdateSetting('darkMode', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Language Selector */}
            <div className="setting-card">
              <div className="setting-header mb-3">
                <div className="setting-info">
                  <div className="setting-icon-box icon-rose">
                    <Globe size={18} />
                  </div>
                  <div>
                    <span className="setting-name">{t('languageLabel')}</span>
                    <span className="setting-description">Tiếng Việt / English</span>
                  </div>
                </div>
              </div>

              <div className="segmented-lang-control">
                <button
                  type="button"
                  className={`lang-segment-btn ${language === 'vi' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('vi')}
                >
                  <span>🇻🇳 Tiếng Việt</span>
                </button>
                <button
                  type="button"
                  className={`lang-segment-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span>🇬🇧 English</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Durations */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('durationSection')}</h3>

            {/* Focus Duration */}
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-info">
                  <div className="setting-icon-box icon-indigo">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="setting-name">{t('focusDurationLabel')}</span>
                    <span className="setting-description">
                      {settings.focusDuration} {t('minutesSuffix')}
                    </span>
                  </div>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.focusDuration <= 5}
                    onClick={() => onUpdateSetting('focusDuration', Math.max(5, settings.focusDuration - 5))}
                  >
                    -
                  </button>
                  <span className="stepper-value">{settings.focusDuration}m</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.focusDuration >= 90}
                    onClick={() => onUpdateSetting('focusDuration', Math.min(90, settings.focusDuration + 5))}
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={settings.focusDuration}
                onChange={(e) => onUpdateSetting('focusDuration', Number(e.target.value))}
                className="custom-range-slider slider-indigo"
              />
            </div>

            {/* Break Duration */}
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-info">
                  <div className="setting-icon-box icon-emerald">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <span className="setting-name">{t('breakDurationLabel')}</span>
                    <span className="setting-description">
                      {settings.breakDuration} {t('minutesSuffix')}
                    </span>
                  </div>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.breakDuration <= 1}
                    onClick={() => onUpdateSetting('breakDuration', Math.max(1, settings.breakDuration - 1))}
                  >
                    -
                  </button>
                  <span className="stepper-value">{settings.breakDuration}m</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.breakDuration >= 30}
                    onClick={() => onUpdateSetting('breakDuration', Math.min(30, settings.breakDuration + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={settings.breakDuration}
                onChange={(e) => onUpdateSetting('breakDuration', Number(e.target.value))}
                className="custom-range-slider slider-emerald"
              />
            </div>

            {/* Long Break Duration */}
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-info">
                  <div className="setting-icon-box icon-amber">
                    <Sun size={18} />
                  </div>
                  <div>
                    <span className="setting-name">{t('longBreakDurationLabel')}</span>
                    <span className="setting-description">
                      {settings.longBreakDuration} {t('minutesSuffix')}
                    </span>
                  </div>
                </div>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.longBreakDuration <= 15}
                    onClick={() => onUpdateSetting('longBreakDuration', Math.max(15, settings.longBreakDuration - 1))}
                  >
                    -
                  </button>
                  <span className="stepper-value">{settings.longBreakDuration}m</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={settings.longBreakDuration >= 30}
                    onClick={() => onUpdateSetting('longBreakDuration', Math.min(30, settings.longBreakDuration + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="15"
                max="30"
                step="1"
                value={settings.longBreakDuration}
                onChange={(e) => onUpdateSetting('longBreakDuration', Number(e.target.value))}
                className="custom-range-slider slider-amber"
              />
            </div>
          </div>

          {/* Section 6: Preferences */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('preferencesSection')}</h3>

            {/* Haptics */}
            <div className="setting-card setting-toggle-row">
              <div className="setting-info">
                <div className="setting-icon-box icon-purple">
                  <Vibrate size={18} />
                </div>
                <div>
                  <span className="setting-name">{t('hapticsLabel')}</span>
                  <span className="setting-description">{t('hapticsDesc')}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.hapticsEnabled}
                  onChange={(e) => onUpdateSetting('hapticsEnabled', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Sound chime */}
            <div className="setting-card setting-toggle-row">
              <div className="setting-info">
                <div className="setting-icon-box icon-cyan">
                  <Volume2 size={18} />
                </div>
                <div>
                  <span className="setting-name">{language === 'vi' ? 'Bật âm báo' : 'Enable alarm'}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSetting('soundEnabled', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Notification Sound Picker */}
            {settings.soundEnabled && (
              <div className="setting-card sound-picker-card">
                <div className="sound-picker-header">
                  <div className="setting-info">
                    <div className="setting-icon-box icon-indigo">
                      <Bell size={18} />
                    </div>
                    <div>
                      <span className="setting-name">
                        {language === 'vi' ? 'Loại âm thanh' : 'Sound type'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sound-options-row">
                  {NOTIFICATION_SOUNDS.map((snd) => {
                    const isSelected = (settings.notificationSound || 'bell') === snd.id;
                    const name = language === 'vi' ? snd.nameVi : snd.nameEn;

                    return (
                      <button
                        key={snd.id}
                        type="button"
                        className={`sound-chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onUpdateSetting('notificationSound', snd.id);
                          soundManager.playNotification(snd.id, (settings.alarmVolume ?? 80) / 100);
                        }}
                      >
                        <span className="sound-chip-title">{name}</span>
                        {isSelected && (
                          <span
                            className="sound-chip-check"
                            style={{ backgroundColor: settings.accentColor }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auto Switch Session */}
            <div className="setting-card setting-toggle-row">
              <div className="setting-info">
                <div className="setting-icon-box icon-amber">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <span className="setting-name">{t('autoSwitchLabel')}</span>
                  <span className="setting-description">{t('autoSwitchDesc')}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSwitchSession}
                  onChange={(e) => onUpdateSetting('autoSwitchSession', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Section 7: Data Management */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('dataSection')}</h3>

            <div className="setting-card danger-zone-card">
              <div className="setting-info">
                <div className="setting-icon-box icon-red">
                  <Trash2 size={18} />
                </div>
                <div>
                  <span className="setting-name text-red-400">{t('clearAllDataBtn')}</span>
                  <span className="setting-description">{t('clearAllDataDesc')}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-danger-action"
                onClick={() => setShowResetAlert(true)}
              >
                {t('clearAllDataBtn')}
              </button>
            </div>
          </div>

          {/* Section 8: Giới thiệu Study Pomodoro (About & Guide) */}
          <div className="settings-group">
            <h3 className="settings-group-title">{t('aboutGroupTitle')}</h3>

            <div
              className="setting-card about-nav-card"
              onClick={() => router.push('/about', 'forward', 'push')}
              role="button"
              tabIndex={0}
            >
              <div className="setting-info">
                <div className="setting-icon-box icon-indigo">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="setting-name">{t('aboutNavTitle')}</span>
                  <span className="setting-description">{t('aboutNavSubtitle')}</span>
                </div>
              </div>
              <div className="about-nav-arrow">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>

          {/* App Info Footer */}
          <div className="app-info-card">
            <div className="app-info-header">
              <ShieldCheck size={16} className="text-indigo-400" />
              <span className="font-semibold text-sm">Study Pomodoro v1.1.0</span>
            </div>
            <p className="app-info-desc">
              Xây dựng với Ionic React, Capacitor, SCSS & Three.js. Hỗ trợ tùy chỉnh giao diện toàn diện.
            </p>
          </div>
        </div>

        {/* Clear Data Confirmation Alert */}
        <IonAlert
          isOpen={showResetAlert}
          onDidDismiss={() => setShowResetAlert(false)}
          header={t('confirmResetTitle')}
          message={t('confirmResetDesc')}
          buttons={[
            {
              text: t('cancel'),
              role: 'cancel',
            },
            {
              text: t('clearAllDataBtn'),
              role: 'destructive',
              handler: handleConfirmReset,
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={t('resetSuccessToast')}
          duration={2200}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};
