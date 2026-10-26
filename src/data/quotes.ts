import type { QuoteItem } from '../types';

export const MOTIVATIONAL_QUOTES: QuoteItem[] = [
  {
    id: 1,
    textVi: "Tắt xao nhãng, bật ước mơ, tiến về phía trước.",
    textEn: "Turn off distraction, turn on your dream, move forward.",
    authorVi: "StudyPomodoro",
    authorEn: "StudyPomodoro",
  },
  {
    id: 2,
    textVi: "Mỗi phiên học nhỏ là một bước tiến lớn.",
    textEn: "Every small study session is a big step forward.",
    authorVi: "Thói quen nguyên tử",
    authorEn: "Atomic Habits",
  },
  {
    id: 3,
    textVi: "Tập trung 25 phút hôm nay, thành quả ngày mai.",
    textEn: "Focus for 25 minutes today, results tomorrow.",
    authorVi: "Pomodoro Mindset",
    authorEn: "Pomodoro Mindset",
  },
  {
    id: 4,
    textVi: "Không cần hoàn hảo, chỉ cần bắt đầu.",
    textEn: "You don’t need perfect — you need to start.",
    authorVi: "Tư duy hành động",
    authorEn: "Action Mindset",
  },
  {
    id: 5,
    textVi: "Kỷ luật nhỏ mỗi ngày tạo nên thay đổi lớn.",
    textEn: "Small discipline every day creates big change.",
    authorVi: "Châm ngôn học tập",
    authorEn: "Study Wisdom",
  },
  {
    id: 6,
    textVi: "Học một việc, xong một việc, rồi mới sang việc khác.",
    textEn: "One task, finish it, then the next.",
    authorVi: "Nghệ thuật tập trung",
    authorEn: "Art of Focus",
  },
  {
    id: 7,
    textVi: "Nghỉ ngắn để đi xa hơn, không phải để bỏ cuộc.",
    textEn: "Short breaks help you go further.",
    authorVi: "Nhịp sinh học",
    authorEn: "Ultradian Rhythm",
  },
  {
    id: 8,
    textVi: "Bạn không cần nhiều thời gian — bạn cần sự tập trung.",
    textEn: "You don’t need more time — you need focus.",
    authorVi: "Hiệu suất đỉnh cao",
    authorEn: "Deep Productivity",
  },
  {
    id: 9,
    textVi: "Bắt đầu là phần khó nhất, và bạn vừa hoàn thành nó.",
    textEn: "Starting is the hardest part, and you just did it.",
    authorVi: "Lời khuyên học tập",
    authorEn: "Study Encouragement",
  },
  {
    id: 10,
    textVi: "Từng giây phút chuyên tâm đều tích lũy thành kỳ tích.",
    textEn: "Focused minutes add up to real progress.",
    authorVi: "Tư duy phát triển",
    authorEn: "Growth Mindset",
  },
  {
    id: 11,
    textVi: "Sự tập trung sâu là siêu năng lực của thế kỷ 21.",
    textEn: "Deep focus is the superpower of the 21st century.",
    authorVi: "Cal Newport",
    authorEn: "Cal Newport",
  },
  {
    id: 12,
    textVi: "Đừng chờ cảm hứng, hãy tạo ra nó.",
    textEn: "Don't wait for motivation, create it.",
    authorVi: "Jack London",
    authorEn: "Jack London",
  },
  {
    id: 13,
    textVi: "Kỷ luật hôm nay là sự tự do cho ngày mai.",
    textEn: "Discipline today creates freedom tomorrow.",
    authorVi: "Tập trung & Kiên trì",
    authorEn: "Focus & Grit",
  },
  {
    id: 14,
    textVi: "Hãy hiện diện trọn vẹn trong phiên học này.",
    textEn: "Be completely present in this study session.",
    authorVi: "Tỉnh thức trong học tập",
    authorEn: "Mindful Learning",
  },
  {
    id: 15,
    textVi: "Không gian yên tĩnh, tâm trí vững vàng, mục tiêu rõ ràng.",
    textEn: "Quiet space, steady mind, crystal clear goal.",
    authorVi: "Nghệ thuật tập trung",
    authorEn: "Art of Focus",
  },
  {
    id: 16,
    textVi: "Thành công là chuỗi những nỗ lực nhỏ được lặp lại hàng ngày.",
    textEn: "Success is the sum of small efforts repeated daily.",
    authorVi: "Robert Collier",
    authorEn: "Robert Collier",
  },
];

export const getRandomQuote = (previousId?: number): QuoteItem => {
  const filtered = previousId
    ? MOTIVATIONAL_QUOTES.filter((q) => q.id !== previousId)
    : MOTIVATIONAL_QUOTES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || MOTIVATIONAL_QUOTES[0];
};
