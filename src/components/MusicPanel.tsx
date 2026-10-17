import React, { useState, useEffect } from 'react';
import {
  X,
  Music,
  Disc,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { Preferences } from '@capacitor/preferences';
import { useLanguage } from '../i18n/LanguageContext';
import { useSound } from '../context/SoundContext';
import {
  fetchYouTubeTitle,
  isValidYouTubeUrl,
  YOUTUBE_URL_STORAGE_KEY,
  YOUTUBE_TITLE_STORAGE_KEY,
} from '../services/youtubeService';
import type { LofiTrack } from '../types';

export interface MusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onYtPlayingChange?: (isPlaying: boolean) => void;
  stopYtRef?: React.MutableRefObject<(() => void) | null>;
}

export const MusicPanel: React.FC<MusicPanelProps> = ({
  isOpen,
  onClose,
  onYtPlayingChange,
  stopYtRef,
}) => {
  const { language } = useLanguage();
  const {
    isEnabled,
    isPlaying,
    currentTrack,
    volume,
    tracks,
    toggleMasterSound,
    togglePlayPause,
    selectTrack,
    changeVolume,
  } = useSound();

  // YouTube audio player state
  const [ytInputUrl, setYtInputUrl] = useState('');
  const [ytActiveUrl, setYtActiveUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [isYtExpanded, setIsYtExpanded] = useState(false);

  // Notify parent of YouTube play state
  useEffect(() => {
    onYtPlayingChange?.(isYtPlaying);
  }, [isYtPlaying, onYtPlayingChange]);

  // Expose stop function to parent via ref
  useEffect(() => {
    if (stopYtRef) {
      stopYtRef.current = () => {
        setIsYtPlaying(false);
      };
    }
    return () => {
      if (stopYtRef) {
        stopYtRef.current = null;
      }
    };
  }, [stopYtRef]);

  // Load saved YouTube URL & Title
  useEffect(() => {
    Promise.all([
      Preferences.get({ key: YOUTUBE_URL_STORAGE_KEY }),
      Preferences.get({ key: YOUTUBE_TITLE_STORAGE_KEY }),
    ])
      .then(([{ value: savedUrl }, { value: savedTitle }]) => {
        if (savedUrl) {
          setYtInputUrl(savedUrl);
          setYtActiveUrl(savedUrl);
          if (savedTitle) {
            setYtTitle(savedTitle);
          } else {
            fetchYouTubeTitle(savedUrl).then((title) => {
              if (title) {
                setYtTitle(title);
                Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: title }).catch(console.error);
              }
            });
          }
        }
      })
      .catch(console.error);
  }, []);

  // Escape key handler to close panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle YouTube Play/Pause Toggle
  const handleToggleYtPlay = async () => {
    const trimmed = ytInputUrl.trim();
    if (!trimmed) {
      setYtError(
        language === 'vi'
          ? 'Vui lòng dán link YouTube'
          : 'Please paste a YouTube link'
      );
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setYtError(
        language === 'vi'
          ? 'Link không hợp lệ (youtube.com, youtu.be)'
          : 'Invalid link (youtube.com, youtu.be)'
      );
      return;
    }

    setYtError(null);

    if (trimmed !== ytActiveUrl) {
      setYtActiveUrl(trimmed);
      setIsYtPlaying(true);
      setIsFetchingTitle(true);

      fetchYouTubeTitle(trimmed)
        .then((title) => {
          if (title) {
            setYtTitle(title);
            Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: title }).catch(console.error);
          }
        })
        .finally(() => {
          setIsFetchingTitle(false);
        });

      // Pause Lofi so only 1 source plays
      if (isPlaying) {
        await togglePlayPause();
      }
      Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: trimmed }).catch(console.error);
    } else {
      const nextPlay = !isYtPlaying;
      setIsYtPlaying(nextPlay);
      if (nextPlay && isPlaying) {
        await togglePlayPause();
      }
    }
  };

  const handleClearYt = () => {
    setIsYtPlaying(false);
    setYtActiveUrl('');
    setYtInputUrl('');
    setYtTitle('');
    setYtError(null);
    Preferences.remove({ key: YOUTUBE_URL_STORAGE_KEY }).catch(console.error);
    Preferences.remove({ key: YOUTUBE_TITLE_STORAGE_KEY }).catch(console.error);
  };

  // Next Track Handler (supports Lofi and transition to YouTube)
  const handleNextTrack = async () => {
    const playable = tracks.filter((t) => !t.isComingSoon && t.url);
    if (playable.length === 0) return;

    if (isYtPlaying) {
      // Đang phát YouTube -> Next quay lại bài Lofi đầu tiên
      setIsYtPlaying(false);
      await selectTrack(playable[0]);
      return;
    }

    // Đang phát Lofi:
    const curIdx = playable.findIndex((t) => t.id === currentTrack.id);
    const isLastLofiTrack = curIdx >= playable.length - 1;

    if (isLastLofiTrack) {
      // Khi đã hết list Lofi -> nếu có link YouTube thì chuyển sang phát YouTube
      const targetYt = (ytActiveUrl || ytInputUrl).trim();
      if (targetYt && isValidYouTubeUrl(targetYt)) {
        if (isPlaying) {
          await togglePlayPause();
        }
        setYtActiveUrl(targetYt);
        setIsYtPlaying(true);
        fetchYouTubeTitle(targetYt).then((title) => {
          if (title) setYtTitle(title);
        });
        return;
      }
      // Nếu không có YouTube -> quay lại bài Lofi đầu
      await selectTrack(playable[0]);
    } else {
      // Next lần lượt trong các bài Lofi có file thật
      await selectTrack(playable[curIdx + 1]);
    }
  };

  // Select Lofi Track
  const handleSelectLofiTrack = async (track: LofiTrack) => {
    if (track.isComingSoon) return;
    if (isYtPlaying) {
      setIsYtPlaying(false);
    }
    await selectTrack(track);
  };

  // Toggle Master Sound
  const handleToggleMasterSound = async () => {
    if (!isEnabled && isYtPlaying) {
      setIsYtPlaying(false);
    }
    await toggleMasterSound();
  };

  // Audio source state (YouTube takes priority when playing)
  const isYouTubeActive = isYtPlaying;
  const isLofiActive = isEnabled && !isYtPlaying;
  const isAnyAudioActive = isYouTubeActive || isLofiActive;
  const isCurrentAudioPlaying = isYouTubeActive ? isYtPlaying : isPlaying;

  const handleToggleCurrentAudio = async () => {
    if (isYouTubeActive) {
      await handleToggleYtPlay();
    } else {
      await togglePlayPause();
    }
  };

  return (
    <>
      {/* Hidden ReactPlayer to stream YouTube audio in-app continuously */}
      {ytActiveUrl && (
        <div style={{ display: 'none' }} aria-hidden="true">
          <ReactPlayer
            src={ytActiveUrl}
            playing={isYtPlaying}
            volume={volume}
            width="100%"
            height="100%"
            controls={false}
            playsInline
            onReady={() => setYtError(null)}
            onPlay={() => setIsYtPlaying(true)}
            onPause={() => setIsYtPlaying(false)}
            onError={(err) => {
              console.warn('ReactPlayer error:', err);
              setIsYtPlaying(false);
              setYtError(
                language === 'vi'
                  ? 'Không thể phát video này'
                  : 'Cannot play this video'
              );
            }}
            onEnded={() => setIsYtPlaying(false)}
          />
        </div>
      )}

      {/* Popover Card & Transparent / Subtle Frosted Backdrop */}
      {isOpen && (
        <>
          {/* Transparent backdrop for outside clicks - no dark/blur overlay */}
          <div
            className="music-popover-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Compact Popover Card Floating Near Control Bar (Shifted to Left) */}
          <div
            className="music-popover-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={language === 'vi' ? 'Bảng âm thanh' : 'Sound popover'}
          >
            {/* PHẦN A: PHẦN ĐANG PHÁT */}
            <div className="music-popover-header">
              <span className="music-popover-tag">
                {language === 'vi' ? 'ÂM THANH' : 'MUSIC'}
              </span>
              <button
                type="button"
                className="music-popover-close-btn"
                onClick={onClose}
                aria-label={language === 'vi' ? 'Đóng' : 'Close'}
                title={language === 'vi' ? 'Đóng' : 'Close'}
              >
                <X size={15} />
              </button>
            </div>

            <div className="music-popover-body">
              {/* Dòng 1: icon nhạc + chữ “Âm thanh nền” + toggle bật/tắt bên phải */}
              <div className="music-master-toggle-row">
                <div className="music-row-left">
                  <Music size={16} className="music-row-icon" />
                  <span className="music-row-title">
                    {language === 'vi' ? 'Âm thanh nền' : 'Background sound'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`settings-switch ${isEnabled ? 'active' : ''}`}
                  onClick={handleToggleMasterSound}
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={language === 'vi' ? 'Bật/tắt âm thanh nền' : 'Toggle background sound'}
                >
                  <div className="switch-thumb" />
                </button>
              </div>

              {/* CHỈ HIỆN KHI ÂM THANH NỀN BẬT HOẶC YOUTUBE ĐANG PHÁT */}
              {isAnyAudioActive && (
                <>
                  {/* Dòng 2: Hàng điều khiển đang phát (Lofi hoặc YouTube) */}
                  <div className="music-now-playing-row">
                    <Disc
                      size={17}
                      className={`music-disc-icon ${isCurrentAudioPlaying ? 'is-spinning' : ''} ${isYouTubeActive ? 'is-yt' : ''}`}
                    />

                    <span
                      className="music-now-playing-title"
                      title={isYouTubeActive ? (ytTitle || 'YouTube Audio') : (currentTrack?.title || 'Study Session')}
                    >
                      {isYouTubeActive
                        ? (ytTitle || (language === 'vi' ? 'YouTube Audio' : 'YouTube Audio'))
                        : (currentTrack?.title || 'Study Session')}
                    </span>

                    <div className="music-mini-controls-group">
                      {/* Nút Play / Pause */}
                      <button
                        type="button"
                        className="music-mini-control-btn play-pause-btn"
                        onClick={handleToggleCurrentAudio}
                        title={
                          isCurrentAudioPlaying
                            ? language === 'vi' ? 'Tạm dừng' : 'Pause'
                            : language === 'vi' ? 'Phát' : 'Play'
                        }
                        aria-label={isCurrentAudioPlaying ? 'Pause' : 'Play'}
                      >
                        {isCurrentAudioPlaying ? (
                          <Pause size={13} fill="currentColor" />
                        ) : (
                          <Play size={13} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      {/* Nút Chuyển bài tiếp (Next) */}
                      <button
                        type="button"
                        className="music-mini-control-btn next-btn"
                        onClick={handleNextTrack}
                        title={
                          isYouTubeActive
                            ? language === 'vi' ? 'Bỏ qua YouTube' : 'Skip YouTube'
                            : language === 'vi' ? 'Bài tiếp theo' : 'Next track'
                        }
                        aria-label="Next track"
                      >
                        <SkipForward size={13} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Dòng 3: Thanh volume ngang (icon loa + slider) */}
                  <div className="music-volume-row">
                    {volume === 0 ? (
                      <VolumeX size={14} className="music-volume-icon" />
                    ) : (
                      <Volume2 size={14} className="music-volume-icon" />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="music-volume-slider"
                      aria-label={language === 'vi' ? 'Âm lượng' : 'Volume'}
                    />
                    <span className="music-volume-val">{Math.round(volume * 100)}%</span>
                  </div>
                </>
              )}

              {/* PHẦN B: DANH SÁCH LOFI */}
              <div className="music-section-block">
                <div className="music-subheading">
                  {language === 'vi' ? 'BẢN LOFI' : 'LOFI TRACKS'}
                </div>

                <div className="music-tracks-compact-list">
                  {tracks.map((track, idx) => {
                    const isSelected = currentTrack?.id === track.id && !track.isComingSoon;
                    const isTrackPlaying = isSelected && isPlaying && isEnabled && !isYouTubeActive;
                    const trackNumber = idx + 1;

                    if (track.isComingSoon) {
                      return (
                        <div
                          key={track.id}
                          className="music-track-row is-disabled"
                          aria-disabled="true"
                        >
                          <div className="track-left">
                            <span className="track-index">{trackNumber}</span>
                            <span className="track-name">{track.title}</span>
                          </div>
                          <span className="track-badge-soon">
                            {language === 'vi' ? 'Sắp có' : 'Coming soon'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={track.id}
                        className={`music-track-row is-clickable ${isSelected ? 'is-active' : ''}`}
                        onClick={() => handleSelectLofiTrack(track)}
                      >
                        <div className="track-left">
                          <span className="track-index">{trackNumber}</span>
                          <span className="track-name">{track.title}</span>
                        </div>

                        <div className="track-right">
                          {isTrackPlaying ? (
                            <div className="music-wave-indicator" title={language === 'vi' ? 'Đang phát' : 'Playing'}>
                              <span className="wave-bar bar-1" />
                              <span className="wave-bar bar-2" />
                              <span className="wave-bar bar-3" />
                            </div>
                          ) : isSelected ? (
                            <span className="track-active-dot" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN C: DỊCH VỤ */}
              <div className="music-section-block">
                <div className="music-subheading">
                  {language === 'vi' ? 'DỊCH VỤ' : 'SERVICES'}
                </div>

                <div className="music-services-list">
                  {/* Dòng Spotify + badge “Sắp có” */}
                  <div className="music-service-row">
                    <div className="service-info-left">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#1DB954">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.315c-.215.352-.676.463-1.028.248-2.817-1.722-6.362-2.112-10.538-1.157-.402.092-.801-.16-.893-.562-.092-.403.16-.801.562-.893 4.571-1.045 8.492-.596 11.649 1.336.352.215.463.676.248 1.028zm1.467-3.26c-.27.44-.847.58-1.287.31-3.225-1.982-8.14-2.557-11.954-1.399-.496.15-1.024-.13-1.175-.626-.15-.496.13-1.024.626-1.175 4.364-1.325 9.774-.678 13.48 1.597.44.27.58.847.31 1.293zm.126-3.398C15.228 8.35 8.878 8.14 5.17 9.266c-.604.183-1.246-.16-1.429-.764-.183-.604.16-1.246.764-1.429 4.256-1.292 11.267-1.05 15.65 1.55.544.323.725 1.03.402 1.574-.323.543-1.03.725-1.469.06z" />
                      </svg>
                      <span className="service-title">Spotify</span>
                    </div>
                    <span className="track-badge-soon">
                      {language === 'vi' ? 'Sắp có' : 'Coming soon'}
                    </span>
                  </div>

                  {/* Dòng Apple Music + badge “Sắp có” */}
                  <div className="music-service-row">
                    <div className="service-info-left">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#FC3C44">
                        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-2.93a5.53 5.53 0 00-2.4-.6c-3.17-.03-6.34-.02-9.51-.02-1.92 0-3.83.03-5.75.22A5.62 5.62 0 001.274 2.87C.454 3.79.094 4.9.024 6.13c-.05 1.88-.02 3.76-.02 5.64 0 2.22-.03 4.44.02 6.66.04 1.48.51 2.76 1.54 3.76 1.02.99 2.27 1.48 3.69 1.63 2.15.22 4.32.18 6.48.18 2.37 0 4.74.02 7.11-.07 1.52-.06 2.85-.56 3.89-1.66 1.02-1.07 1.46-2.39 1.51-3.84.07-2.18.03-4.36.03-6.54 0-1.92.03-3.84-.28-5.77zm-9.35 8.78c0 .24-.04.47-.13.69-.32.78-1.06 1.17-1.89 1.04-.97-.15-1.63-.84-1.66-1.72-.03-.92.6-1.68 1.55-1.86.66-.12 1.32-.08 2.01-.1v-4.8c-2.43.68-4.85 1.36-7.27 2.04v5.39c0 .2-.04.39-.1.58-.33.88-1.12 1.34-2.02 1.18-.94-.17-1.57-.88-1.58-1.78-.02-.91.64-1.68 1.58-1.83.67-.11 1.32-.08 2.01-.1v-7.39c0-.46.33-.8.78-.92 2.67-.74 5.34-1.49 8.01-2.24.4-.11.75.12.75.54v10.37z" />
                      </svg>
                      <span className="service-title">Apple Music</span>
                    </div>
                    <span className="track-badge-soon">
                      {language === 'vi' ? 'Sắp có' : 'Coming soon'}
                    </span>
                  </div>

                  {/* Dòng YouTube: bấm để mở ô dán link YouTube để phát audio trong app */}
                  <div className={`music-youtube-accordion ${isYtExpanded || isYtPlaying || ytActiveUrl ? 'expanded' : ''}`}>
                    <button
                      type="button"
                      className="music-service-row youtube-trigger"
                      onClick={() => setIsYtExpanded((prev) => !prev)}
                    >
                      <div className="service-info-left">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF0000">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span className="service-title">YouTube</span>
                        {isYtPlaying && (
                          <span className="yt-dot-live" title={language === 'vi' ? 'Đang phát' : 'Playing'} />
                        )}
                      </div>
                      <ChevronDown
                        size={15}
                        className={`yt-expand-arrow ${isYtExpanded || isYtPlaying || ytActiveUrl ? 'open' : ''}`}
                      />
                    </button>

                    {/* Expandable YouTube Input Drawer */}
                    {(isYtExpanded || isYtPlaying || ytActiveUrl) && (
                      <div className="yt-input-drawer">
                        <div className="yt-field-row">
                          <input
                            type="text"
                            className="yt-input-compact"
                            placeholder={
                              language === 'vi'
                                ? 'Dán link YouTube...'
                                : 'Paste YouTube link...'
                            }
                            value={ytInputUrl}
                            onChange={(e) => {
                              setYtInputUrl(e.target.value);
                              if (ytError) setYtError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleToggleYtPlay();
                              }
                            }}
                          />
                          {ytInputUrl && (
                            <button
                              type="button"
                              className="yt-clear-compact-btn"
                              onClick={handleClearYt}
                              title={language === 'vi' ? 'Xóa' : 'Clear'}
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`yt-play-compact-btn ${isYtPlaying ? 'playing' : ''}`}
                            onClick={handleToggleYtPlay}
                            title={isYtPlaying ? 'Tạm dừng' : 'Phát'}
                          >
                            {isYtPlaying ? (
                              <Pause size={12} fill="currentColor" />
                            ) : (
                              <Play size={12} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>
                        </div>

                        {(ytTitle || isFetchingTitle) && (
                          <div className="yt-title-compact">
                            <Radio size={12} className={isYtPlaying ? 'animate-pulse text-red-500' : ''} />
                            <span className="yt-title-text" title={ytTitle || ''}>
                              {isFetchingTitle ? '...' : ytTitle}
                            </span>
                          </div>
                        )}

                        {ytError && (
                          <div className="yt-error-compact">
                            <AlertCircle size={12} />
                            <span>{ytError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
