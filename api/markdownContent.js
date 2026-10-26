export const VALID_ROUTES = new Set(['/', '/timer', '/about', '/contact', '/privacy']);

export const HOMEPAGE_MD = `# StudyPomodoro – Free Online Pomodoro Study Timer & Lofi Music

StudyPomodoro (https://studypomodoro.id.vn/) is a free, aesthetic, privacy-first Pomodoro study timer designed to help students, developers, and knowledge workers enter deep focus states. It pairs the scientifically proven Pomodoro Technique with calming Lo-Fi music, task management, and daily focus tracking.

- **Website:** https://studypomodoro.id.vn/
- **License:** 100% Free, no ads, no trackers, no registration required.
- **Platforms:** Web, Windows, macOS, iOS, Android (Installable PWA with offline support).

## Key Features

- **Pomodoro Timer Engine:** Standard 25-minute focus intervals, 5-minute short breaks, and 15-minute long breaks after 4 sessions (customizable from 1 to 90 minutes).
- **Curated Lo-Fi Beats & YouTube Player:** 10 built-in offline Lo-Fi tracks and background YouTube audio streaming with volume controls.
- **Integrated Task Management:** Slideover task list with color labels, due dates, priority tags, and completion tracking.
- **Discipline & Session Analytics:** Real-time counters for completed focus sessions, total study minutes, and taken breaks, stored safely on your device.
- **Picture-in-Picture Mini-Timer:** Float the timer over other windows while reading or coding.
- **Progressive Web App (PWA):** Install to home screen or desktop with complete offline functionality.

## When to Use StudyPomodoro

- You need a distraction-free study clock with zero setup or sign-up friction.
- You want structured 25-minute study sprints with 5-minute restorative breaks.
- You want soothing Lo-Fi background music while studying or coding.
- You need an offline-capable focus tool for libraries or commutes.
- You care about privacy: all data stays locally on your device.

## Navigation & Trust Anchors

- [Pomodoro Timer](https://studypomodoro.id.vn/timer): Launch interactive focus clock
- [About StudyPomodoro](https://studypomodoro.id.vn/about): Methodology, features & PWA install guide
- [Contact Support](https://studypomodoro.id.vn/contact): Support email, developer credentials, and physical address
- [Privacy Policy](https://studypomodoro.id.vn/privacy): Zero-telemetry, local-first storage commitment
- [Agent Guide (llms.txt)](https://studypomodoro.id.vn/llms.txt): Machine-readable instructions for AI agents
- [Sitemap](https://studypomodoro.id.vn/sitemap.xml): XML index of crawlable endpoints
`;

export const ABOUT_MD = `# About StudyPomodoro

StudyPomodoro was created by Lê Quang Hiếu to provide students, researchers, and independent learners with a beautiful, ad-free, and respectful focus environment.

## The Pomodoro Technique

Created by Francesco Cirillo in the late 1980s, the Pomodoro Technique breaks cognitive work into 25-minute intervals separated by short 5-minute breaks. Every 4 cycles, a longer 15-to-30-minute break allows the brain to consolidate learning and recover focus.

## Installation as a Progressive Web App (PWA)

StudyPomodoro is engineered as an installable standalone PWA:
- **iOS (Safari):** Tap Share -> "Add to Home Screen".
- **Android (Chrome):** Tap Menu (⋮) -> "Install app" or "Add to Home Screen".
- **Desktop (Chrome/Edge):** Click the Install icon in the address bar.

## Trust & Ownership Links

- [Timer](https://studypomodoro.id.vn/timer)
- [Contact Support](https://studypomodoro.id.vn/contact)
- [Privacy Policy](https://studypomodoro.id.vn/privacy)
- [Agent Instructions](https://studypomodoro.id.vn/llms.txt)
- [Sitemap](https://studypomodoro.id.vn/sitemap.xml)
`;

