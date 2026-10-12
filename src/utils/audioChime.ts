import type { NotificationSoundType } from '../types';

export interface NotificationSoundOption {
  id: NotificationSoundType;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  iconName: string;
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  {
    id: 'bell',
    nameVi: 'Chuông nhẹ',
    nameEn: 'Zen Bell',
    descriptionVi: 'Chuông thiền hòa âm êm dịu, lắng đọng',
    descriptionEn: 'Soothing harmonic singing bowl chime',
    iconName: 'Bell',
  },
  {
    id: 'ping',
    nameVi: 'Tiếng Ping',
    nameEn: 'Digital Ping',
    descriptionVi: 'Âm ping pha lê trong trẻo, hiện đại',
    descriptionEn: 'Clean crystal digital ping',
    iconName: 'Sparkles',
  },
  {
    id: 'water',
    nameVi: 'Tiếng nước',
    nameEn: 'Water Drop',
    descriptionVi: 'Giọt nước rơi thánh thót, mát lành',
    descriptionEn: 'Natural resonant water droplet',
    iconName: 'Droplets',
  },
  {
    id: 'wood',
    nameVi: 'Tiếng gỗ',
    nameEn: 'Wooden Block',
    descriptionVi: 'Gõ mõ / khối gỗ ấm áp, thư thái',
    descriptionEn: 'Warm acoustic wooden temple block',
    iconName: 'CircleDot',
  },
  {
    id: 'piano',
    nameVi: 'Piano ngắn',
    nameEn: 'Piano Chord',
    descriptionVi: 'Hợp âm piano du dương, ấm áp',
    descriptionEn: 'Warm acoustic piano major chord',
    iconName: 'Music',
  },
  {
    id: 'soft',
    nameVi: 'Thông báo mềm',
    nameEn: 'Soft Melody',
    descriptionVi: 'Giai điệu harp ngân nga, thư giãn',
    descriptionEn: 'Gentle ascending harp melody',
    iconName: 'Volume2',
  },
];

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Chuông nhẹ (Zen Bell)
  playBell() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [528, 660, 792, 1056];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.24 - idx * 0.04, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.15);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 2. Tiếng Ping (Digital Ping)
  playPing() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [880, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.26, now + idx * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.95);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 3. Tiếng nước (Water Drop)
  playWater() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1220, now + 0.16);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      // Secondary echo ripple
      setTimeout(() => {
        const ctx2 = this.getContext();
        if (!ctx2) return;
        const t2 = ctx2.currentTime;
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, t2);
        osc2.frequency.exponentialRampToValueAtTime(1620, t2 + 0.06);

        gain2.gain.setValueAtTime(0.01, t2);
        gain2.gain.linearRampToValueAtTime(0.18, t2 + 0.025);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.28);

        osc2.connect(gain2);
        gain2.connect(ctx2.destination);

        osc2.start(t2);
        osc2.stop(t2 + 0.3);
      }, 120);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 4. Tiếng gỗ (Wooden Block)
  playWood() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, now);
      filter.Q.setValueAtTime(3.6, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 5. Piano ngắn (Piano Chord)
  playPiano() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0, now + idx * 0.03);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.03 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 1.45);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 6. Thông báo mềm (Soft Melody)
  playSoft() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const freqs = [698.46, 880.0, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.25);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Dispatch selected sound
  playNotification(type: NotificationSoundType = 'bell') {
    switch (type) {
      case 'ping':
        this.playPing();
        break;
      case 'water':
        this.playWater();
        break;
      case 'wood':
        this.playWood();
        break;
      case 'piano':
        this.playPiano();
        break;
      case 'soft':
        this.playSoft();
        break;
      case 'bell':
      default:
        this.playBell();
        break;
    }
  }

  // Backward compatibility
  playFocusComplete(type: NotificationSoundType = 'bell') {
    this.playNotification(type);
  }

  playBreakComplete(type: NotificationSoundType = 'bell') {
    this.playNotification(type);
  }

  // Soft tactile click for button actions
  playTap() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignored
    }
  }
}

export const soundManager = new SoundManager();
