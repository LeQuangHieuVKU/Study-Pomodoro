import React, { useRef } from 'react';
import {
  X,
  Check,
  Upload,
  Sparkles,
  Star,
  CloudRain,
  CircleDot,
  Ban,
  Waves,
  Sun,
  Moon,
} from 'lucide-react';
import type { AppSettings, BackgroundEffectType } from '../types';
import { PRESET_ACCENT_COLORS, PRESET_BG_IMAGES } from '../data/themePresets';
import { applyAccentColorToDOM } from '../hooks/useSettings';
import { useLanguage } from '../i18n/LanguageContext';

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  onUploadCustomBg?: (file: File) => Promise<void>;
  onRemoveCustomBg?: () => Promise<void>;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onUploadCustomBg,
  onRemoveCustomBg,
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectAccent = (hex: string) => {
    onUpdateSetting('accentColor', hex);
    applyAccentColorToDOM(hex);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustomBg) {
      await onUploadCustomBg(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ambientEffects: {
    key: BackgroundEffectType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'none',
      label: language === 'vi' ? 'Tắt' : 'Off',
      icon: <Ban size={16} />,
    },
    {
      key: 'particles',
      label: language === 'vi' ? 'Hạt bụi' : 'Motes',
      icon: <Sparkles size={16} />,
    },
    {
      key: 'stars',
      label: language === 'vi' ? 'Sao đêm' : 'Stars',
      icon: <Star size={16} />,
    },
    {
      key: 'rain',
      label: language === 'vi' ? 'Mưa rơi' : 'Rain',
      icon: <CloudRain size={16} />,
    },
    {
      key: 'bubbles',
      label: language === 'vi' ? 'Bong bóng' : 'Bubbles',
      icon: <CircleDot size={16} />,
    },
    {
      key: 'wave',
      label: language === 'vi' ? 'Gợn sóng' : 'Waves',
      icon: <Waves size={16} />,
    },
  ];

  return (
    <div className="theme-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="theme-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Hidden File Input for Custom Background */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Modal Header */}
        <div className="theme-modal-header">
          <h2 className="theme-modal-title">{language === 'vi' ? 'Giao diện' : 'Theme'}</h2>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={onClose}
            aria-label={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="theme-modal-body">
          {/* Quick Light/Dark Toggle Row */}
          <div className="theme-quick-mode-row">
            <span className="quick-mode-label">
              {language === 'vi' ? 'Chế độ hiển thị' : 'Appearance'}
            </span>
            <div className="quick-mode-pills">
              <button
                type="button"
                className={`quick-mode-pill ${!settings.darkMode ? 'active' : ''}`}
                onClick={() => onUpdateSetting('darkMode', false)}
              >
                <Sun size={14} />
                <span>{language === 'vi' ? 'Sáng' : 'Light'}</span>
              </button>
              <button
                type="button"
                className={`quick-mode-pill ${settings.darkMode ? 'active' : ''}`}
                onClick={() => onUpdateSetting('darkMode', true)}
              >
                <Moon size={14} />
                <span>{language === 'vi' ? 'Tối' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* SECTION: BACKGROUND */}
          <div className="theme-section">
            <div className="theme-section-header">
              <h3 className="theme-section-title">
                {language === 'vi' ? 'Ảnh nền' : 'Background'}
              </h3>
            </div>

            <div className="theme-bg-grid">
              {/* Option 1: None / Default solid or gradient */}
              <button
                type="button"
                className={`theme-bg-card ${settings.backgroundImage === 'none' ? 'selected' : ''}`}
                onClick={() => onUpdateSetting('backgroundImage', 'none')}
              >
                <div className="bg-card-preview bg-default-preview">
                  <div className="bg-default-swatch" />
                </div>
                <div className="bg-card-footer">
                  <span className="bg-card-name">
                    {language === 'vi' ? 'Mặc định' : 'Default'}
                  </span>
                  {settings.backgroundImage === 'none' && (
                    <span className="bg-card-check" style={{ backgroundColor: settings.accentColor }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>

              {/* Preset Backgrounds */}
              {PRESET_BG_IMAGES.map((preset) => {
                const isSelected = settings.backgroundImage === preset.id;
                const name = language === 'vi' ? preset.nameVi : preset.nameEn;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`theme-bg-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onUpdateSetting('backgroundImage', preset.id)}
                  >
                    <div
                      className="bg-card-preview"
                      style={{ backgroundImage: `url(${preset.url})` }}
                    />
                    <div className="bg-card-footer">
                      <span className="bg-card-name">{name}</span>
                      {isSelected && (
                        <span className="bg-card-check" style={{ backgroundColor: settings.accentColor }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* "Your Photos" / Custom Upload */}
              {settings.customBgData ? (
                <button
                  type="button"
                  className={`theme-bg-card custom-photo-card ${settings.backgroundImage === 'custom' ? 'selected' : ''}`}
                  onClick={() => onUpdateSetting('backgroundImage', 'custom')}
                >
                  <div
                    className="bg-card-preview"
                    style={{ backgroundImage: `url(${settings.customBgData})` }}
                  />
                  <div className="bg-card-footer">
                    <span className="bg-card-name">
                      {language === 'vi' ? 'Ảnh của bạn' : 'Your photo'}
                    </span>
                    {settings.backgroundImage === 'custom' && (
                      <span className="bg-card-check" style={{ backgroundColor: settings.accentColor }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="custom-photo-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="change-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title={language === 'vi' ? 'Đổi ảnh khác' : 'Change photo'}
                    >
                      {language === 'vi' ? 'Đổi ảnh' : 'Change'}
                    </button>
                    {onRemoveCustomBg && (
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={onRemoveCustomBg}
                        title={language === 'vi' ? 'Xóa ảnh' : 'Remove photo'}
                      >
                        {language === 'vi' ? 'Xóa' : 'Remove'}
                      </button>
                    )}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className="theme-bg-card upload-trigger-card"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-card-preview bg-upload-preview">
                    <Upload size={20} className="upload-icon" />
                    <span className="upload-label">
                      {language === 'vi' ? 'Tải ảnh lên' : 'Upload photo'}
                    </span>
                  </div>
                  <div className="bg-card-footer">
                    <span className="bg-card-name">
                      {language === 'vi' ? 'Ảnh cá nhân' : 'Your photos'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* SECTION: ACCENT COLOR */}
          <div className="theme-section">
            <div className="theme-section-header">
              <h3 className="theme-section-title">
                {language === 'vi' ? 'Màu nhấn' : 'Accent Color'}
              </h3>
            </div>

            <div className="theme-accent-row">
              {PRESET_ACCENT_COLORS.map((item) => {
                const isSelected = settings.accentColor.toLowerCase() === item.hex.toLowerCase();
                const name = language === 'vi' ? item.nameVi : item.nameEn;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`accent-circle-btn ${isSelected ? 'selected' : ''}`}
                    style={{
                      backgroundColor: item.hex,
                      boxShadow: isSelected
                        ? `0 0 0 3px rgba(255, 255, 255, 0.4), 0 0 0 6px ${item.hex}`
                        : undefined,
                    }}
                    onClick={() => handleSelectAccent(item.hex)}
                    title={name}
                    aria-label={name}
                  >
                    {isSelected && <Check size={16} strokeWidth={3.2} className="accent-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION: AMBIENT EFFECT */}
          <div className="theme-section">
            <div className="theme-section-header">
              <h3 className="theme-section-title">
                {language === 'vi' ? 'Hiệu ứng nền' : 'Ambient Effect'}
              </h3>
            </div>

            <div className="theme-effects-grid">
              {ambientEffects.map((eff) => {
                const isSelected = settings.backgroundEffect === eff.key;
                return (
                  <button
                    key={eff.key}
                    type="button"
                    className={`ambient-effect-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onUpdateSetting('backgroundEffect', eff.key)}
                  >
                    <div
                      className="effect-icon-badge"
                      style={isSelected ? { color: settings.accentColor } : undefined}
                    >
                      {eff.icon}
                    </div>
                    <span className="effect-title">{eff.label}</span>
                    {isSelected && (
                      <span className="effect-check" style={{ backgroundColor: settings.accentColor }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
