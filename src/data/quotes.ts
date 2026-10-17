import type { QuoteItem } from '../types';

export const MOTIVATIONAL_QUOTES: QuoteItem[] = [
  {
    id: 1,
    textVi: "Tập trung 25 phút, thành công cả ngày.",
    textEn: "Focus for 25 minutes, win the whole day.",
    authorVi: "Pomodoro Mindset",
    authorEn: "Pomodoro Mindset"
  },
  {
    id: 2,
    textVi: "Mỗi phiên học nhỏ là một bước tiến lớn.",
    textEn: "Small sessions create big results.",
    authorVi: "Thói quen nguyên tử",
    authorEn: "Atomic Habits"
  },
  {
    id: 3,
    textVi: "Đừng chờ cảm hứng, hãy tạo ra nó.",
    textEn: "Don't wait for motivation, create it.",
    authorVi: "Jack London",
    authorEn: "Jack London"
  },
  {
    id: 4,
    textVi: "Sự tập trung sâu là siêu năng lực của thế kỷ 21.",
    textEn: "Deep focus is the superpower of the 21st century.",
    authorVi: "Cal Newport",
    authorEn: "Cal Newport"
  },
  {
    id: 5,
    textVi: "Bắt đầu là phần khó nhất, và bạn vừa hoàn thành nó.",
    textEn: "Starting is the hardest part, and you just did it.",
    authorVi: "Châm ngôn học tập",
    authorEn: "Study Wisdom"
  },
  {
    id: 6,
    textVi: "Kỷ luật hôm nay là sự tự do cho ngày mai.",
    textEn: "Discipline today creates freedom tomorrow.",
    authorVi: "Tập trung & Kiên trì",
    authorEn: "Focus & Grit"
  },
  {
    id: 7,
    textVi: "Từng giây phút chuyên tâm đều tích lũy thành kỳ tích.",
    textEn: "Every moment of dedication compounds into excellence.",
    authorVi: "Tư duy phát triển",
    authorEn: "Growth Mindset"
  },
  {
    id: 8,
    textVi: "Hãy hiện diện trọn vẹn trong phiên học này.",
    textEn: "Be completely present in this study session.",
    authorVi: "Tỉnh thức trong học tập",
    authorEn: "Mindful Learning"
  },
  {
    id: 9,
    textVi: "Không gian yên tĩnh, tâm trí vững vàng, mục tiêu rõ ràng.",
    textEn: "Quiet space, steady mind, crystal clear goal.",
    authorVi: "Nghệ thuật tập trung",
    authorEn: "Art of Focus"
  },
  {
    id: 10,
    textVi: "Nghỉ ngơi đúng cách là một phần của năng suất đỉnh cao.",
    textEn: "Resting well is part of peak productivity.",
    authorVi: "Nhịp sinh học",
    authorEn: "Ultradian Rhythm"
  },
  {
    id: 11,
    textVi: "Thành công là chuỗi những nỗ lực nhỏ được lặp lại hàng ngày.",
    textEn: "Success is the sum of small efforts repeated day in and day out.",
    authorVi: "Robert Collier",
    authorEn: "Robert Collier"
  },
  {
    id: 12,
    textVi: "Tắt xao nhãng, bật ước mơ, tiến về phía trước.",
    textEn: "Silence the noise, ignite your dreams, move forward.",
    authorVi: "Study Pomodoro",
    authorEn: "Study Pomodoro"
  }
];

export const getRandomQuote = (previousId?: number): QuoteItem => {
  const filtered = previousId 
    ? MOTIVATIONAL_QUOTES.filter(q => q.id !== previousId) 
    : MOTIVATIONAL_QUOTES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || MOTIVATIONAL_QUOTES[0];
};