export const CONTACT_MD = `# Contact & Support – StudyPomodoro

We welcome feedback, feature suggestions, bug reports, and collaboration inquiries.

## Official Contact Channels

- **Founder & Developer:** Lê Quang Hiếu
- **Institution:** Vietnam - Korea University of Information and Communication Technology (VKU)
- **Postal Address:** 470 Tran Dai Nghia, Hoa Quy, Ngu Hanh Son, Da Nang 550000, Vietnam
- **Support Email:** hieulq.23itb@vku.udn.vn
- **GitHub Repository:** https://github.com/LeQuangHieuVKU/Study-Pomodoro
- **Facebook:** https://www.facebook.com/quanghieu.le.3994885/
- **Expected Response Time:** 24–48 business hours

## Helpful Links

- [Homepage](https://studypomodoro.id.vn/)
- [About](https://studypomodoro.id.vn/about)
- [Privacy Policy](https://studypomodoro.id.vn/privacy)
- [Agent Instructions](https://studypomodoro.id.vn/llms.txt)
`;

export const PRIVACY_MD = `# Privacy Policy – StudyPomodoro

Last Updated: October 2026

StudyPomodoro is built on a strict privacy-first, local-first philosophy.

## 1. Zero Personal Data Collection
StudyPomodoro does not require user accounts, emails, or logins. We do not track, collect, or store any personal data on remote servers.

## 2. Local-Only Storage
All your study data—including completed session history, timer settings, task lists, and custom themes—is stored exclusively on your device using HTML5 localStorage and Capacitor Preferences. Your data never leaves your browser.

## 3. Third-Party Integrations
- **YouTube Audio:** When using the optional custom YouTube music feature, playback is streamed directly from YouTube under Google's Privacy Policy.
- **Google Fonts:** Typography stylesheets are loaded via Google Fonts CDN.

## 4. Analytics & Advertising
StudyPomodoro contains **zero advertisements**, **zero analytics trackers**, and **zero tracking cookies**.

## 5. Contact
For any privacy questions, contact: hieulq.23itb@vku.udn.vn or visit https://studypomodoro.id.vn/contact.
`;

export function getMarkdown(path) {
  const normalized = '/' + String(path || '').replace(/^\/+/, '').replace(/\/+$/, '');
  if (normalized === '/' || normalized === '/timer') return HOMEPAGE_MD;
  if (normalized === '/about') return ABOUT_MD;
  if (normalized === '/contact') return CONTACT_MD;
  if (normalized === '/privacy') return PRIVACY_MD;
  return null;
}

export function getNotFoundMarkdown(path) {
  const target = String(path || '/unknown');
  return `# 404 Not Found

The requested resource "${target}" does not exist on StudyPomodoro.

Please refer to our available documentation, sitemap, or tools:
- [Homepage & Pomodoro Timer](https://studypomodoro.id.vn/)
- [Agent Documentation & Use Cases (llms.txt)](https://studypomodoro.id.vn/llms.txt)
- [XML Sitemap](https://studypomodoro.id.vn/sitemap.xml)
- [About StudyPomodoro](https://studypomodoro.id.vn/about)
- [Contact Support](https://studypomodoro.id.vn/contact)
- [Privacy Policy](https://studypomodoro.id.vn/privacy)
`;
}

export function getNotFoundHtml(path) {
  const target = String(path || '/unknown');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 Not Found – StudyPomodoro</title>
  <meta name="robots" content="noindex, follow" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }
    .card { max-width: 540px; padding: 40px; border-radius: 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); }
    h1 { font-size: 3rem; margin: 0 0 10px 0; color: #818cf8; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .links { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    a { display: inline-block; padding: 10px 18px; border-radius: 10px; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    a.subtle { background: rgba(255,255,255,0.08); color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The requested path <code>${target}</code> does not exist on StudyPomodoro. Please visit one of our official resources below.</p>
    <div class="links">
      <a href="/">Go to Timer</a>
      <a href="/about" class="subtle">About</a>
      <a href="/contact" class="subtle">Contact</a>
      <a href="/privacy" class="subtle">Privacy</a>
      <a href="/llms.txt" class="subtle">llms.txt</a>
    </div>
  </div>
</body>
</html>`;
}
