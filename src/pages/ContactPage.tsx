import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSEO } from '../hooks/useSEO';
import '../theme/about.scss';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FacebookIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const router = useIonRouter();
  useSEO({ page: 'contact' });

  const [formSent, setFormSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    router.push('/timer', 'back', 'replace');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setFormSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setFormSent(false);
    }, 4000);
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
              {language === 'vi' ? 'Liên Hệ & Hỗ Trợ' : 'Contact & Support'}
            </h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="about-content-area" scrollEvents={true}>
        <div className="about-page-wrapper" style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px 20px' }}>
          {/* Hero Section */}
          <section className="about-section" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="about-section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-indigo, #6366f1)', fontSize: '0.82rem', fontWeight: 600, marginBottom: 16 }}>
              <Mail size={15} />
              <span>{language === 'vi' ? 'Hỗ trợ người dùng' : 'User Support & Inquiries'}</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main, #f8fafc)' }}>
              {language === 'vi' ? 'Chúng tôi luôn sẵn sàng lắng nghe bạn' : 'We Are Here to Help and Listen'}
            </h2>
            <p style={{ maxWidth: 620, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'vi'
                ? 'Bạn có câu hỏi, đề xuất tính năng mới hoặc báo cáo lỗi kỹ thuật? Hãy kết nối với đội ngũ phát triển StudyPomodoro qua các kênh liên lạc chính thức bên dưới.'
                : 'Have questions, feature suggestions, or need technical support? Connect directly with the StudyPomodoro development team through our official channels below.'}
            </p>
          </section>

          {/* Contact Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 36 }}>
            {/* Email Card */}
            <div style={{ padding: 24, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Mail size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Email chính thức' : 'Official Support Email'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                {language === 'vi' ? 'Gửi thư góp ý hoặc hỗ trợ kỹ thuật:' : 'Direct feedback and bug reports:'}
              </p>
              <a href="mailto:hieulq.23itb@vku.udn.vn" style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                hieulq.23itb@vku.udn.vn
              </a>
            </div>

            {/* Address Card */}
            <div style={{ padding: 24, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Địa chỉ liên hệ' : 'Postal Address'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)<br />
                470 Đường Trần Đại Nghĩa, Phường Hòa Quý, Quận Ngũ Hành Sơn, TP. Đà Nẵng, Việt Nam.
              </p>
            </div>

            {/* Response Time Card */}
            <div style={{ padding: 24, borderRadius: 18, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main, #f8fafc)' }}>
                {language === 'vi' ? 'Thời gian phản hồi' : 'Response Time'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                {language === 'vi'
                  ? 'Chúng tôi thường xem xét và phản hồi các thư điện tử trong vòng 24 đến 48 giờ làm việc.'
                  : 'We typically review and respond to inquiries within 24 to 48 business hours.'}
              </p>
            </div>
          </div>

          {/* Social Channels & Founder Info */}
          <section style={{ padding: 28, borderRadius: 20, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', marginBottom: 36 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main, #f8fafc)' }}>
              {language === 'vi' ? 'Người phát triển dự án' : 'Project Creator & Social Links'}
            </h3>
            <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, marginBottom: 20 }}>
              {language === 'vi'
                ? 'StudyPomodoro là dự án công cụ học tập mã nguồn mở phi lợi nhuận được sáng lập và phát triển bởi Lê Quang Hiếu (sinh viên khoa Công nghệ Thông tin VKU). Dự án hướng đến việc cung cấp một môi trường học tập tập trung, sạch sẽ, không quảng cáo và tôn trọng quyền riêng tư tuyệt đối cho học sinh, sinh viên và người tự học trên toàn cầu.'
                : 'StudyPomodoro is an open-source, non-profit study productivity tool founded and crafted by Le Quang Hieu (VKU IT Department). The platform aims to provide an ad-free, respectful, and distraction-free study environment for learners worldwide.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a
                href="https://github.com/LeQuangHieuVKU/Study-Pomodoro"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: 'var(--text-main, #f8fafc)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
              >
                <GithubIcon size={18} />
                <span>GitHub Repository</span>
                <ExternalLink size={14} style={{ opacity: 0.6 }} />
              </a>
              <a
                href="https://www.facebook.com/quanghieu.le.3994885/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'rgba(24, 119, 242, 0.15)', color: '#60a5fa', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
              >
                <FacebookIcon size={18} />
                <span>Facebook Profile</span>
                <ExternalLink size={14} style={{ opacity: 0.6 }} />
              </a>
            </div>
          </section>

          {/* Quick Message Form */}
          <section style={{ padding: 28, borderRadius: 20, background: 'var(--bg-card, rgba(255,255,255,0.04))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main, #f8fafc)' }}>
              {language === 'vi' ? 'Gửi lời nhắn nhanh' : 'Send a Quick Message'}
            </h3>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
              {language === 'vi'
                ? 'Điền thông tin và tin nhắn của bạn. Chúng tôi sẽ ghi nhận và gửi phản hồi qua email.'
                : 'Leave your message below and we will get back to you via your email address.'}
            </p>

            {formSent ? (
              <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 size={24} />
                <span>
                  {language === 'vi'
                    ? 'Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công.'
                    : 'Thank you! Your message has been sent successfully.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: 6 }}>
                      {language === 'vi' ? 'Họ và tên' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'Alex Johnson'}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))', background: 'rgba(0,0,0,0.15)', color: 'var(--text-main, #f8fafc)', fontSize: '0.92rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: 6 }}>
                      {language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))', background: 'rgba(0,0,0,0.15)', color: 'var(--text-main, #f8fafc)', fontSize: '0.92rem', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: 6 }}>
                    {language === 'vi' ? 'Nội dung tin nhắn' : 'Message'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'vi' ? 'Chia sẻ cảm nhận, báo lỗi hoặc yêu cầu tính năng...' : 'Share feedback, bug reports, or feature requests...'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))', background: 'rgba(0,0,0,0.15)', color: 'var(--text-main, #f8fafc)', fontSize: '0.92rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, background: 'var(--color-indigo, #6366f1)', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  <Send size={16} />
                  <span>{language === 'vi' ? 'Gửi tin nhắn' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </section>

          {/* Navigation Links Footer */}
          <footer style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            <a href="/timer" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Đồng hồ' : 'Timer'}</a>
            <span>•</span>
            <a href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Giới thiệu' : 'About'}</a>
            <span>•</span>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}</a>
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
export default ContactPage;
