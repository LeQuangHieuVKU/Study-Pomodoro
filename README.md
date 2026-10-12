# StudyPomodoro ⏱️ - Focus & Study Mobile App

Ứng dụng Pomodoro & quản lý thời gian học tập đỉnh cao được xây dựng với **Ionic Framework**, **React**, **TypeScript**, **Capacitor**, **SCSS** và hiệu ứng **Three.js ambient depth**.

---

## 🌟 Tính Năng Nổi Bật

1. **Timer Page (Trang chủ)**
   - Đồng hồ đếm ngược vòng tròn SVG progress mượt mà với hiệu ứng phát sáng neon dịu mắt.
   - Hiệu ứng không gian 3D ambient Three.js tĩnh tại, thư giãn và tối ưu hoá pin.
   - Mặc định 25 phút học + 5 phút nghỉ (có thể tùy chỉnh).
   - Nút Start / Pause / Reset với tactile feedback, hiệu ứng nhấn nút (scale) và âm thanh chuông êm dịu.
   - Báo rung (Haptics) + Local Notification + hiệu ứng Confetti khi hoàn thành phiên.
   - Giữ màn hình sáng liên tục trong lúc đếm giờ (Keep Awake).
   - Hiển thị câu truyền động lực ngẫu nhiên (Motivational Quotes) thay đổi sau mỗi phiên.

2. **Notes Page (Sổ ghi chú)**
   - Thêm, xem, sao chép và xóa ghi chú / ý tưởng trong phiên học.
   - Phân loại thẻ: *Học tập (Study)*, *Quan trọng (Urgent)*, *Ý tưởng (Idea)*, *Ôn tập (Review)*.
   - Lưu trữ offline an toàn bằng Capacitor Preferences.
   - Hiệu ứng animation mượt mà khi thêm và xóa.

3. **History Page (Lịch sử học tập)**
   - Danh sách phiên học và phiên nghỉ ngơi đã hoàn thành theo dòng thời gian.
   - Bảng KPI thống kê: *Số phiên hôm nay*, *Tổng thời gian tập trung*, *Số phiên nghỉ*.
   - Huy hiệu chúc mừng khi đạt các mốc mục tiêu.

4. **Settings Page (Cài đặt)**
   - Tùy chỉnh thanh trượt thời gian học (5 - 90 phút) và nghỉ ngơi (1 - 30 phút).
   - Bật/tắt rung haptics.
   - Bật/tắt Dark Mode chuẩn phong cách ban đêm.
   - Chuyển đổi ngôn ngữ tức thì: **Tiếng Việt 🇻🇳 / English 🇬🇧**.
   - Tự động chuyển phiên (Auto-switch).
   - Xóa toàn bộ dữ liệu ứng dụng với hộp thoại xác nhận.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Ionic React (`@ionic/react`), React 19, TypeScript
- **Routing**: `@ionic/react-router`, `react-router-dom`
- **Capacitor Plugins**:
  - `@capacitor/core` & `@capacitor/cli`
  - `@capacitor/local-notifications`
  - `@capacitor/preferences`
  - `@capacitor/haptics`
  - `@capacitor-community/keep-awake`
- **Styling**: SCSS (Sass) theo chuẩn Space Grotesk Font bắt buộc.
- **Visuals & 3D**: Three.js ambient focus particle orb, Canvas Confetti.
- **Icons**: Lucide Icons & Ionicons.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Khởi chạy trên trình duyệt Web (Dev mode)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ hiển thị (thường là `http://localhost:5173`).

### 2. Build ứng dụng sản phẩm
```bash
npm run build
```

### 3. Đồng bộ và chạy trên Android
```bash
# Thêm nền tảng Android (chỉ cần chạy lần đầu)
npx cap add android

# Đồng bộ code web vào thư mục native
npx cap sync android

# Mở ứng dụng trong Android Studio
npx cap open android
```

### 4. Đồng bộ và chạy trên iOS (trên máy macOS)
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```
