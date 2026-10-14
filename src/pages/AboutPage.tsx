import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import {
  ArrowLeft,
  Timer,
  Headphones,
  FileText,
  Sparkles,
  ShieldCheck,
  Laptop,
  Smartphone,
  ChevronDown,
  Play,
  Coffee,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Download,
  Share2,
  Maximize2,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AboutThreeScene } from '../components/AboutThreeScene';
import {
  DesktopBrowserClockIcon,
  DesktopInstallBarIcon,
  DesktopDockAppIcon,
  MobileBrowserFrameIcon,
  MobileShareActionIcon,
  MobileAppGridGlowIcon,
} from '../components/InstallStepIcons';

const CTA_ROTATING_PHRASES_VI = [
  'cho một phiên học hiệu quả?',
  'chinh phục mục tiêu học tập?',
  'bước vào trạng thái tập trung?',
  'cho một phiên học năng suất?',
  'bứt phá giới hạn bản thân?',
  'tích lũy thêm kiến thức?',
  'hoàn thành mục tiêu hôm nay?',
  'bắt đầu hành trình học tập?',
  'dành thời gian cho chính mình?',
];

const CTA_ROTATING_PHRASES_EN = [
  'for an effective study session?',
  'to conquer your learning goals?',
  'to enter deep focus state?',
  'for a truly productive session?',
  'to break through your limits?',
  'to gain valuable knowledge?',
  'to complete today\'s goals?',
  'to begin your study journey?',
  'to dedicate time to yourself?',
];

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();
  const router = useIonRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  // Auto-detect device (Desktop vs Mobile)
  const [activePlatform, setActivePlatform] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    return isMobileUA || isSmallScreen ? 'mobile' : 'desktop';
  });
  const [showInstallToast, setShowInstallToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Scroll detection for header title visibility
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // 1. Typing animation for "Study Pomodoro" in Hero section
  const [typedTitle, setTypedTitle] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const fullTitle = 'Study Pomodoro';

  useEffect(() => {
    let charIndex = 0;
    setTypedTitle('');
    setIsTypingDone(false);

    const typingTimer = setInterval(() => {
      if (charIndex < fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTypingDone(true);
        clearInterval(typingTimer);
      }
    }, 85);

    return () => clearInterval(typingTimer);
  }, []);

  // 2. Cycling Typing Animation for CTA heading ("Sẵn sàng [phrase]?")
  const ctaPhrases = language === 'vi' ? CTA_ROTATING_PHRASES_VI : CTA_ROTATING_PHRASES_EN;
  const [ctaPhraseIdx, setCtaPhraseIdx] = useState(0);
  const [ctaDisplayText, setCtaDisplayText] = useState('');
  const [ctaIsDeleting, setCtaIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = ctaPhrases[ctaPhraseIdx % ctaPhrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!ctaIsDeleting) {
      if (ctaDisplayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setCtaDisplayText(currentPhrase.slice(0, ctaDisplayText.length + 1));
        }, 55);
      } else {
        // Full phrase displayed: pause for 2.2s before deleting
        timeout = setTimeout(() => {
          setCtaIsDeleting(true);
        }, 2200);
      }
    } else {
      if (ctaDisplayText.length > 0) {
        timeout = setTimeout(() => {
          setCtaDisplayText(ctaDisplayText.slice(0, -1));
        }, 26);
      } else {
        // Finished backspacing: switch to next phrase and loop back
        setCtaIsDeleting(false);
        setCtaPhraseIdx((prev) => (prev + 1) % ctaPhrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [ctaDisplayText, ctaIsDeleting, ctaPhraseIdx, ctaPhrases]);

  // 3. Typing animation for Installation Section (looping between Windows <-> MacOS or Android <-> iOS)
  const osWords = activePlatform === 'desktop' ? ['Windows', 'MacOS'] : ['Android', 'iOS'];
  const [osWordIdx, setOsWordIdx] = useState(0);
  const [typedOsText, setTypedOsText] = useState('');
  const [isOsDeleting, setIsOsDeleting] = useState(false);

  // Reset OS typing state when activePlatform switches
  useEffect(() => {
    setOsWordIdx(0);
    setTypedOsText('');
    setIsOsDeleting(false);
  }, [activePlatform]);

  useEffect(() => {
    const currentWord = osWords[osWordIdx % osWords.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isOsDeleting) {
      if (typedOsText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setTypedOsText(currentWord.slice(0, typedOsText.length + 1));
        }, 85);
      } else {
        // Full word typed: pause for 2.2s before deleting
        timeout = setTimeout(() => {
          setIsOsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedOsText.length > 0) {
        timeout = setTimeout(() => {
          setTypedOsText(typedOsText.slice(0, -1));
        }, 42);
      } else {
        // Finished deleting: pause 300ms, then switch to next word
        timeout = setTimeout(() => {
          setIsOsDeleting(false);
          setOsWordIdx((prev) => (prev + 1) % osWords.length);
        }, 300);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedOsText, isOsDeleting, osWordIdx, osWords]);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Listen to content scroll to toggle header title visibility
  useEffect(() => {
    let isMounted = true;
    let scrollEl: HTMLElement | null = null;

    const handleScrollEvent = () => {
      if (!scrollEl || !isMounted) return;
      setIsScrolled(scrollEl.scrollTop > 20);
    };

    const setupScroll = async () => {
      if (contentRef.current) {
        try {
          scrollEl = await contentRef.current.getScrollElement();
          if (scrollEl && isMounted) {
            scrollEl.addEventListener('scroll', handleScrollEvent, { passive: true });
          }
        } catch {
          window.addEventListener('scroll', handleScrollEvent, { passive: true });
        }
      }
    };

    setupScroll();

    return () => {
      isMounted = false;
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleScrollEvent);
      }
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);

  // 4. Trigger sweep animation on Pomodoro visual bar with 5-second interval loop when scrolled into Features section
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [sweepState, setSweepState] = useState<'idle' | 'sweep' | 'reset'>('idle');
  const [isLeaving, setIsLeaving] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let isMounted = true;

    const setupObserver = async () => {
      let scrollEl: HTMLElement | null = null;
      if (contentRef.current) {
        try {
          scrollEl = await contentRef.current.getScrollElement();
        } catch {
          // fallback
        }
      }

      if (!isMounted || !featuresRef.current) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setFeaturesVisible(entry.isIntersecting);
          });
        },
        {
          root: scrollEl,
          threshold: 0.2,
        }
      );

      observer.observe(featuresRef.current);
    };

    setupObserver();

    return () => {
      isMounted = false;
      if (observer) observer.disconnect();
    };
  }, []);

  // 5-second interval loop: wipe (1050ms) -> stay full for 5s -> smooth reset (280ms) -> wipe again
  useEffect(() => {
    if (!featuresVisible) {
      setSweepState('idle');
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const runSweepCycle = () => {
      if (isCancelled) return;
      setSweepState('sweep');

      // Total wipe duration is 1050ms. After finishing, wait 5000ms.
      timer = setTimeout(() => {
        if (isCancelled) return;
        setSweepState('reset');

        // Reset transition takes 280ms, then restart sweep
        timer = setTimeout(() => {
          if (isCancelled) return;
          runSweepCycle();
        }, 280);
      }, 1050 + 5000);
    };

    runSweepCycle();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [featuresVisible]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallToast(true);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleStartFocus = () => {
    router.push('/timer', 'root', 'replace');
  };

  const handleBackToSettings = () => {
    setIsLeaving(true);
    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push('/settings', 'root', 'replace');
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('about-features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ List configuration
  const faqItems = [
    { q: t('aboutFaqQ1'), a: t('aboutFaqA1') },
    { q: t('aboutFaqQ2'), a: t('aboutFaqA2') },
    { q: t('aboutFaqQ3'), a: t('aboutFaqA3') },
    { q: t('aboutFaqQ4'), a: t('aboutFaqA4') },
    { q: t('aboutFaqQ5'), a: t('aboutFaqA5') },
    { q: t('aboutFaqQ6'), a: t('aboutFaqA6') },
  ];

  return (
    <IonPage className="about-page-root">
      {/* Fixed Back Button - Always pinned at top-left (position: fixed) */}
      <button
        type="button"
        className="about-back-btn"
        onClick={handleBackToSettings}
        aria-label={t('backToSettings')}
      >
        <ArrowLeft size={19} />
        <span className="about-back-text">{t('backBtn')}</span>
      </button>

      {/* Top Header - "Giới thiệu" title that hides when user scrolls down */}
      <IonHeader className={`ion-no-border about-header-bar ${isScrolled ? 'is-scrolled' : ''}`}>
        <IonToolbar className="about-toolbar">
          <div className="about-header-inner">
            <h1 className={`about-header-title ${isScrolled ? 'title-hidden' : ''}`}>
              {t('aboutTitle')}
            </h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        ref={contentRef}
        fullscreen
        className="about-content-area"
        scrollEvents={true}
        onIonScroll={(e) => {
          const top = e.detail?.scrollTop ?? 0;
          setIsScrolled(top > 20);
        }}
      >
        <div className="about-page-wrapper">
          {/* SECTION A: HERO HEADER WITH 3D TOMATO TIMER & TYPING ANIMATION */}
          <section className="about-hero-section">
            <div className="about-hero-content">
              <div className="about-badge-pill">
                <Sparkles size={14} className="badge-icon-spark" />
                <span>{t('aboutHeroBadge')}</span>
              </div>

              {/* Typing Animated Brand Title */}
              <h1 className="about-app-brand">
                <span>{typedTitle}</span>
                <span className={`typing-cursor ${isTypingDone ? 'is-blinking' : ''}`}>|</span>
              </h1>
              <h2 className="about-hero-slogan">{t('aboutHeroHeading')}</h2>

              <p className="about-hero-desc">{t('aboutHeroDescription')}</p>

              <div className="about-hero-actions">
                <button
                  type="button"
                  className="about-primary-cta"
                  onClick={handleStartFocus}
                >
                  <Play size={18} fill="currentColor" />
                  <span>{t('aboutStartFocusBtn')}</span>
                </button>
                <button
                  type="button"
                  className="about-secondary-cta"
                  onClick={scrollToFeatures}
                >
                  <Compass size={18} />
                  <span>{t('aboutExploreFeaturesBtn')}</span>
                </button>
              </div>
            </div>

            {/* Interactive 3D Pomodoro Tomato Timer Canvas */}
            <div className="about-hero-3d-wrapper">
              <AboutThreeScene isLeaving={isLeaving} />
              <span className="about-3d-hint">3D Pomodoro Tomato Timer</span>
            </div>
          </section>

          {/* SECTION B: CORE HIGHLIGHTS BENTO GRID */}
          <section id="about-features-section" ref={featuresRef} className="about-section">
            <div className="section-title-block">
              <span className="section-eyebrow">Pillars of Productivity</span>
              <h3 className="section-main-heading">{t('aboutFeaturesTitle')}</h3>
              <p className="section-sub-heading">{t('aboutFeaturesSubtitle')}</p>
            </div>

            <div className="about-bento-grid">
              {/* Feature 1: Pomodoro Timer */}
              <div className="about-feature-card feat-timer">
                <div className="feat-card-header">
                  <div className="feat-icon-box icon-indigo">
                    <Timer size={22} />
                  </div>
                  <span className="feat-chip-badge">25 / 5 / 15m</span>
                </div>
                <h4 className="feat-card-title">{t('aboutFeat1Title')}</h4>
                <p className="feat-card-desc">{t('aboutFeat1Desc')}</p>
                <div className={`feat-visual-bar ${sweepState === 'sweep' ? 'animate-sweep' : sweepState === 'reset' ? 'animate-reset' : ''}`}>
                  <span className="bar-segment seg-focus" />
                  <span className="bar-segment seg-break" />
                  <span className="bar-segment seg-long" />
                </div>
              </div>

              {/* Feature 2: Ambient Audio & YouTube */}
              <div className="about-feature-card feat-audio">
                <div className="feat-card-header">
                  <div className="feat-icon-box icon-rose">
                    <Headphones size={22} />
                  </div>
                  <span className="feat-chip-badge">Lofi & YouTube</span>
                </div>
                <h4 className="feat-card-title">{t('aboutFeat2Title')}</h4>
                <p className="feat-card-desc">{t('aboutFeat2Desc')}</p>
                <div className="feat-sound-tags">
                  <span className="sound-mini-pill">Chillhop Beats</span>
                  <span className="sound-mini-pill">Deep Focus</span>
                  <span className="sound-mini-pill">Rain Ambience</span>
                </div>
              </div>

              {/* Feature 3: Smart Notes & To-Do */}
              <div className="about-feature-card feat-notes">
                <div className="feat-card-header">
                  <div className="feat-icon-box icon-emerald">
                    <FileText size={22} />
                  </div>
                  <span className="feat-chip-badge">To-Do & Calendar</span>
                </div>
                <h4 className="feat-card-title">{t('aboutFeat3Title')}</h4>
                <p className="feat-card-desc">{t('aboutFeat3Desc')}</p>
                <div className="feat-status-chips-preview">
                  <span className="preview-chip chip-pending">Chờ xử lý</span>
                  <span className="preview-chip chip-doing">Đang làm</span>
                  <span className="preview-chip chip-done">Đã xong</span>
                </div>
              </div>

              {/* Feature 4: Atmospheric Visuals */}
              <div className="about-feature-card feat-visuals">
                <div className="feat-card-header">
                  <div className="feat-icon-box icon-cyan">
                    <Sparkles size={22} />
                  </div>
                  <span className="feat-chip-badge">Wave • Rain • Particles</span>
                </div>
                <h4 className="feat-card-title">{t('aboutFeat4Title')}</h4>
                <p className="feat-card-desc">{t('aboutFeat4Desc')}</p>
              </div>

              {/* Feature 5: 100% Privacy & Offline */}
              <div className="about-feature-card feat-privacy">
                <div className="feat-card-header">
                  <div className="feat-icon-box icon-amber">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="feat-chip-badge">100% Local Device</span>
                </div>
                <h4 className="feat-card-title">{t('aboutFeat5Title')}</h4>
                <p className="feat-card-desc">{t('aboutFeat5Desc')}</p>
              </div>
            </div>
          </section>

          {/* SECTION C: HOW IT WORKS (4 STEPS) */}
          <section className="about-section">
            <div className="section-title-block">
              <span className="section-eyebrow">Simple Workflow</span>
              <h3 className="section-main-heading">{t('aboutHowTitle')}</h3>
              <p className="section-sub-heading">{t('aboutHowSubtitle')}</p>
            </div>

            <div className="about-steps-grid">
              <div className="about-step-card">
                <span className="step-number-tag">01</span>
                <div className="step-icon-circle">
                  <FileText size={20} />
                </div>
                <h4 className="step-title">{t('aboutStep1Title')}</h4>
                <p className="step-desc">{t('aboutStep1Desc')}</p>
              </div>

              <div className="about-step-card">
                <span className="step-number-tag">02</span>
                <div className="step-icon-circle">
                  <Headphones size={20} />
                </div>
                <h4 className="step-title">{t('aboutStep2Title')}</h4>
                <p className="step-desc">{t('aboutStep2Desc')}</p>
              </div>

              <div className="about-step-card">
                <span className="step-number-tag">03</span>
                <div className="step-icon-circle">
                  <Zap size={20} />
                </div>
                <h4 className="step-title">{t('aboutStep3Title')}</h4>
                <p className="step-desc">{t('aboutStep3Desc')}</p>
              </div>

              <div className="about-step-card">
                <span className="step-number-tag">04</span>
                <div className="step-icon-circle">
                  <Coffee size={20} />
                </div>
                <h4 className="step-title">{t('aboutStep4Title')}</h4>
                <p className="step-desc">{t('aboutStep4Desc')}</p>
              </div>
            </div>
          </section>

          {/* SECTION D: THE POMODORO TECHNIQUE */}
          <section className="about-section">
            <div className="section-title-block">
              <span className="section-eyebrow">Cognitive Science</span>
              <h3 className="section-main-heading">{t('aboutPomoTitle')}</h3>
              <p className="section-sub-heading">{t('aboutPomoSubtitle')}</p>
            </div>

            <div className="about-pomo-breakdown-card">
              <div className="pomo-overview-header">
                <Clock size={24} className="text-indigo-400" />
                <div>
                  <h4 className="pomo-overview-title">{t('aboutPomoPrincipleTitle')}</h4>
                  <p className="pomo-overview-desc">{t('aboutPomoPrincipleDesc')}</p>
                </div>
              </div>

              {/* 3-Phases Interactive Breakdown */}
              <div className="pomo-phases-container">
                {/* Phase 1 */}
                <div className="pomo-phase-item phase-focus">
                  <div className="phase-duration-badge">
                    <span className="duration-num">25</span>
                    <span className="duration-unit">MIN</span>
                  </div>
                  <div className="phase-details">
                    <h5 className="phase-heading">{t('aboutPomoFocus25Title')}</h5>
                    <p className="phase-text">{t('aboutPomoFocus25Desc')}</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="phase-connector-line">
                  <span className="connector-dot" />
                </div>

                {/* Phase 2 */}
                <div className="pomo-phase-item phase-short-break">
                  <div className="phase-duration-badge">
                    <span className="duration-num">5</span>
                    <span className="duration-unit">MIN</span>
                  </div>
                  <div className="phase-details">
                    <h5 className="phase-heading">{t('aboutPomoBreak5Title')}</h5>
                    <p className="phase-text">{t('aboutPomoBreak5Desc')}</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="phase-connector-line">
                  <span className="connector-dot" />
                </div>

                {/* Phase 3 */}
                <div className="pomo-phase-item phase-long-break">
                  <div className="phase-duration-badge">
                    <span className="duration-num">15-30</span>
                    <span className="duration-unit">MIN</span>
                  </div>
                  <div className="phase-details">
                    <h5 className="phase-heading">{t('aboutPomoLongBreakSub')}</h5>
                    <p className="phase-text">{t('aboutPomoLongBreakDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION E: INSTALLATION SECTION (DESKTOP & MOBILE WITH CUSTOM SVG ICONS) */}
          <section className="about-section about-install-section">
            <div className="install-banner-header">
              <span className="section-eyebrow">
                {activePlatform === 'desktop'
                  ? (language === 'vi' ? 'Dành cho Windows & MacOS' : 'For Windows & MacOS')
                  : (language === 'vi' ? 'Dành cho Android & iOS' : 'For Android & iOS')}
              </span>

              {/* Big, Clear Title with Typing Animation (Windows <-> MacOS or Android <-> iOS) */}
              <h3 className="install-main-title">
                <span className="install-title-prefix">
                  {language === 'vi' ? 'Cài đặt Study Pomodoro cho ' : 'Install Study Pomodoro for '}
                </span>
                <span className="install-typing-os">{typedOsText}</span>
                <span className="install-typing-cursor">|</span>
              </h3>

              <p className="install-subtitle">
                {activePlatform === 'desktop'
                  ? (language === 'vi'
                      ? 'Cài đặt trực tiếp từ trình duyệt trong vài giây. Khởi chạy độc lập, hoạt động ngoại tuyến và tập trung tối đa.'
                      : 'Install directly from your browser in seconds. Runs as a standalone app with full offline focus.')
                  : (language === 'vi'
                      ? 'Thêm vào màn hình chính điện thoại, mở toàn màn hình tức thì như app tải từ Store mà không tốn dung lượng.'
                      : 'Add to your phone home screen for instant full-screen focus, just like a native app.')}
              </p>

              {/* Action Deck: Platform Switcher Tabs & Prominent "Cài đặt ngay" Button */}
              <div className="install-action-deck">
                <div className="install-platform-tabs">
                  <button
                    type="button"
                    className={`platform-tab-btn ${activePlatform === 'desktop' ? 'active' : ''}`}
                    onClick={() => setActivePlatform('desktop')}
                  >
                    <Laptop size={16} />
                    <span>{language === 'vi' ? 'Máy tính (Windows / Mac)' : 'Desktop (PC / Mac)'}</span>
                  </button>
                  <button
                    type="button"
                    className={`platform-tab-btn ${activePlatform === 'mobile' ? 'active' : ''}`}
                    onClick={() => setActivePlatform('mobile')}
                  >
                    <Smartphone size={16} />
                    <span>{language === 'vi' ? 'Điện thoại (iOS / Android)' : 'Mobile (iOS / Android)'}</span>
                  </button>
                </div>

                {/* Prominent "Cài đặt ngay" Button */}
                <button
                  type="button"
                  className="install-now-hero-btn"
                  onClick={handleInstallClick}
                >
                  <Download size={18} />
                  <span>{language === 'vi' ? 'Cài đặt ngay' : 'Install Now'}</span>
                </button>
              </div>
            </div>

            {/* Exactly 3 Steps Cards (01, 02, 03) */}
            <div className="install-steps-triad-grid">
              {activePlatform === 'desktop' ? (
                <>
                  {/* Desktop Step 01 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-cyan">
                        <DesktopBrowserClockIcon />
                      </div>
                      <span className="step-giant-number">01</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Mở trong trình duyệt' : 'Open in browser'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Vào bộ hẹn giờ bằng Chrome, Edge hoặc trình duyệt Chromium khác trên máy tính.'
                        : 'Open the timer in Chrome, Edge, or other Chromium browsers on your computer.'}
                    </p>
                  </div>

                  {/* Desktop Step 02 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-indigo">
                        <DesktopInstallBarIcon />
                      </div>
                      <span className="step-giant-number">02</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Nhấn cài đặt' : 'Click Install'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Nhấn biểu tượng cài đặt trên thanh địa chỉ — hoặc nút ở trên nơi được hỗ trợ.'
                        : 'Click the install icon on the address bar — or the button above where supported.'}
                    </p>
                  </div>

                  {/* Desktop Step 03 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-emerald">
                        <DesktopDockAppIcon />
                      </div>
                      <span className="step-giant-number">03</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Mở ở bất cứ đâu' : 'Open anywhere'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Nó xuất hiện trên dock hay thanh tác vụ và mở như một ứng dụng thực thụ, dù trực tuyến hay không.'
                        : 'It appears on your dock or taskbar and opens like a real app, online or offline.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Step 01 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-cyan">
                        <MobileBrowserFrameIcon />
                      </div>
                      <span className="step-giant-number">01</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Mở bằng trình duyệt' : 'Open with browser'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Mở Study Pomodoro bằng Chrome (Android) hoặc Safari (iOS).'
                        : 'Open Study Pomodoro with Chrome (Android) or Safari (iOS).'}
                    </p>
                  </div>

                  {/* Mobile Step 02 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-indigo">
                        <MobileShareActionIcon />
                      </div>
                      <span className="step-giant-number">02</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Thêm vào màn hình chính' : 'Add to Home Screen'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Nhấn nút Chia sẻ hoặc menu trình duyệt và chọn “Thêm vào màn hình chính”.'
                        : 'Tap the Share button or browser menu and choose “Add to Home Screen”.'}
                    </p>
                  </div>

                  {/* Mobile Step 03 */}
                  <div className="install-step-card">
                    <div className="step-card-top-row">
                      <div className="step-icon-wrap icon-emerald">
                        <MobileAppGridGlowIcon />
                      </div>
                      <span className="step-giant-number">03</span>
                    </div>
                    <h4 className="step-card-title">
                      {language === 'vi' ? 'Mở như ứng dụng' : 'Open as an app'}
                    </h4>
                    <p className="step-card-desc">
                      {language === 'vi'
                        ? 'Biểu tượng sẽ xuất hiện trên màn hình chính và mở như một ứng dụng thật, kể cả khi offline.'
                        : 'The icon will appear on your home screen and open like a real app, even offline.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* SECTION F: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
          <section className="about-section">
            <div className="section-title-block">
              <span className="section-eyebrow">Help & Clarity</span>
              <h3 className="section-main-heading">{t('aboutFaqTitle')}</h3>
              <p className="section-sub-heading">{t('aboutFaqSubtitle')}</p>
            </div>

            <div className="about-faq-accordion-list">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-answer-body">
                        <p className="faq-answer-text">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION G: BOTTOM CALL-TO-ACTION CARD WITH DYNAMIC ROTATING TYPING EFFECT */}
          <section className="about-final-cta-section">
            <div className="final-cta-card">
              <div className="final-cta-glow-bg" />
              <div className="final-cta-content">
                <span className="final-cta-eyebrow">Begin Your Flow State</span>

                {/* Sẵn sàng + Cycling Typing Animation Phrase */}
                <h3 className="final-cta-heading">
                  <span className="cta-prefix-word">{language === 'vi' ? 'Sẵn sàng ' : 'Ready '}</span>
                  <span className="cta-rotating-text">{ctaDisplayText}</span>
                  <span className="cta-typing-cursor">|</span>
                </h3>

                <p className="final-cta-subtitle">{t('aboutFooterSubtitle')}</p>

                <button
                  type="button"
                  className="final-cta-launch-btn"
                  onClick={handleStartFocus}
                >
                  <Play size={20} fill="currentColor" />
                  <span>{t('aboutReturnTimerBtn')}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Minimalist Tech Footer */}
          <footer className="about-app-footer">
            <p className="footer-credits-text">
              StudyPomodoro v1.2.0 • React + TypeScript + Capacitor + Three.js
            </p>
          </footer>
        </div>

        {/* Installation guide toast */}
        <IonToast
          isOpen={showInstallToast}
          onDidDismiss={() => setShowInstallToast(false)}
          message={t('installGuideToast')}
          duration={3500}
          position="bottom"
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};
