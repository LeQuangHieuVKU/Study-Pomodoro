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
    id: 'chime',
    nameVi: 'Chime',
    nameEn: 'Chime',
    descriptionVi: 'Chuông ngân trong trẻo, du dương',
    descriptionEn: 'Bright melodic ascending chime',
    iconName: 'Bell',
  },
  {
    id: 'bell',
    nameVi: 'Bell',
    nameEn: 'Bell',
    descriptionVi: 'Chuông thiền hòa âm êm dịu',
    descriptionEn: 'Soothing harmonic singing bowl chime',
    iconName: 'Bell',
  },
  {
    id: 'digital',
    nameVi: 'Digital',
    nameEn: 'Digital',
    descriptionVi: 'Âm ping điện tử trong trẻo, sắc nét',
    descriptionEn: 'Clean crystal digital ping',
    iconName: 'Zap',
  },
  {
    id: 'soft',
    nameVi: 'Soft',
    nameEn: 'Soft',
    descriptionVi: 'Giai điệu harp ngân nga, thư giãn',
    descriptionEn: 'Gentle ascending soft melody',
    iconName: 'Volume2',
  },
  {
    id: 'wood',
    nameVi: 'Wood',
    nameEn: 'Wood',
    descriptionVi: 'Gõ mõ / khối gỗ ấm áp, thư thái',
    descriptionEn: 'Warm acoustic wooden temple block',
    iconName: 'CircleDot',
  },
  {
    id: 'digitalSoft',
    nameVi: 'Digital Soft',
    nameEn: 'Digital Soft',
    descriptionVi: 'Âm điện tử dịu nhẹ, êm ái',
    descriptionEn: 'Warm rounded digital synth tone',
    iconName: 'Radio',
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

  // 1. Chime (Bright crystalline / wind chime arpeggio)
  playChime(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));
      const notes = [783.99, 1046.5, 1318.51, 1567.98]; // G5, C6, E6, G6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime((0.2 - idx * 0.03) * factor, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.45);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 2. Chuông nhẹ (Zen Bell)
  playBell(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [528, 660, 792, 1056];
      const factor = Math.max(0.01, Math.min(1, vol));

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime((0.24 - idx * 0.04) * factor, now + idx * 0.08 + 0.03);
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

  // 3. Tiếng Ping (Digital Ping)
  playPing(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));

      [880, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.26 * factor, now + idx * 0.06 + 0.015);
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

  // 4. Tiếng nước (Water Drop)
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

  // 5. Tiếng gỗ (Wooden Block)
  playWood(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));

      [0, 0.11].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        const baseFreq = idx === 0 ? 520 : 680;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + offset + 0.06);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq * 1.1, now + offset);
        filter.Q.setValueAtTime(4.2, now + offset);

        gain.gain.setValueAtTime(0.36 * factor, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 6. Piano ngắn (Piano Chord)
  playPiano(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0, now + idx * 0.03);
        gain.gain.linearRampToValueAtTime(0.18 * factor, now + idx * 0.03 + 0.02);
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

  // 7. Thông báo mềm (Soft Melody)
  playSoft(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));

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
        gain.gain.linearRampToValueAtTime(0.2 * factor, now + idx * 0.1 + 0.03);
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

  // 8. Digital Soft (Rounded electronic chime)
  playDigitalSoft(vol: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const factor = Math.max(0.01, Math.min(1, vol));

      const notes = [659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22 * factor, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Dispatch selected sound with optional volume scaling
  playNotification(type: NotificationSoundType = 'bell', vol: number = 1) {
    switch (type) {
      case 'chime':
        this.playChime(vol);
        break;
      case 'bell':
        this.playBell(vol);
        break;
      case 'digital':
      case 'ping':
        this.playPing(vol);
        break;
      case 'soft':
        this.playSoft(vol);
        break;
      case 'wood':
        this.playWood(vol);
        break;
      case 'digitalSoft':
        this.playDigitalSoft(vol);
        break;
      case 'water':
        this.playWater();
        break;
      case 'piano':
        this.playPiano(vol);
        break;
      default:
        this.playBell(vol);
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
