import type { LofiTrack } from '../types';
import { LOFI_TRACKS } from '../data/soundTracks';

type AudioEventListener = () => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: LofiTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.65;
  private listeners: Set<AudioEventListener> = new Set();
  private audioContext: AudioContext | null = null;
  private isSynthesizingFallback: boolean = false;
  private synthGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.preload = 'none'; // Never download audio bytes until user actively plays sound

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyListeners();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio streaming encountered an issue, trying recovery', e);
      // If network fails, stop isPlaying state gracefully
      this.isPlaying = false;
      this.notifyListeners();
    });
  }

  public subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  public getCurrentTrack(): LofiTrack {
    if (!this.currentTrack) {
      this.currentTrack = LOFI_TRACKS[0];
    }
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying || this.isSynthesizingFallback;
  }

  public getVolume(): number {
    return this.volume;
  }

  public async setTrack(track: LofiTrack, autoPlay: boolean = true): Promise<void> {
    if (track.isComingSoon || !track.url) return;
    this.initAudio();
    this.stopFallbackSynth();

    const isDifferentTrack = !this.currentTrack || this.currentTrack.id !== track.id;
    this.currentTrack = track;

    if (this.audio && isDifferentTrack && autoPlay) {
      this.audio.src = track.url;
      this.audio.preload = 'auto';
      this.audio.load();
    }

    if (autoPlay) {
      await this.play();
    } else {
      this.notifyListeners();
    }
  }

  public async play(): Promise<void> {
    this.initAudio();
    if (!this.currentTrack || this.currentTrack.isComingSoon) {
      this.currentTrack = LOFI_TRACKS[0];
    }

    if (this.audio && this.currentTrack.url) {
      const cleanUrl = this.currentTrack.url.replace(/^\//, '');
      if (!this.audio.src || !this.audio.src.endsWith(cleanUrl)) {
        this.audio.src = this.currentTrack.url;
      }
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      try {
        await this.audio.play();
        this.isPlaying = true;
      } catch (err: any) {
        console.warn('HTML5 Audio play interrupted or blocked by autoplay policy:', err?.message);
        // If playback failed due to offline/network, provide gentle fallback
        if (err?.name === 'NotSupportedError' || err?.name === 'NetworkError') {
          this.startFallbackSynth();
        }
      }
    }
    this.notifyListeners();
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopFallbackSynth();
    this.isPlaying = false;
    this.notifyListeners();
  }

  public toggle(): Promise<void> {
    if (this.getIsPlaying()) {
      this.pause();
      return Promise.resolve();
    } else {
      return this.play();
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
    }
    if (this.synthGainNode) {
      this.synthGainNode.gain.setValueAtTime(clamped * 0.15, this.audioContext?.currentTime || 0);
    }
    this.notifyListeners();
  }

  // Gentle ambient synthesizer fallback (chords & white noise) if offline
  private startFallbackSynth() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      this.synthGainNode = this.audioContext.createGain();
      this.synthGainNode.gain.setValueAtTime(this.volume * 0.12, this.audioContext.currentTime);
      this.synthGainNode.connect(this.audioContext.destination);

      // Create warm gentle sine waves (Cmaj7 / Am9 chords)
      const freqs = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3
      freqs.forEach((f) => {
        if (!this.audioContext || !this.synthGainNode) return;
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.audioContext.currentTime);
        osc.connect(this.synthGainNode);
        osc.start();
      });

      this.isSynthesizingFallback = true;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Fallback synth active', e);
    }
  }

  private stopFallbackSynth() {
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
      this.synthGainNode = null;
      this.isSynthesizingFallback = false;
    }
  }
}

export const audioService = new AudioService();
