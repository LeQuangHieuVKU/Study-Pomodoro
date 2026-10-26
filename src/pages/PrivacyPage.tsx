import React, { useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Trash2,
  Globe,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import '../theme/about.scss';

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();
  const router = useIonRouter();
  useSEO({ page: 'privacy' });

  useEffect(() => {
    document.body.classList.add('in-about-view');
    return () => {
      document.body.classList.remove('in-about-view');
    };
  }, []);

  const handleBack = () => {
    router.push('/timer', 'back', 'replace');
  };

  return (
    <IonPage className="about-page-root">
      {/* Fixed Back Button */}
      <button
        type="button"
        className="about-back-btn"
        onClick={handleBack}
        aria-label={language === 'vi' ? 'Quay lại' : 'Back'}
      >
        <ArrowLeft size={19} />
        <span className="about-back-text">{language === 'vi' ? 'Quay lại' : 'Back'}</span>
      </button>

      {/* Top Header */}
      <IonHeader className="ion-no-border about-header-bar">
        <IonToolbar className="about-toolbar">
          <div className="about-header-inner">
            <h1 className="about-header-title">
              {language === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}
            </h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="about-content-area" scrollEvents={true}>
        <div className="about-page-wrapper" style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px 20px' }}>
          {/* Hero Badge */}
          <section style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', fontSize: '0.82rem', fontWeight: 600, marginBottom: 16 }}>
              <ShieldCheck size={16} />
              <span>{language === 'vi' ? 'Bảo vệ quyền riêng tư tuyệt đối' : 'Zero-Telemetry & 100% Local-First'}</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
              {language === 'vi' ? 'Chính Sách Bảo Mật StudyPomodoro' : 'StudyPomodoro Privacy Policy'}
            </h2>
            <p style={{ maxWidth: 650, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'vi'
                ? 'Ngày cập nhật: 24 tháng 10 năm 2026. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Dữ liệu học tập và ghi chú của bạn là của riêng bạn và không bao giờ rời khỏi thiết bị cá nhân.'
                : 'Last updated: October 24, 2026. We are committed to safeguarding your privacy. Your study data, timer sessions, and personal notes belong to you and never leave your personal device.'}
            </p>
          </section>

          {/* Privacy Principles Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 36 }}>
            <div style={{ padding: 22, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <EyeOff size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Không thu thập dữ liệu cá nhân' : 'Zero Personal Data Collection'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0, lineHeight: 1.6 }}>
                {language === 'vi'
                  ? 'StudyPomodoro không yêu cầu tài khoản, địa chỉ email, số điện thoại hay bất kỳ định danh cá nhân nào để sử dụng. Bạn mở trang là có thể bắt đầu phiên học ngay lập tức.'
                  : 'StudyPomodoro requires no sign-up, no email registration, and no personal identifiers. You can start focusing immediately without an account.'}
              </p>
            </div>

            <div style={{ padding: 22, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Database size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Lưu trữ 100% trên thiết bị' : '100% Local Device Storage'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0, lineHeight: 1.6 }}>
                {language === 'vi'
                  ? 'Tất cả nhật ký phiên học, nhiệm vụ công việc, danh sách nhãn, bài hát yêu thích và cài đặt giao diện đều được lưu trong localStorage và Capacitor Preferences của chính trình duyệt bạn.'
                  : 'All study session history, tasks, custom labels, themes, and sound preferences are stored strictly inside your browser via HTML5 localStorage and Capacitor Preferences.'}
              </p>
            </div>

            <div style={{ padding: 22, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Không quảng cáo & Không theo dõi' : 'No Ads & No Third-Party Trackers'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0, lineHeight: 1.6 }}>
                {language === 'vi'
                  ? 'Ứng dụng hoàn toàn không tích hợp Google Analytics, Facebook Pixel, banner quảng cáo thương mại hay bất kỳ mã theo dõi hành vi người dùng nào.'
                  : 'Our application contains zero commercial advertisements, zero tracking pixels, and zero behavioral analytics libraries. We do not monetize your focus.'}
              </p>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 1: Data Storage */}
            <div style={{ padding: 26, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
                1. {language === 'vi' ? 'Những dữ liệu nào được lưu trữ?' : 'What Data is Stored?'}
              </h3>
              <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, margin: '0 0 12px 0', fontSize: '0.92rem' }}>
                {language === 'vi'
                  ? 'StudyPomodoro chỉ lưu trữ các thông tin kỹ thuật phục vụ trực tiếp cho trải nghiệm học tập của bạn:'
                  : 'StudyPomodoro only retains operational data necessary to deliver your focus experience:'}
              </p>
              <ul style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: 22, margin: 0 }}>
                <li>{language === 'vi' ? 'Lịch sử phiên học (thời gian bắt đầu, thời lượng phiên, chế độ tập trung hoặc nghỉ ngơi).' : 'Completed session history (timestamps, duration in minutes, focus vs. break modes).'}</li>
                <li>{language === 'vi' ? 'Nhiệm vụ cần làm (tiêu đề, ghi chú, mức độ ưu tiên, nhãn màu do bạn tự nhập).' : 'Task checklist entries (titles, notes, priority levels, labels).'}</li>
                <li>{language === 'vi' ? 'Tùy chỉnh cá nhân (ngôn ngữ hiển thị, âm lượng chuông báo, thời lượng từng phiên, hình nền).' : 'User preferences (language selection, alarm volumes, timer lengths, wallpaper).'}</li>
              </ul>
            </div>

            {/* Section 2: Third-party Services */}
            <div style={{ padding: 26, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
                2. {language === 'vi' ? 'Dịch vụ của bên thứ ba' : 'Third-Party Services'}
              </h3>
              <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, margin: '0 0 10px 0', fontSize: '0.92rem' }}>
                {language === 'vi'
                  ? 'Ứng dụng chỉ tương tác với các dịch vụ bên ngoài khi bạn chủ động kích hoạt:'
                  : 'The application interacts with external services only when explicitly requested by you:'}
              </p>
              <ul style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: 22, margin: 0 }}>
                <li>
                  <strong>YouTube Audio Player:</strong> {language === 'vi'
                    ? 'Khi bạn dán đường dẫn video YouTube để nghe nhạc nền, video được phát thông qua trình phát nhúng chính thức của YouTube và tuân thủ Chính sách quyền riêng tư của Google.'
                    : 'When you paste a custom YouTube stream URL, playback is handled directly via YouTube’s embedded player under Google’s Privacy Policy.'}
                </li>
                <li>
                  <strong>Google Fonts:</strong> {language === 'vi'
                    ? 'Bộ phông chữ Be Vietnam Pro và Lora được tải về từ Google Fonts CDN nhằm đảm bảo tốc độ hiển thị mượt mà trên mọi thiết bị.'
                    : 'The typography stylesheets (Be Vietnam Pro and Lora) are served via Google Fonts CDN for optimized rendering.'}
                </li>
              </ul>
            </div>

            {/* Section 3: Data Deletion */}
            <div style={{ padding: 26, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
                3. {language === 'vi' ? 'Quyền kiểm soát và xóa dữ liệu' : 'Your Rights & Data Erasure'}
              </h3>
              <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, margin: '0 0 12px 0', fontSize: '0.92rem' }}>
                {language === 'vi'
                  ? 'Bạn có toàn quyền kiểm soát dữ liệu của mình bất cứ lúc nào. Để xóa toàn bộ dữ liệu:'
                  : 'You retain complete ownership and control over your data. To permanently erase your data:'}
              </p>
              <ul style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: 22, margin: 0 }}>
                <li>{language === 'vi' ? 'Bấm biểu tượng Cài đặt (bánh răng) trên thanh điều khiển → Chọn "Xóa toàn bộ dữ liệu".' : 'Click the Settings icon in the app → Select "Reset All Data".'}</li>
                <li>{language === 'vi' ? 'Hoặc xóa bộ nhớ đệm (Clear Site Data / Storage) trong mục Cài đặt của trình duyệt web.' : 'Or clear site storage through your browser settings (Inspect → Application → Clear storage).'}</li>
              </ul>
            </div>

            {/* Section 4: Contact */}
            <div style={{ padding: 26, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
                4. {language === 'vi' ? 'Thông tin liên hệ bảo mật' : 'Privacy Inquiries & Contact'}
              </h3>
              <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, margin: 0, fontSize: '0.92rem' }}>
                {language === 'vi'
                  ? 'Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc cách StudyPomodoro xử lý dữ liệu, vui lòng gửi email về hieulq.23itb@vku.udn.vn hoặc truy cập trang '
                  : 'If you have any questions or feedback regarding our privacy practices, please contact us at hieulq.23itb@vku.udn.vn or visit our '}
                <a href="/contact" style={{ color: '#818cf8', fontWeight: 600 }}>{language === 'vi' ? 'Liên hệ' : 'Contact page'}</a>.
              </p>
            </div>
          </div>

          {/* Navigation Links Footer */}
          <footer style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            <a href="/timer" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Đồng hồ' : 'Timer'}</a>
            <span>•</span>
            <a href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Giới thiệu' : 'About'}</a>
            <span>•</span>
            <a href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Liên hệ' : 'Contact'}</a>
            <span>•</span>
            <a href="/llms.txt" style={{ color: 'inherit', textDecoration: 'none' }}>Agent Guide (llms.txt)</a>
            <span>•</span>
            <a href="/sitemap.xml" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</a>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default PrivacyPage;
