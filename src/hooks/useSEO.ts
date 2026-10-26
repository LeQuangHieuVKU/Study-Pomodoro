import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export interface SEOProps {
  page: 'timer' | 'about' | 'contact' | 'privacy';
}

export const useSEO = ({ page }: SEOProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    let title = '';
    let description = '';

    if (page === 'timer') {
      if (language === 'vi') {
        title = 'StudyPomodoro – Đồng Hồ Pomodoro Học Tập & Free Online Study Timer';
        description = 'Đồng hồ Pomodoro online miễn phí kèm nhạc Lofi, ghi chú học tập và thống kê. Giúp bạn tập trung học thi và làm việc hiệu quả mỗi ngày.';
      } else {
        title = 'StudyPomodoro – Free Online Pomodoro Study Timer & Lofi Music';
        description = 'Free online aesthetic Pomodoro study timer with ambient lofi music, task notes, and discipline statistics. Boost your study focus effortlessly.';
      }
    } else if (page === 'about') {
      if (language === 'vi') {
        title = 'Giới thiệu StudyPomodoro – Đồng Hồ Pomodoro & Hướng Dẫn Cài Đặt';
        description = 'Tìm hiểu về phương pháp Pomodoro, tính năng StudyPomodoro, hướng dẫn cài đặt ứng dụng PWA trên máy tính và điện thoại, FAQ.';
      } else {
        title = 'About StudyPomodoro – Smart Aesthetic Focus Timer & PWA Guide';
        description = 'Learn about the Pomodoro Technique, StudyPomodoro features, how to install as a PWA on iOS/Android/Desktop, and developer info.';
      }
    } else if (page === 'contact') {
      if (language === 'vi') {
        title = 'Liên Hệ & Hỗ Trợ – StudyPomodoro';
        description = 'Thông tin liên hệ chính thức của StudyPomodoro, email hỗ trợ kỹ thuật, kênh phản hồi và đóng góp phát triển ứng dụng.';
      } else {
        title = 'Contact & Support – StudyPomodoro';
        description = 'Official contact details for StudyPomodoro support, developer inquiries, feedback, and collaboration opportunities.';
      }
    } else if (page === 'privacy') {
      if (language === 'vi') {
        title = 'Chính Sách Bảo Mật – StudyPomodoro';
        description = 'Chính sách bảo mật quyền riêng tư của StudyPomodoro. Cam kết 100% không thu thập dữ liệu cá nhân, lưu trữ an toàn trên thiết bị.';
      } else {
        title = 'Privacy Policy – StudyPomodoro';
        description = 'StudyPomodoro privacy policy. Zero personal data collection, local-first storage, and full user data rights.';
      }
    }

    if (title && typeof document !== 'undefined') {
      document.title = title;
    }

    if (description && typeof document !== 'undefined') {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [page, language]);
};
