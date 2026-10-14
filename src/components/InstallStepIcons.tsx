import React from 'react';

// =============================================================================
// DESKTOP ICONS (Windows / MacOS)
// =============================================================================

// 01. Mở trong trình duyệt
// Cửa sổ trình duyệt hình chữ nhật bo góc, 3 chấm tròn ở góc trên bên trái, bên trong có vòng tròn đồng hồ đang chạy
export const DesktopBrowserClockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Browser window */}
    <rect x="4" y="6" width="40" height="36" rx="6" stroke="currentColor" strokeWidth="2" fill="rgba(56, 189, 248, 0.05)" />
    {/* Window top bar divider */}
    <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
    {/* 3 dots in top-left */}
    <circle cx="10" cy="11" r="1.8" fill="#f43f5e" />
    <circle cx="15.5" cy="11" r="1.8" fill="#fbbf24" />
    <circle cx="21" cy="11" r="1.8" fill="#10b981" />
    {/* Running clock circle */}
    <circle cx="24" cy="28" r="9" stroke="#38bdf8" strokeWidth="2" strokeDasharray="48" strokeDashoffset="10" />
    {/* Clock hands */}
    <path d="M24 23.5 V28 L27.5 29.8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="28" r="1.5" fill="#38bdf8" />
  </svg>
);

// 02. Nhấn cài đặt
// Thanh địa chỉ dài bo tròn, bên trái có ổ khóa, bên phải có nút cài đặt, có con trỏ chuột đang chỉ vào nút đó
export const DesktopInstallBarIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Elongated Address Bar */}
    <rect x="4" y="14" width="40" height="20" rx="6" stroke="currentColor" strokeWidth="2" fill="rgba(99, 102, 241, 0.06)" />
    {/* Lock icon on the left */}
    <rect x="8.5" y="23" width="7" height="6" rx="1.5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
    <path d="M10 23 V20.5 A2 2 0 0 1 14 20.5 V23" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* URL placeholder text bar */}
    <line x1="19" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    {/* Install button on the right */}
    <rect x="33" y="18" width="8" height="12" rx="3" fill="var(--color-indigo)" fillOpacity="0.3" stroke="var(--color-indigo)" strokeWidth="1.5" />
    <path d="M37 21 V26 M35.2 24.5 L37 26.5 L38.8 24.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Mouse pointer pointing at the install button */}
    <path d="M30 28 L34 40 L36.5 36 L40.5 38.5 L42 36 L38 33.5 L41.5 31 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// 03. Mở ở bất cứ đâu
// Cửa sổ ứng dụng nhỏ + thanh taskbar/dock phía dưới, icon app được làm nổi bật
export const DesktopDockAppIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Small app window */}
    <rect x="7" y="6" width="34" height="23" rx="4" stroke="currentColor" strokeWidth="1.8" fill="rgba(16, 185, 129, 0.05)" />
    <line x1="7" y1="12" x2="41" y2="12" stroke="currentColor" strokeWidth="1.4" opacity="0.3" />
    <circle cx="11" cy="9" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="15" cy="9" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="19" cy="9" r="1.2" fill="currentColor" opacity="0.5" />
    <rect x="13" y="16" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
    <rect x="13" y="22" width="22" height="2" rx="1" fill="currentColor" opacity="0.2" />
    {/* Bottom taskbar / dock */}
    <rect x="8" y="34" width="32" height="9" rx="3" stroke="currentColor" strokeWidth="1.8" fill="rgba(10, 10, 10, 0.8)" />
    {/* Other muted app icons on dock */}
    <circle cx="14" cy="38.5" r="1.8" fill="currentColor" opacity="0.35" />
    <circle cx="19.5" cy="38.5" r="1.8" fill="currentColor" opacity="0.35" />
    <circle cx="34" cy="38.5" r="1.8" fill="currentColor" opacity="0.35" />
    {/* Highlighted app icon on dock */}
    <rect x="23.5" y="35" width="7" height="7" rx="2" fill="#10b981" />
    <path d="M25.5 38.5 H28.5 M27 37 V40" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    {/* Active dock indicator dot */}
    <circle cx="27" cy="45" r="1.2" fill="#34d399" />
  </svg>
);

// =============================================================================
// MOBILE ICONS (Android / iOS)
// =============================================================================

