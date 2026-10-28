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
  Plus,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { useLanguage } from '../i18n/LanguageContext';
import { useSound } from '../context/SoundContext';
import {
  YOUTUBE_URL_STORAGE_KEY,
  YOUTUBE_TITLE_STORAGE_KEY,
} from '../services/youtubeService';
import {
  UserSavedLink,
  detectLinkType,
  fetchMediaTitle,
  isDuplicateUrl,
  loadUserSavedLinks,
  saveUserSavedLinks,
} from '../services/mediaLinkService';
import type { LofiTrack } from '../types';

// Dynamically import react-player so heavy media engines (dash, hls) are never in the critical path
const ReactPlayer = React.lazy(() => import('react-player'));

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
  const [ytActiveUrl, setYtActiveUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  // User Saved Links state (YouTube & Spotify)
  const [userLinks, setUserLinks] = useState<UserSavedLink[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);

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

  // Load saved links and migrate legacy single-URL storage
  useEffect(() => {
    const initializeLinks = async () => {
      try {
        const loaded = await loadUserSavedLinks();
        const [{ value: savedYtUrl }, { value: savedYtTitle }] = await Promise.all([
          Preferences.get({ key: YOUTUBE_URL_STORAGE_KEY }),
          Preferences.get({ key: YOUTUBE_TITLE_STORAGE_KEY }),
        ]);

        let combined = [...loaded];

        // Migrate legacy saved YouTube URL if not already present
        if (savedYtUrl && !combined.some((l) => l.url === savedYtUrl)) {
          const migrated: UserSavedLink = {
            id: `link_${Date.now()}_legacy`,
            url: savedYtUrl,
            title: savedYtTitle || 'YouTube Audio',
            type: 'youtube',
            addedAt: Date.now(),
          };
          combined = [migrated, ...combined];
          await saveUserSavedLinks(combined);
        }

        setUserLinks(combined);

        // Restore active playback URL
        if (savedYtUrl) {
          setYtActiveUrl(savedYtUrl);
          setYtTitle(savedYtTitle || 'YouTube Audio');
        } else if (combined.length > 0 && combined[0].type === 'youtube') {
          setYtActiveUrl(combined[0].url);
          setYtTitle(combined[0].title);
        }
      } catch (err) {
        console.warn('Failed to initialize user links:', err);
      }
    };

    initializeLinks();
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

  // Helper to extract clean domain string
  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  // Play / Toggle a User Saved Link
  const handlePlayUserLink = async (link: UserSavedLink) => {
    if (link.type === 'youtube') {
      if (ytActiveUrl === link.url) {
        // Toggle play/pause on the same video
        const nextState = !isYtPlaying;
        setIsYtPlaying(nextState);
        if (nextState && isPlaying) {
          await togglePlayPause(); // pause Lofi
        }
      } else {
        // Switch to new YouTube video
        setYtActiveUrl(link.url);
        setYtTitle(link.title);
        setIsYtPlaying(true);
        setYtError(null);
        if (isPlaying) {
          await togglePlayPause(); // pause Lofi
        }
        Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: link.url }).catch(console.error);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: link.title }).catch(console.error);
      }
    } else if (link.type === 'spotify') {
      // Open Spotify web player / app directly without breaking Lofi or YouTube
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Delete a saved link
  const handleDeleteUserLink = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = userLinks.find((l) => l.id === id);
    const updated = userLinks.filter((l) => l.id !== id);
    setUserLinks(updated);
    await saveUserSavedLinks(updated);

    // If currently active YouTube video was deleted
    if (target && target.type === 'youtube' && ytActiveUrl === target.url) {
      setIsYtPlaying(false);
      setYtActiveUrl('');
      setYtTitle('');
      Preferences.remove({ key: YOUTUBE_URL_STORAGE_KEY }).catch(console.error);
      Preferences.remove({ key: YOUTUBE_TITLE_STORAGE_KEY }).catch(console.error);
    }
  };

  // Add a new YouTube or Spotify link
  const handleAddUserLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setLinkError(
        language === 'vi'
          ? 'Vui lòng dán link YouTube hoặc Spotify'
          : 'Please paste a YouTube or Spotify link'
      );
      return;
    }

    const type = detectLinkType(trimmed);
    if (!type) {
      setLinkError(
        language === 'vi'
          ? 'Chỉ hỗ trợ link YouTube hoặc Spotify'
          : 'Only YouTube or Spotify links are supported'
      );
      return;
    }

    if (isDuplicateUrl(trimmed, userLinks)) {
      setLinkError(
        language === 'vi'
          ? 'Link này đã có trong danh sách'
          : 'This link is already in your list'
      );
      return;
    }

    setLinkError(null);
    setIsAddingLink(true);

    try {
      const fetchedTitle = await fetchMediaTitle(trimmed, type);
      const defaultTitle =
        type === 'youtube'
          ? language === 'vi' ? 'YouTube Audio' : 'YouTube Audio'
          : language === 'vi' ? 'Spotify Track/Playlist' : 'Spotify Track/Playlist';

      const newLink: UserSavedLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: trimmed,
        title: fetchedTitle || defaultTitle,
        type,
        addedAt: Date.now(),
      };

      const updated = [newLink, ...userLinks];
      setUserLinks(updated);
      await saveUserSavedLinks(updated);
      setLinkInput('');

      // Auto-start playback if it's a YouTube link
      if (type === 'youtube') {
        setYtActiveUrl(newLink.url);
        setYtTitle(newLink.title);
        setIsYtPlaying(true);
        if (isPlaying) {
          await togglePlayPause();
        }
        Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: newLink.url }).catch(console.error);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: newLink.title }).catch(console.error);
      }
    } catch (err) {
      console.warn('Error adding media link:', err);
      setLinkError(
        language === 'vi'
          ? 'Không thể lấy thông tin link'
          : 'Could not fetch link info'
      );
    } finally {
      setIsAddingLink(false);
    }
  };

  // Next Track Handler (supports cycling Lofi and saved YouTube links)
  const handleNextTrack = async () => {
    const playable = tracks.filter((t) => !t.isComingSoon && t.url);
    if (playable.length === 0) return;

    if (isYtPlaying) {
      // Find current YouTube link in userLinks
      const ytLinks = userLinks.filter((l) => l.type === 'youtube');
      const curYtIdx = ytLinks.findIndex((l) => l.url === ytActiveUrl);
      if (curYtIdx >= 0 && curYtIdx < ytLinks.length - 1) {
        // Next YouTube link
        const nextLink = ytLinks[curYtIdx + 1];
        setYtActiveUrl(nextLink.url);
        setYtTitle(nextLink.title);
        setIsYtPlaying(true);
        return;
      }
      // If at end of YouTube links, switch back to first Lofi track
      setIsYtPlaying(false);
      await selectTrack(playable[0]);
      return;
    }

    // Currently playing Lofi
    const curIdx = playable.findIndex((t) => t.id === currentTrack.id);
    const isLastLofiTrack = curIdx >= playable.length - 1;

    if (isLastLofiTrack) {
      // Check if user has saved YouTube links to transition to
      const ytLinks = userLinks.filter((l) => l.type === 'youtube');
      if (ytLinks.length > 0) {
        if (isPlaying) {
          await togglePlayPause();
        }
        setYtActiveUrl(ytLinks[0].url);
        setYtTitle(ytLinks[0].title);
        setIsYtPlaying(true);
        return;
      }
      // Loop back to first Lofi track
      await selectTrack(playable[0]);
    } else {
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

  // Audio source active status (YouTube takes priority when playing)
  const isYouTubeActive = isYtPlaying;
  const isLofiActive = isEnabled && !isYtPlaying;
  const isAnyAudioActive = isYouTubeActive || isLofiActive;
  const isCurrentAudioPlaying = isYouTubeActive ? isYtPlaying : isPlaying;

  const handleToggleCurrentAudio = async () => {
    if (isYouTubeActive) {
      setIsYtPlaying((prev) => !prev);
    } else {
      await togglePlayPause();
    }
  };

  return (
    <>
      {/* Hidden ReactPlayer to stream YouTube audio in-app continuously */}
      {ytActiveUrl && (
        <div style={{ display: 'none' }} aria-hidden="true">
          <React.Suspense fallback={null}>
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
                    ? 'Không thể phát audio này'
                    : 'Cannot play this audio'
                );
              }}
              onEnded={() => {
                handleNextTrack();
              }}
            />
          </React.Suspense>
        </div>
      )}

      {/* Popover Card & Transparent / Subtle Frosted Backdrop */}
      {isOpen && (
        <>
          {/* Transparent backdrop for outside clicks */}
          <div
            className="music-popover-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Compact Popover Card Floating Near Control Bar */}
          <div
            className="music-popover-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={language === 'vi' ? 'Bảng âm thanh' : 'Sound popover'}
          >
            {/* Header */}
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
              {/* 1. Toggle Âm thanh nền */}
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

              {/* Hàng điều khiển đang phát & Thanh Volume */}
              {isAnyAudioActive && (
                <>
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
                        ? (ytTitle || 'YouTube Audio')
                        : (currentTrack?.title || 'Study Session')}
                    </span>

                    <div className="music-mini-controls-group">
                      {/* Play / Pause */}
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

                      {/* Next track */}
                      <button
                        type="button"
                        className="music-mini-control-btn next-btn"
                        onClick={handleNextTrack}
                        title={language === 'vi' ? 'Bài tiếp theo' : 'Next track'}
                        aria-label="Next track"
                      >
                        <SkipForward size={13} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Thanh volume */}
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

              {/* 2. Danh sách BẢN LOFI (8 bài như hiện tại, play trong app) */}
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

              {/* 3. Section YOUR LINKS (Link của bạn) */}
              <div className="music-section-block">
                <div className="music-section-header-row">
                  <div className="music-subheading">
                    {language === 'vi' ? 'LINK CỦA BẠN' : 'YOUR LINKS'}
                    {userLinks.length > 0 && (
                      <span className="music-count-pill">{userLinks.length}</span>
                    )}
                  </div>
                </div>

                {/* Danh sách link user đã lưu */}
                {userLinks.length === 0 ? (
                  <div className="music-empty-links">
                    <LinkIcon size={14} className="empty-icon" />
                    <span>
                      {language === 'vi'
                        ? 'Chưa có link — dán YouTube hoặc Spotify bên dưới'
                        : 'No links yet — paste YouTube or Spotify below'}
                    </span>
                  </div>
                ) : (
                  <div className="music-user-links-list">
                    {userLinks.map((link) => {
                      const isThisYtPlaying =
                        link.type === 'youtube' && ytActiveUrl === link.url && isYtPlaying;
                      const isThisYtActive =
                        link.type === 'youtube' && ytActiveUrl === link.url;

                      return (
                        <div
                          key={link.id}
                          className={`music-user-link-item ${isThisYtActive ? 'is-active' : ''}`}
                          onClick={() => handlePlayUserLink(link)}
                        >
                          {/* Play / Open Button */}
                          <button
                            type="button"
                            className={`user-link-play-btn ${link.type} ${isThisYtPlaying ? 'is-playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayUserLink(link);
                            }}
                            title={
                              link.type === 'spotify'
                                ? language === 'vi' ? 'Mở trên Spotify' : 'Open on Spotify'
                                : isThisYtPlaying
                                ? language === 'vi' ? 'Tạm dừng' : 'Pause'
                                : language === 'vi' ? 'Phát' : 'Play'
                            }
                            aria-label={link.type === 'spotify' ? 'Open Spotify' : isThisYtPlaying ? 'Pause' : 'Play'}
                          >
                            {link.type === 'spotify' ? (
                              <ExternalLink size={12} />
                            ) : isThisYtPlaying ? (
                              <Pause size={12} fill="currentColor" />
                            ) : (
                              <Play size={12} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>

                          {/* Link Info */}
                          <div className="user-link-info">
                            <span className="user-link-title" title={link.title}>
                              {link.title}
                            </span>
                            <div className="user-link-meta">
                              <span className={`user-link-type-tag ${link.type}`}>
                                {link.type === 'youtube' ? 'YouTube' : 'Spotify'}
                              </span>
                              <span className="user-link-bullet">•</span>
                              <span className="user-link-domain">
                                {getDomainFromUrl(link.url) || (link.type === 'youtube' ? 'youtube.com' : 'spotify.com')}
                              </span>
                            </div>
                          </div>

                          {/* Wave indicator & Delete Button */}
                          <div className="user-link-actions" onClick={(e) => e.stopPropagation()}>
                            {isThisYtPlaying && (
                              <div className="music-wave-indicator mini" title="Playing">
                                <span className="wave-bar bar-1" />
                                <span className="wave-bar bar-2" />
                                <span className="wave-bar bar-3" />
                              </div>
                            )}
                            <button
                              type="button"
                              className="user-link-delete-btn"
                              onClick={(e) => handleDeleteUserLink(link.id, e)}
                              title={language === 'vi' ? 'Xóa link' : 'Delete link'}
                              aria-label="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ô dán link + Nút thêm */}
                <form className="music-add-link-bar" onSubmit={handleAddUserLink}>
                  <div className="add-link-input-wrap">
                    <input
                      type="text"
                      className="add-link-input"
                      placeholder={
                        language === 'vi'
                          ? 'Dán link YouTube hoặc Spotify'
                          : 'Paste YouTube or Spotify link'
                      }
                      value={linkInput}
                      onChange={(e) => {
                        setLinkInput(e.target.value);
                        if (linkError) setLinkError(null);
                      }}
                    />
                    {linkInput && (
                      <button
                        type="button"
                        className="add-link-clear-btn"
                        onClick={() => {
                          setLinkInput('');
                          setLinkError(null);
                        }}
                        title={language === 'vi' ? 'Xóa' : 'Clear'}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="add-link-submit-btn"
                    disabled={isAddingLink || !linkInput.trim()}
                    title={language === 'vi' ? 'Thêm' : 'Add'}
                    aria-label="Add link"
                  >
                    {isAddingLink ? (
                      <span className="add-link-spinner" />
                    ) : (
                      <Plus size={15} />
                    )}
                  </button>
                </form>

                {/* Link Error */}
                {linkError && (
                  <div className="music-link-error">
                    <AlertCircle size={12} />
                    <span>{linkError}</span>
                  </div>
                )}

                {/* Error from YouTube Player if any */}
                {ytError && isYouTubeActive && (
                  <div className="music-link-error">
                    <Radio size={12} className="text-red-500 animate-pulse" />
                    <span>{ytError}</span>
                  </div>
                )}
              </div>

              {/* 4. DỊCH VỤ (Hỗ trợ trực tiếp) */}
              <div className="music-section-block">
                <div className="music-subheading">
                  {language === 'vi' ? 'DỊCH VỤ HỖ TRỢ' : 'SUPPORTED SERVICES'}
                </div>

                <div className="music-services-list">
                  {/* YouTube */}
                  <div className="music-service-row">
                    <div className="service-info-left">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span className="service-title">YouTube</span>
                    </div>
                    <span className="track-badge-ready">
                      {language === 'vi' ? 'Phát trong app' : 'In-app Audio'}
                    </span>
                  </div>

                  {/* Spotify */}
                  <div className="music-service-row">
                    <div className="service-info-left">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#1DB954">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.315c-.215.352-.676.463-1.028.248-2.817-1.722-6.362-2.112-10.538-1.157-.402.092-.801-.16-.893-.562-.092-.403.16-.801.562-.893 4.571-1.045 8.492-.596 11.649 1.336.352.215.463.676.248 1.028zm1.467-3.26c-.27.44-.847.58-1.287.31-3.225-1.982-8.14-2.557-11.954-1.399-.496.15-1.024-.13-1.175-.626-.15-.496.13-1.024.626-1.175 4.364-1.325 9.774-.678 13.48 1.597.44.27.58.847.31 1.293zm.126-3.398C15.228 8.35 8.878 8.14 5.17 9.266c-.604.183-1.246-.16-1.429-.764-.183-.604.16-1.246.764-1.429 4.256-1.292 11.267-1.05 15.65 1.55.544.323.725 1.03.402 1.574-.323.543-1.03.725-1.469.06z" />
                      </svg>
                      <span className="service-title">Spotify</span>
                    </div>
                    <span className="track-badge-ready">
                      {language === 'vi' ? 'Lưu & Mở' : 'Save & Open'}
                    </span>
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
