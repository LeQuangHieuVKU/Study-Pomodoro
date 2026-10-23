import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export interface SEOProps {
  page: 'timer' | 'about';
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
