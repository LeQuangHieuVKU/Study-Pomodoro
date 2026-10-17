import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { LofiTrack, SoundSettings } from '../types';
import { LOFI_TRACKS } from '../data/soundTracks';
import { audioService } from '../services/audioService';

const PREF_SOUND_SETTINGS = 'study_pomodoro_sound_settings';

interface SoundContextType {
  isEnabled: boolean;
  isPlaying: boolean;
  currentTrack: LofiTrack;
  volume: number;
  tracks: LofiTrack[];
  toggleMasterSound: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  selectTrack: (track: LofiTrack) => Promise<void>;
  changeVolume: (val: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<LofiTrack>(LOFI_TRACKS[0]);
  const [volume, setVolume] = useState<number>(0.65);

  // Sync state with audioService listeners
  useEffect(() => {
    const unsubscribe = audioService.subscribe(() => {
      setIsPlaying(audioService.getIsPlaying());
      setCurrentTrack(audioService.getCurrentTrack());
      setVolume(audioService.getVolume());
    });
    return unsubscribe;
  }, []);

  // Load saved preferences on mount
  useEffect(() => {
    const loadSavedSound = async () => {
      try {
        const { value } = await Preferences.get({ key: PREF_SOUND_SETTINGS });
        if (value) {
          const parsed = JSON.parse(value) as SoundSettings;
          setIsEnabled(parsed.isEnabled);
          setVolume(parsed.volume ?? 0.65);
          audioService.setVolume(parsed.volume ?? 0.65);

          const savedTrack = LOFI_TRACKS.find((t) => t.id === parsed.activeTrackId && !t.isComingSoon) || LOFI_TRACKS[0];
          setCurrentTrack(savedTrack);
          audioService.setTrack(savedTrack, false);
        } else {
          audioService.setTrack(LOFI_TRACKS[0], false);
        }
      } catch (err) {
        console.warn('Could not load sound preferences', err);
      }
    };
    loadSavedSound();
  }, []);

  // Helper to persist settings
  const persistSettings = useCallback(async (enabled: boolean, trackId: string, vol: number) => {
    try {
      const data: SoundSettings = {
        isEnabled: enabled,
        activeTrackId: trackId,
        volume: vol,
      };
      await Preferences.set({
        key: PREF_SOUND_SETTINGS,
        value: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('Failed saving sound settings', e);
    }
  }, []);

  // Master Toggle (Bật / Tắt âm thanh nền)
  const toggleMasterSound = useCallback(async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    if (nextState) {
      await audioService.play();
      setIsPlaying(true);
    } else {
      audioService.pause();
      setIsPlaying(false);
    }

    await persistSettings(nextState, currentTrack.id, volume);
  }, [isEnabled, currentTrack.id, volume, persistSettings]);

  // Play / Pause Toggle
  const togglePlayPause = useCallback(async () => {
    if (!isEnabled) {
      setIsEnabled(true);
      await audioService.play();
      setIsPlaying(true);
      await persistSettings(true, currentTrack.id, volume);
    } else if (isPlaying) {
      audioService.pause();
      setIsPlaying(false);
    } else {
      await audioService.play();
      setIsPlaying(true);
    }
  }, [isEnabled, isPlaying, currentTrack.id, volume, persistSettings]);

  // Select Track
  const selectTrack = useCallback(async (track: LofiTrack) => {
    if (track.isComingSoon) return;
    setCurrentTrack(track);
    setIsEnabled(true);
    await audioService.setTrack(track, true);
    setIsPlaying(true);
    await persistSettings(true, track.id, volume);
  }, [volume, persistSettings]);

  // Volume slider
  const changeVolume = useCallback((val: number) => {
    setVolume(val);
    audioService.setVolume(val);
    persistSettings(isEnabled, currentTrack.id, val);
  }, [isEnabled, currentTrack.id, persistSettings]);

  return (
    <SoundContext.Provider
      value={{
        isEnabled,
        isPlaying,
        currentTrack,
        volume,
        tracks: LOFI_TRACKS,
        toggleMasterSound,
        togglePlayPause,
        selectTrack,
        changeVolume,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
