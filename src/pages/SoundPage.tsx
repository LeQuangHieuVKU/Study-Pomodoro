import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Link2,
  X,
  AlertCircle,
  Radio,
  Clock,
} from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import ReactPlayer from 'react-player';
import { useLanguage } from '../i18n/LanguageContext';
import { useSound } from '../hooks/useSound';
import { EXTERNAL_PLAYLISTS } from '../data/soundTracks';
import type { LofiTrack } from '../types';

const YOUTUBE_URL_STORAGE_KEY = 'study_pomodoro_yt_url';
const YOUTUBE_TITLE_STORAGE_KEY = 'study_pomodoro_yt_title';

const YOUTUBE_PRESETS = [
  {
    name: 'Lofi Girl Livestream',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    title: 'Lofi Girl - beats to relax/study to',
  },
  {
    name: 'Rain & Coffee Ambience',
    url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    title: 'Cozy Coffee Shop with Rain Sounds - Relaxing Lofi Ambience',
  },
  {
    name: 'Deep Focus Alpha Waves',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    title: 'Deep Focus Music - Binaural Beats & Alpha Waves for Studying',
  },
];

// Helper to get fallback short URL if title cannot be fetched
const getShortUrlFallback = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '');
      return id ? `youtu.be/${id}` : url;
    }
    const v = parsed.searchParams.get('v');
    return v ? `Video: ${v}` : url;
  } catch {
    return url.length > 32 ? `${url.substring(0, 30)}...` : url;
  }
};

// Fetch real YouTube video title via open oEmbed API with fallback
const fetchYouTubeTitle = async (url: string): Promise<string> => {
  if (!url) return '';

  // 1. Check presets first
  const matchedPreset = YOUTUBE_PRESETS.find(
    (p) => p.url === url || (url.includes('jfKfPfyJRdk') && p.url.includes('jfKfPfyJRdk'))
  );
  if (matchedPreset?.title) {
    return matchedPreset.title;
  }

  // 2. Official YouTube oEmbed API
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.title === 'string' && data.title.trim()) {
        return data.title.trim();
      }
    }
  } catch {
    // try fallback
  }

  // 3. Fallback noembed API
  try {
    const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(noembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.title === 'string' && data.title.trim()) {
        return data.title.trim();
      }
    }
  } catch {
    // fallback
  }

  return getShortUrlFallback(url);
};