// 01. Mở bằng trình duyệt
// Hình điện thoại, bên trong là giao diện trình duyệt (có thanh địa chỉ)
export const MobileBrowserFrameIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Phone chassis */}
    <rect x="12" y="4" width="24" height="40" rx="6" stroke="currentColor" strokeWidth="2" fill="rgba(56, 189, 248, 0.05)" />
    {/* Top speaker slit */}
    <line x1="21" y1="8" x2="27" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* Browser address bar */}
    <rect x="15" y="12" width="18" height="6" rx="2.5" stroke="#38bdf8" strokeWidth="1.4" fill="rgba(255, 255, 255, 0.08)" />
    <circle cx="18" cy="15" r="1" fill="#38bdf8" />
    <line x1="21" y1="15" x2="28" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    {/* Webpage preview timer */}
    <circle cx="24" cy="26" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="30" strokeDashoffset="7" />
    <path d="M24 23.5 V26 L26 27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="17" y1="34" x2="31" y2="34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    <line x1="19" y1="37" x2="29" y2="37" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
    {/* Home indicator bar */}
    <line x1="20" y1="41" x2="28" y2="41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// 02. Thêm vào màn hình chính
// Hình điện thoại + nút Share / menu, có mũi tên chỉ vào tùy chọn “Thêm vào màn hình chính”
export const MobileShareActionIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Phone chassis */}
    <rect x="11" y="4" width="26" height="40" rx="6" stroke="currentColor" strokeWidth="2" fill="rgba(99, 102, 241, 0.05)" />
    {/* Top speaker slit */}
    <line x1="21" y1="8" x2="27" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* Action sheet card */}
    <rect x="14" y="14" width="20" height="17" rx="3.5" stroke="var(--color-indigo)" strokeWidth="1.6" fill="rgba(15, 23, 42, 0.95)" />
    {/* Add to home screen option */}
    <rect x="16" y="17" width="5" height="5" rx="1.2" fill="var(--color-indigo)" fillOpacity="0.35" stroke="var(--color-indigo)" strokeWidth="1.2" />
    <path d="M18.5 18.5 V20.5 M17.5 19.5 H19.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    <line x1="23" y1="19.5" x2="31" y2="19.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="26" x2="31" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
    {/* Share button at bottom */}
    <rect x="21" y="34.5" width="6" height="6" rx="1" stroke="#38bdf8" strokeWidth="1.4" fill="none" />
    <path d="M24 32.5 V37.5 M22.2 34.5 L24 32.5 L25.8 34.5" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Dashed arrow pointing up to Add to Home Screen */}
    <path d="M24 32.5 C24 28 26.5 26.5 26.5 23" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" fill="none" />
    <path d="M25 24.5 L26.5 23 L28 24.5" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 03. Mở như ứng dụng
// Màn hình chính điện thoại có một icon app đang được làm nổi bật (có hiệu ứng glow nhẹ)
export const MobileAppGridGlowIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Phone chassis */}
    <rect x="12" y="4" width="24" height="40" rx="6" stroke="currentColor" strokeWidth="2" fill="rgba(16, 185, 129, 0.05)" />
    {/* Top speaker slit */}
    <line x1="21" y1="8" x2="27" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* Home screen app grid - Row 1 */}
    <rect x="15" y="13" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    <rect x="21.5" y="13" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    <rect x="28" y="13" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    {/* Row 2 - Left */}
    <rect x="15" y="21" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    {/* Row 2 - Highlighted App Icon with Glow */}
    <rect x="19.5" y="19" width="9" height="9" rx="3" stroke="#34d399" strokeWidth="1" strokeDasharray="3 2" fill="rgba(52, 211, 153, 0.15)" />
    <rect x="21" y="20.5" width="6" height="6" rx="1.8" fill="#10b981" />
    <circle cx="24" cy="23.5" r="1.6" stroke="#ffffff" strokeWidth="0.8" fill="none" />
    <path d="M24 22.5 V23.5 L24.7 24" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
    {/* Row 2 - Right */}
    <rect x="28" y="21" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    {/* Row 3 */}
    <rect x="15" y="29" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    <rect x="21.5" y="29" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    <rect x="28" y="29" width="4.5" height="4.5" rx="1.2" fill="currentColor" opacity="0.25" />
    {/* Home indicator bar */}
    <line x1="20" y1="40" x2="28" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);