export const SoundPage: React.FC = () => {
  const { t, language } = useLanguage();
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

  // YouTube Audio Player state
  const [ytInputUrl, setYtInputUrl] = useState('');
  const [ytActiveUrl, setYtActiveUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytVolume, setYtVolume] = useState(0.8);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytIsReady, setYtIsReady] = useState(false);

  // Restore saved YouTube URL and Title from Preferences
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

  const getVolumeIcon = () => {
    if (volume === 0 || !isEnabled) return <VolumeX size={18} />;
    if (volume < 0.4) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  const getYtVolumeIcon = () => {
    if (ytVolume === 0) return <VolumeX size={18} />;
    if (ytVolume < 0.4) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string) => {
    if (!url) return false;
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url.trim());
  };

  // Toggle YouTube Audio playback
  const handleToggleYtPlay = () => {
    const trimmed = ytInputUrl.trim();
    if (!trimmed) {
      setYtError(t('youtubeInvalidUrl'));
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setYtError(t('youtubeInvalidUrl'));
      return;
    }

    setYtError(null);

    // If changing URL or first time loading
    if (trimmed !== ytActiveUrl) {
      setYtActiveUrl(trimmed);
      setIsYtPlaying(true);
      // Fetch and cache real title
      fetchYouTubeTitle(trimmed).then((title) => {
        setYtTitle(title);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: title }).catch(console.error);
      });
      // Pause local lofi sound so two streams do not clash
      if (isPlaying) {
        togglePlayPause();
      }
      Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: trimmed }).catch(console.error);
    } else {
      const nextPlay = !isYtPlaying;
      setIsYtPlaying(nextPlay);
      if (nextPlay && isPlaying) {
        togglePlayPause();
      }
    }
  };

  const handleSelectYtPreset = (url: string, presetTitle?: string) => {
    setYtInputUrl(url);
    setYtActiveUrl(url);
    if (presetTitle) {
      setYtTitle(presetTitle);
      Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: presetTitle }).catch(console.error);
    } else {
      fetchYouTubeTitle(url).then((title) => {
        setYtTitle(title);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: title }).catch(console.error);
      });
    }
    setYtError(null);
    setIsYtPlaying(true);
    if (isPlaying) {
      togglePlayPause();
    }
    Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: url }).catch(console.error);
  };

  const handleClearYt = () => {
    setIsYtPlaying(false);
    setYtActiveUrl('');
    setYtInputUrl('');
    setYtTitle('');
    setYtError(null);
    setYtIsReady(false);
    Preferences.remove({ key: YOUTUBE_URL_STORAGE_KEY }).catch(console.error);
    Preferences.remove({ key: YOUTUBE_TITLE_STORAGE_KEY }).catch(console.error);
  };

  return (
    <IonPage className="sound-page-root">
      <IonHeader className="ion-no-border app-header">
        <IonToolbar className="app-toolbar">
          <div className="header-title-row">
            <div>
              <IonTitle className="page-header-title">{t('soundTitle')}</IonTitle>
              <p className="page-header-subtitle">{t('soundSubtitle')}</p>
            </div>
            {/* Quick mini play/pause indicator for Lofi */}
            {isEnabled && (
              <button
                type="button"
                className={`header-action-pill-btn sound-pill-toggle ${isPlaying ? 'pill-active' : ''}`}
                onClick={togglePlayPause}
                title={isPlaying ? t('pause') : t('resume')}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? t('soundPlayingNow') : t('soundPaused')}</span>
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="sound-content-area">
        <div className="sound-page-wrapper">
          {/* SECTION A: MASTER TOGGLE & VOLUME DECK */}
          <section className="sound-section">
            <h2 className="sound-section-title">{t('masterSoundSection')}</h2>
            <div className="setting-card sound-master-card">
              <div className="master-toggle-header">
                <div className="master-info-wrap">
                  <div className={`master-icon-box ${isEnabled ? 'active-pulse' : ''}`}>
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h3 className="master-title">{t('masterSoundLabel')}</h3>
                    <p className="master-desc">{t('masterSoundDesc')}</p>
                  </div>
                </div>

                {/* Big Master Toggle Switch */}
                <label className="sound-toggle-switch" aria-label={t('masterSoundLabel')}>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={toggleMasterSound}
                  />
                  <span className="sound-toggle-slider" />
                </label>
              </div>

              {/* Status and Now Playing Card Header */}
              {isEnabled && (
                <div className="now-playing-banner">
                  <div className="now-playing-left">
                    {/* Animated Sound Equalizer Waves */}
                    <div className={`equalizer-bars ${isPlaying ? 'playing' : ''}`}>
                      <span className="eq-bar bar-1" />
                      <span className="eq-bar bar-2" />
                      <span className="eq-bar bar-3" />
                      <span className="eq-bar bar-4" />
                    </div>
                    <div className="now-playing-meta">
                      <span className="now-playing-tag">{t('nowPlayingTrack')}</span>
                      <strong className="now-playing-title">{currentTrack.title}</strong>
                      <span className="now-playing-artist">{currentTrack.artist}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="now-playing-btn-action"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? t('pause') : t('resume')}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                </div>
              )}

              {/* Volume Slider */}
              <div className="sound-volume-slider-row">
                <div className="volume-icon-badge">{getVolumeIcon()}</div>
                <div className="volume-slider-container">
                  <div className="volume-label-row">
                    <span className="volume-title">{t('soundVolumeLabel')}</span>
                    <span className="volume-percentage">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    disabled={!isEnabled}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="sound-volume-slider"
                    aria-label={t('soundVolumeLabel')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: LOFI TRACKS LIST */}
          <section className="sound-section">
            <div className="section-header-wrap">
              <h2 className="sound-section-title">{t('lofiPlaylistSection')}</h2>
              <span className="section-badge-count">{tracks.length} tracks</span>
            </div>
            <p className="sound-section-subdesc">{t('lofiPlaylistDesc')}</p>

            <div className="lofi-tracks-grid">
              {tracks.map((track) => {
                const isCurrent = currentTrack.id === track.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.id}
                    className={`lofi-track-card ${isCurrent ? 'track-selected' : ''} ${isCurrentPlaying ? 'track-playing' : ''}`}
                    onClick={() => {
                      if (isCurrent && isPlaying) {
                        togglePlayPause();
                      } else {
                        // Pause YouTube audio if playing
                        if (isYtPlaying) {
                          setIsYtPlaying(false);
                        }
                        selectTrack(track);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="track-info-content">
                      <div className="track-title-row">
                        <h4 className="track-name-heading">{track.title}</h4>
                      </div>

                      <p className="track-artist-text">{track.artist}</p>

                      <div className="track-meta-row">
                        <span className="track-category-tag">{track.category}</span>
                        <span className="track-duration-pill">{track.duration}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION C: YOUTUBE AUDIO PLAYER */}
          <section className="sound-section">
            <div className="section-header-wrap">
              <h2 className="sound-section-title">{t('youtubeAudioSection')}</h2>
              <span className="section-badge-count">YouTube Audio</span>
            </div>
            <p className="sound-section-subdesc">{t('youtubeAudioDesc')}</p>

            <div className="setting-card youtube-audio-card">
              {/* URL Input Row */}
              <div className="yt-input-wrapper">
                <div className="yt-input-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#ef4444">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder={t('youtubeUrlPlaceholder')}
                  value={ytInputUrl}
                  onChange={(e) => {
                    setYtInputUrl(e.target.value);
                    if (ytError) setYtError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleToggleYtPlay();
                  }}
                  className="yt-url-input"
                />
                {ytInputUrl && (
                  <button
                    type="button"
                    className="yt-clear-input-btn"
                    onClick={handleClearYt}
                    title={t('youtubeClearBtn')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Error Message Alert */}
              {ytError && (
                <div className="yt-error-banner">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{ytError}</span>
                </div>
              )}

              {/* Controls and Status Row */}
              <div className="yt-controls-deck">
                <div className="yt-status-meta">
                  <div className={`yt-eq-bars ${isYtPlaying ? 'active' : ''}`}>
                    <span className="bar-1" />
                    <span className="bar-2" />
                    <span className="bar-3" />
                  </div>
                  <div className="yt-status-text-wrap">
                    <span className="yt-status-label">
                      {isYtPlaying ? t('youtubePlayingStatus') : t('youtubePausedStatus')}
                    </span>
                    {ytActiveUrl && (
                      <span
                        className="yt-active-title"
                        title={ytTitle || ytActiveUrl}
                      >
                        {ytTitle || getShortUrlFallback(ytActiveUrl)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={`yt-play-toggle-btn ${isYtPlaying ? 'is-playing' : ''}`}
                  onClick={handleToggleYtPlay}
                >
                  {isYtPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  <span>{isYtPlaying ? t('youtubePauseBtn') : t('youtubePlayBtn')}</span>
                </button>
              </div>

              {/* YouTube Volume Slider */}
              <div className="sound-volume-slider-row yt-volume-row">
                <div className="volume-icon-badge">{getYtVolumeIcon()}</div>
                <div className="volume-slider-container">
                  <div className="volume-label-row">
                    <span className="volume-title">{t('soundVolumeLabel')}</span>
                    <span className="volume-percentage">{Math.round(ytVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ytVolume}
                    onChange={(e) => setYtVolume(parseFloat(e.target.value))}
                    className="sound-volume-slider"
                    aria-label={t('soundVolumeLabel')}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="yt-presets-wrapper">
                <span className="yt-presets-title">{t('youtubePresetTitle')}</span>
                <div className="yt-presets-chips">
                  {YOUTUBE_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      className={`yt-preset-chip ${ytActiveUrl === p.url ? 'active' : ''}`}
                      onClick={() => handleSelectYtPreset(p.url, p.title)}
                    >
                      <Radio size={12} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden ReactPlayer playing audio stream via YouTube IFrame */}
              <div
                className="yt-hidden-player-host"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  opacity: 0.001,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  left: '-9999px',
                }}
              >
                {ytActiveUrl && (
                  <ReactPlayer
                    src={ytActiveUrl}
                    playing={isYtPlaying}
                    volume={ytVolume}
                    width="100%"
                    height="100%"
                    controls={false}
                    playsInline
                    onReady={() => {
                      setYtIsReady(true);
                      setYtError(null);
                    }}
                    onPlay={() => {
                      setIsYtPlaying(true);
                    }}
                    onPause={() => {
                      setIsYtPlaying(false);
                    }}
                    onError={(err) => {
                      console.warn('ReactPlayer error:', err);
                      setIsYtPlaying(false);
                      setYtError(t('youtubePlayError'));
                    }}
                    onEnded={() => {
                      setIsYtPlaying(false);
                    }}
                  />
                )}
              </div>
            </div>
          </section>

          {/* SECTION D: EXTERNAL PLAYLIST INTEGRATION (SPOTIFY & APPLE MUSIC - COMING SOON) */}
          <section className="sound-section">
            <h2 className="sound-section-title">{t('externalPlaylistsSection')}</h2>
            <p className="sound-section-subdesc">{t('externalPlaylistsDesc')}</p>

            <div className="external-playlists-grid">
              {/* Spotify Button - Coming Soon */}
              <div
                className="external-playlist-btn btn-spotify is-coming-soon"
                aria-disabled="true"
                title={t('comingSoon')}
              >
                <div className="external-btn-left">
                  <div className="brand-icon-box spotify-icon-box">
                    {/* Official Spotify SVG Logo */}
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.315c-.215.352-.676.463-1.028.248-2.817-1.722-6.362-2.112-10.538-1.157-.402.092-.801-.16-.893-.562-.092-.403.16-.801.562-.893 4.571-1.045 8.492-.596 11.649 1.336.352.215.463.676.248 1.028zm1.467-3.26c-.27.44-.847.58-1.287.31-3.225-1.982-8.14-2.557-11.954-1.399-.496.15-1.024-.13-1.175-.626-.15-.496.13-1.024.626-1.175 4.364-1.325 9.774-.678 13.48 1.597.44.27.58.847.31 1.293zm.126-3.398C15.228 8.35 8.878 8.14 5.17 9.266c-.604.183-1.246-.16-1.429-.764-.183-.604.16-1.246.764-1.429 4.256-1.292 11.267-1.05 15.65 1.55.544.323.725 1.03.402 1.574-.323.543-1.03.725-1.469.06z" />
                    </svg>
                  </div>
                  <div className="external-btn-text">
                    <span className="external-brand-name">Spotify</span>
                    <span className="external-brand-subtitle">
                      {EXTERNAL_PLAYLISTS.spotify.name}
                    </span>
                  </div>
                </div>

                <div className="external-action-pill coming-soon-pill">
                  <Clock size={13} className="mr-1 opacity-70" />
                  <span>{t('comingSoon')}</span>
                </div>
              </div>

              {/* Apple Music Button - Coming Soon */}
              <div
                className="external-playlist-btn btn-apple-music is-coming-soon"
                aria-disabled="true"
                title={t('comingSoon')}
              >
                <div className="external-btn-left">
                  <div className="brand-icon-box apple-music-icon-box">
                    {/* Official Apple Music Note SVG Logo */}
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-2.93a5.53 5.53 0 00-2.4-.6c-3.17-.03-6.34-.02-9.51-.02-1.92 0-3.83.03-5.75.22A5.62 5.62 0 001.274 2.87C.454 3.79.094 4.9.024 6.13c-.05 1.88-.02 3.76-.02 5.64 0 2.22-.03 4.44.02 6.66.04 1.48.51 2.76 1.54 3.76 1.02.99 2.27 1.48 3.69 1.63 2.15.22 4.32.18 6.48.18 2.37 0 4.74.02 7.11-.07 1.52-.06 2.85-.56 3.89-1.66 1.02-1.07 1.46-2.39 1.51-3.84.07-2.18.03-4.36.03-6.54 0-1.92.03-3.84-.28-5.77zm-9.35 8.78c0 .24-.04.47-.13.69-.32.78-1.06 1.17-1.89 1.04-.97-.15-1.63-.84-1.66-1.72-.03-.92.6-1.68 1.55-1.86.66-.12 1.32-.08 2.01-.1v-4.8c-2.43.68-4.85 1.36-7.27 2.04v5.39c0 .2-.04.39-.1.58-.33.88-1.12 1.34-2.02 1.18-.94-.17-1.57-.88-1.58-1.78-.02-.91.64-1.68 1.58-1.83.67-.11 1.32-.08 2.01-.1v-7.39c0-.46.33-.8.78-.92 2.67-.74 5.34-1.49 8.01-2.24.4-.11.75.12.75.54v10.37z" />
                    </svg>
                  </div>
                  <div className="external-btn-text">
                    <span className="external-brand-name">Apple Music</span>
                    <span className="external-brand-subtitle">
                      {EXTERNAL_PLAYLISTS.appleMusic.name}
                    </span>
                  </div>
                </div>

                <div className="external-action-pill coming-soon-pill">
                  <Clock size={13} className="mr-1 opacity-70" />
                  <span>{t('comingSoon')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};
