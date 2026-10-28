import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Disc,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  PictureInPicture2,
  Link as LinkIcon,
  AlertCircle,
  Radio,
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownLeft,
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
  MediaProvider,
  parseMediaUrl,
  fetchMediaTitle,
  isDuplicateUrl,
  loadUserSavedLinks,
  saveUserSavedLinks,
  getSpotifyEmbedUrl,
  getAppleMusicEmbedUrl,
} from '../services/mediaLinkService';
import type { LofiTrack } from '../types';

// Dynamically import react-player so heavy media engines are never in the critical bundle
const ReactPlayer = React.lazy(() => import('react-player'));

export interface MusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onYtPlayingChange?: (isPlaying: boolean) => void;
  onEmbedActiveChange?: (isActive: boolean) => void;
  stopYtRef?: React.MutableRefObject<(() => void) | null>;
}

type Corner = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';

const CORNER_ORDER: Corner[] = [
  'bottom-left',
  'bottom-right',
  'top-right',
  'top-left',
];

// Crisp SVGs for Providers
const YouTubeIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#FF0000" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SpotifyIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#1DB954" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.315c-.215.352-.676.463-1.028.248-2.817-1.722-6.362-2.112-10.538-1.157-.402.092-.801-.16-.893-.562-.092-.403.16-.801.562-.893 4.571-1.045 8.492-.596 11.649 1.336.352.215.463.676.248 1.028zm1.467-3.26c-.27.44-.847.58-1.287.31-3.225-1.982-8.14-2.557-11.954-1.399-.496.15-1.024-.13-1.175-.626-.15-.496.13-1.024.626-1.175 4.364-1.325 9.774-.678 13.48 1.597.44.27.58.847.31 1.293zm.126-3.398C15.228 8.35 8.878 8.14 5.17 9.266c-.604.183-1.246-.16-1.429-.764-.183-.604.16-1.246.764-1.429 4.256-1.292 11.267-1.05 15.65 1.55.544.323.725 1.03.402 1.574-.323.543-1.03.725-1.469.06z" />
  </svg>
);

const AppleMusicIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#FC3C44" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.71-.87 2.74 1.05.08 2.07-.54 2.61-1.25z" />
  </svg>
);

export const MusicPanel: React.FC<MusicPanelProps> = ({
  isOpen,
  onClose,
  onYtPlayingChange,
  onEmbedActiveChange,
  stopYtRef,
}) => {
  const { language } = useLanguage();
  const {
    isPlaying,
    currentTrack,
    volume,
    tracks,
    togglePlayPause,
    selectTrack,
    changeVolume,
  } = useSound();

  // YouTube audio player state
  const [ytActiveUrl, setYtActiveUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  // Active Popup Player State (Spotify, Apple Music, or YouTube)
  const [activePopup, setActivePopup] = useState<{
    url: string;
    title: string;
    provider: MediaProvider;
    embedUrl: string;
  } | null>(null);

  // Drag and 4-Corner Snap State
  const [currentCorner, setCurrentCorner] = useState<Corner>('bottom-right');
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    isDown: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
  });

  // User Saved Links state (YouTube, Spotify, Apple Music)
  const [userLinks, setUserLinks] = useState<UserSavedLink[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Notify parent of YouTube play state
  useEffect(() => {
    onYtPlayingChange?.(isYtPlaying);
  }, [isYtPlaying, onYtPlayingChange]);

  // Notify parent of Popup/Embed active state
  useEffect(() => {
    onEmbedActiveChange?.(Boolean(activePopup));
  }, [activePopup, onEmbedActiveChange]);

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

  // Calculate coordinates for a corner
  const calculateCornerPos = (corner: Corner): { x: number; y: number } => {
    if (typeof window === 'undefined') return { x: 20, y: 100 };
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cardW = popupRef.current?.offsetWidth || Math.min(360, W - 24);
    const cardH = popupRef.current?.offsetHeight || 220;

    const marginX = W <= 640 ? 12 : 20;
    const marginTop = W <= 640 ? 64 : 72;
    const marginBottom = W <= 640 ? 80 : 86;

    switch (corner) {
      case 'bottom-left':
        return {
          x: marginX,
          y: Math.max(marginTop, H - cardH - marginBottom),
        };
      case 'bottom-right':
        return {
          x: Math.max(marginX, W - cardW - marginX),
          y: Math.max(marginTop, H - cardH - marginBottom),
        };
      case 'top-right':
        return {
          x: Math.max(marginX, W - cardW - marginX),
          y: marginTop,
        };
      case 'top-left':
        return {
          x: marginX,
          y: marginTop,
        };
    }
  };

  // Initialize position when popup opens
  useEffect(() => {
    if (activePopup && !pos) {
      const initial = calculateCornerPos(currentCorner);
      setPos(initial);
    }
  }, [activePopup]);

  // Handle window resize to prevent popup from going out of bounds
  useEffect(() => {
    const handleResize = () => {
      if (activePopup) {
        setPos((prev) => {
          if (!prev) return calculateCornerPos(currentCorner);
          const W = window.innerWidth;
          const H = window.innerHeight;
          const cardW = popupRef.current?.offsetWidth || Math.min(360, W - 24);
          const cardH = popupRef.current?.offsetHeight || 220;
          return {
            x: Math.min(Math.max(8, prev.x), Math.max(8, W - cardW - 8)),
            y: Math.min(Math.max(8, prev.y), Math.max(8, H - cardH - 8)),
          };
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePopup, currentCorner]);

  // Global mouse / touch drag listener for popup player
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDown) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cardW = popupRef.current?.offsetWidth || Math.min(360, W - 24);
      const cardH = popupRef.current?.offsetHeight || 220;

      const clampedX = Math.min(Math.max(8, dragRef.current.originX + dx), W - cardW - 8);
      const clampedY = Math.min(Math.max(8, dragRef.current.originY + dy), H - cardH - 8);

      setPos({ x: clampedX, y: clampedY });
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDown) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cardW = popupRef.current?.offsetWidth || Math.min(360, W - 24);
      const cardH = popupRef.current?.offsetHeight || 220;

      const clampedX = Math.min(Math.max(8, dragRef.current.originX + dx), W - cardW - 8);
      const clampedY = Math.min(Math.max(8, dragRef.current.originY + dy), H - cardH - 8);

      setPos({ x: clampedX, y: clampedY });
    };

    const onEnd = () => {
      if (!dragRef.current.isDown) return;
      dragRef.current.isDown = false;
      setIsDragging(false);

      if (pos && dragRef.current.hasMoved) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const midX = W / 2;
        const midY = H / 2;
        let detected: Corner = 'bottom-right';
        if (pos.x < midX && pos.y < midY) detected = 'top-left';
        else if (pos.x >= midX && pos.y < midY) detected = 'top-right';
        else if (pos.x < midX && pos.y >= midY) detected = 'bottom-left';
        else detected = 'bottom-right';

        setCurrentCorner(detected);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [pos]);

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

        if (savedYtUrl && !combined.some((l) => l.url === savedYtUrl)) {
          const migrated: UserSavedLink = {
            id: `link_${Date.now()}_legacy`,
            url: savedYtUrl,
            title: savedYtTitle || 'YouTube Audio',
            provider: 'youtube',
            type: 'video',
            addedAt: Date.now(),
          };
          combined = [migrated, ...combined];
          await saveUserSavedLinks(combined);
        }

        setUserLinks(combined);

        if (savedYtUrl) {
          setYtActiveUrl(savedYtUrl);
          setYtTitle(savedYtTitle || 'YouTube Audio');
        } else {
          const firstYt = combined.find((l) => l.provider === 'youtube');
          if (firstYt) {
            setYtActiveUrl(firstYt.url);
            setYtTitle(firstYt.title);
          }
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

  // Show auto-dismissing toast
  const showToast = (message: string) => {
    setToastMsg(message);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  // Helper to render secondary badge (e.g. YouTube · Video, Spotify · Playlist)
  const getSecondaryBadge = (link: UserSavedLink): string => {
    const providerName =
      link.provider === 'youtube'
        ? 'YouTube'
        : link.provider === 'spotify'
        ? 'Spotify'
        : 'Apple Music';

    let typeName = '';
    switch (link.type) {
      case 'video':
        typeName = 'Video';
        break;
      case 'playlist':
        typeName = 'Playlist';
        break;
      case 'track':
        typeName = 'Track';
        break;
      case 'album':
        typeName = 'Album';
        break;
      case 'song':
        typeName = language === 'vi' ? 'Bài hát' : 'Song';
        break;
      default:
        typeName = link.type;
    }

    return `${providerName} · ${typeName}`;
  };

  // 1-Button Corner Cycling with direction-hint icon
  const handleCycleCorner = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = CORNER_ORDER.indexOf(currentCorner);
    const nextCorner = CORNER_ORDER[(curIdx + 1) % CORNER_ORDER.length];
    setCurrentCorner(nextCorner);
    const nextPos = calculateCornerPos(nextCorner);
    setPos(nextPos);
  };

  const renderCornerCycleIcon = (cur: Corner) => {
    switch (cur) {
      case 'bottom-left':
        // Next is bottom-right -> hint bottom-right
        return <ArrowDownRight size={13} />;
      case 'bottom-right':
        // Next is top-right -> hint top-right
        return <ArrowUpRight size={13} />;
      case 'top-right':
        // Next is top-left -> hint top-left
        return <ArrowUpLeft size={13} />;
      case 'top-left':
        // Next is bottom-left -> hint bottom-left
        return <ArrowDownLeft size={13} />;
    }
  };

  const getCornerCycleTooltip = (cur: Corner) => {
    switch (cur) {
      case 'bottom-left':
        return language === 'vi' ? 'Chuyển sang góc Dưới Phải' : 'Move to bottom-right';
      case 'bottom-right':
        return language === 'vi' ? 'Chuyển sang góc Trên Phải' : 'Move to top-right';
      case 'top-right':
        return language === 'vi' ? 'Chuyển sang góc Trên Trái' : 'Move to top-left';
      case 'top-left':
        return language === 'vi' ? 'Chuyển sang góc Dưới Trái' : 'Move to bottom-left';
    }
  };

  // Open Popup Player for any link (YouTube, Spotify, Apple Music)
  const handleOpenPopup = async (link: UserSavedLink) => {
    if (link.provider === 'youtube') {
      if (isPlaying) await togglePlayPause();
      setYtActiveUrl(link.url);
      setYtTitle(link.title);
      setIsYtPlaying(true);
      setActivePopup({
        url: link.url,
        title: link.title,
        provider: 'youtube',
        embedUrl: link.url,
      });
      Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: link.url }).catch(console.error);
      Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: link.title }).catch(console.error);
    } else if (link.provider === 'spotify') {
      if (isYtPlaying) setIsYtPlaying(false);
      if (isPlaying) await togglePlayPause();

      const embedUrl = getSpotifyEmbedUrl(link.url);
      if (embedUrl) {
        setActivePopup({
          url: link.url,
          title: link.title,
          provider: 'spotify',
          embedUrl,
        });
      } else {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      }
    } else if (link.provider === 'appleMusic') {
      if (isYtPlaying) setIsYtPlaying(false);
      if (isPlaying) await togglePlayPause();

      const embedUrl = getAppleMusicEmbedUrl(link.url);
      if (embedUrl) {
        setActivePopup({
          url: link.url,
          title: link.title,
          provider: 'appleMusic',
          embedUrl,
        });
      } else {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Play / Toggle a User Saved Link
  const handlePlayUserLink = async (link: UserSavedLink) => {
    if (link.provider === 'youtube') {
      if (ytActiveUrl === link.url) {
        const nextState = !isYtPlaying;
        setIsYtPlaying(nextState);
        if (nextState && isPlaying) {
          await togglePlayPause();
        }
      } else {
        setYtActiveUrl(link.url);
        setYtTitle(link.title);
        setIsYtPlaying(true);
        setYtError(null);
        if (isPlaying) {
          await togglePlayPause();
        }
        Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: link.url }).catch(console.error);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: link.title }).catch(console.error);
      }
    } else {
      // For Spotify & Apple Music, play via popup embed player
      await handleOpenPopup(link);
    }
  };

  // Delete a saved link
  const handleDeleteUserLink = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = userLinks.find((l) => l.id === id);
    const updated = userLinks.filter((l) => l.id !== id);
    setUserLinks(updated);
    await saveUserSavedLinks(updated);

    if (target && target.provider === 'youtube' && ytActiveUrl === target.url) {
      setIsYtPlaying(false);
      setYtActiveUrl('');
      setYtTitle('');
      Preferences.remove({ key: YOUTUBE_URL_STORAGE_KEY }).catch(console.error);
      Preferences.remove({ key: YOUTUBE_TITLE_STORAGE_KEY }).catch(console.error);
    }

    if (target && activePopup && activePopup.url === target.url) {
      setActivePopup(null);
    }
  };

  // Add a new YouTube, Spotify or Apple Music link
  const handleAddUserLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = linkInput.trim();
    if (!trimmed) {
      const err =
        language === 'vi'
          ? 'Vui lòng dán link YouTube, Spotify hoặc Apple Music'
          : 'Please paste a YouTube, Spotify or Apple Music link';
      setLinkError(err);
      showToast(err);
      return;
    }

    const parsed = parseMediaUrl(trimmed);
    if (!parsed) {
      const err = language === 'vi' ? 'Link không hỗ trợ' : 'Link not supported';
      setLinkError(err);
      showToast(err);
      return;
    }

    if (isDuplicateUrl(trimmed, userLinks)) {
      const err =
        language === 'vi'
          ? 'Link này đã có trong danh sách'
          : 'This link is already in your list';
      setLinkError(err);
      showToast(err);
      return;
    }

    setLinkError(null);
    setIsAddingLink(true);

    try {
      const fetchedTitle = await fetchMediaTitle(trimmed, parsed.provider, parsed.type);

      const newLink: UserSavedLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: trimmed,
        title: fetchedTitle,
        provider: parsed.provider,
        type: parsed.type,
        addedAt: Date.now(),
      };

      const updated = [newLink, ...userLinks];
      setUserLinks(updated);
      await saveUserSavedLinks(updated);
      setLinkInput('');

      // Auto-start or open popup
      if (parsed.provider === 'youtube') {
        setYtActiveUrl(newLink.url);
        setYtTitle(newLink.title);
        setIsYtPlaying(true);
        if (isPlaying) {
          await togglePlayPause();
        }
        Preferences.set({ key: YOUTUBE_URL_STORAGE_KEY, value: newLink.url }).catch(console.error);
        Preferences.set({ key: YOUTUBE_TITLE_STORAGE_KEY, value: newLink.title }).catch(console.error);
      } else {
        await handleOpenPopup(newLink);
      }
    } catch (err) {
      console.warn('Error adding media link:', err);
      const fetchErr =
        language === 'vi'
          ? 'Không thể lấy thông tin link'
          : 'Could not fetch link info';
      setLinkError(fetchErr);
      showToast(fetchErr);
    } finally {
      setIsAddingLink(false);
    }
  };

  // Next Track Handler
  const handleNextTrack = async () => {
    const playable = tracks.filter((t) => !t.isComingSoon && t.url);
    if (playable.length === 0) return;

    if (isYtPlaying) {
      const ytLinks = userLinks.filter((l) => l.provider === 'youtube');
      const curYtIdx = ytLinks.findIndex((l) => l.url === ytActiveUrl);
      if (curYtIdx >= 0 && curYtIdx < ytLinks.length - 1) {
        const nextLink = ytLinks[curYtIdx + 1];
        setYtActiveUrl(nextLink.url);
        setYtTitle(nextLink.title);
        setIsYtPlaying(true);
        return;
      }
      setIsYtPlaying(false);
      await selectTrack(playable[0]);
      return;
    }

    const curIdx = playable.findIndex((t) => t.id === currentTrack.id);
    const isLastLofiTrack = curIdx >= playable.length - 1;

    if (isLastLofiTrack) {
      const ytLinks = userLinks.filter((l) => l.provider === 'youtube');
      if (ytLinks.length > 0) {
        if (isPlaying) {
          await togglePlayPause();
        }
        setYtActiveUrl(ytLinks[0].url);
        setYtTitle(ytLinks[0].title);
        setIsYtPlaying(true);
        return;
      }
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
    if (activePopup) {
      setActivePopup(null);
    }
    await selectTrack(track);
  };

  // Audio source active status
  const isYouTubeActive = isYtPlaying;
  const isLofiActive = isPlaying && !isYtPlaying && !activePopup;
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
      {/* Hidden ReactPlayer to stream YouTube audio when popup is NOT showing YouTube */}
      {ytActiveUrl && (!activePopup || activePopup.provider !== 'youtube') && (
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

      {/* Draggable + 4-Corner Floating Popup Player (Spotify / YouTube / Apple Music) */}
      {activePopup && (
        <div
          ref={popupRef}
          className={`music-embed-player-card ${isDragging ? 'is-dragging' : ''}`}
          role="region"
          aria-label="Media Popup Player"
          style={{
            left: pos ? `${pos.x}px` : undefined,
            top: pos ? `${pos.y}px` : undefined,
            bottom: pos ? 'auto' : undefined,
            right: pos ? 'auto' : undefined,
          }}
        >
          {/* Draggable Header */}
          <div
            className="music-embed-header is-draggable-handle"
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest('button, a, input')) return;
              dragRef.current = {
                isDown: true,
                startX: e.clientX,
                startY: e.clientY,
                originX: pos ? pos.x : calculateCornerPos(currentCorner).x,
                originY: pos ? pos.y : calculateCornerPos(currentCorner).y,
                hasMoved: false,
              };
              setIsDragging(true);
            }}
            onTouchStart={(e) => {
              if ((e.target as HTMLElement).closest('button, a, input')) return;
              const touch = e.touches[0];
              if (!touch) return;
              dragRef.current = {
                isDown: true,
                startX: touch.clientX,
                startY: touch.clientY,
                originX: pos ? pos.x : calculateCornerPos(currentCorner).x,
                originY: pos ? pos.y : calculateCornerPos(currentCorner).y,
                hasMoved: false,
              };
              setIsDragging(true);
            }}
          >
            <div className="music-embed-info">
              {activePopup.provider === 'youtube' && <YouTubeIcon size={16} />}
              {activePopup.provider === 'spotify' && <SpotifyIcon size={16} />}
              {activePopup.provider === 'appleMusic' && <AppleMusicIcon size={16} />}
              <span className="music-embed-title" title={activePopup.title}>
                {activePopup.title}
              </span>
            </div>

            <div className="music-embed-actions">
              {/* Single Corner-Cycle Button with direction hint */}
              <button
                type="button"
                className="music-embed-btn corner-cycle-btn"
                onClick={handleCycleCorner}
                title={getCornerCycleTooltip(currentCorner)}
                aria-label="Cycle corner"
              >
                {renderCornerCycleIcon(currentCorner)}
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="music-embed-btn close"
                onClick={() => {
                  setActivePopup(null);
                  onEmbedActiveChange?.(false);
                }}
                title={language === 'vi' ? 'Đóng player' : 'Close player'}
                aria-label="Close player"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Popup Body */}
          <div className="music-embed-body">
            {activePopup.provider === 'youtube' ? (
              <div className="music-popup-yt-player">
                <React.Suspense fallback={<div className="music-popup-loading">Loading...</div>}>
                  <ReactPlayer
                    src={activePopup.url}
                    playing={isYtPlaying}
                    volume={volume}
                    width="100%"
                    height="180px"
                    controls={true}
                    playsInline
                    onPlay={() => setIsYtPlaying(true)}
                    onPause={() => setIsYtPlaying(false)}
                    onError={() =>
                      setYtError(
                        language === 'vi' ? 'Không thể phát video này' : 'Cannot play this video'
                      )
                    }
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      pointerEvents: isDragging ? 'none' : 'auto',
                    }}
                  />
                </React.Suspense>
              </div>
            ) : (
              <iframe
                src={activePopup.embedUrl}
                title={activePopup.title}
                width="100%"
                height={activePopup.provider === 'spotify' ? '152' : '175'}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{
                  borderRadius: 12,
                  border: 0,
                  display: 'block',
                  pointerEvents: isDragging ? 'none' : 'auto',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Popover Card & Subtle Backdrop */}
      {isOpen && (
        <>
          {/* Backdrop for outside clicks */}
          <div
            className="music-popover-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Toast Notification */}
          {toastMsg && (
            <div className="music-toast-popup" role="status">
              <AlertCircle size={13} />
              <span>{toastMsg}</span>
            </div>
          )}

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
              {/* Hàng điều khiển đang phát (Now Playing) */}
              {isAnyAudioActive && (
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
              )}

              {/* 1. Danh sách BẢN LOFI (8 bài như hiện tại, play trong app) */}
              <div className="music-section-block">
                <div className="music-subheading">
                  {language === 'vi' ? 'BẢN LOFI' : 'LOFI TRACKS'}
                </div>

                <div className="music-tracks-compact-list">
                  {tracks.map((track, idx) => {
                    const isSelected = currentTrack?.id === track.id && !track.isComingSoon;
                    const isTrackPlaying = isSelected && isPlaying && !isYouTubeActive && !activePopup;
                    const trackNumber = idx + 1;

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

              {/* 2. Section YOUR LINKS (Link của bạn) */}
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
                        ? 'Chưa có link — dán YouTube, Spotify hoặc Apple Music bên dưới'
                        : 'No links yet — paste YouTube, Spotify or Apple Music below'}
                    </span>
                  </div>
                ) : (
                  <div className="music-user-links-list">
                    {userLinks.map((link) => {
                      const isThisYtPlaying =
                        link.provider === 'youtube' && ytActiveUrl === link.url && isYtPlaying;
                      const isThisYtActive =
                        link.provider === 'youtube' && ytActiveUrl === link.url;
                      const isThisPopupActive =
                        activePopup && activePopup.url === link.url;
                      const isItemActive = isThisYtActive || isThisPopupActive;
                      const isAudioPlaying = isThisYtPlaying || isThisPopupActive;

                      return (
                        <div
                          key={link.id}
                          className={`music-user-link-item ${isItemActive ? 'is-active' : ''}`}
                          onClick={() => handlePlayUserLink(link)}
                        >
                          {/* Play / Action Button on the left */}
                          <button
                            type="button"
                            className={`user-link-play-btn ${link.provider} ${isAudioPlaying ? 'is-playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayUserLink(link);
                            }}
                            title={
                              isAudioPlaying
                                ? language === 'vi' ? 'Tạm dừng' : 'Pause'
                                : language === 'vi' ? 'Phát' : 'Play'
                            }
                            aria-label={isAudioPlaying ? 'Pause' : 'Play'}
                          >
                            {isAudioPlaying ? (
                              <Pause size={12} fill="currentColor" />
                            ) : (
                              <Play size={12} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>

                          {/* Link Info with Icon + Title + Secondary Label */}
                          <div className="user-link-info">
                            <div className="user-link-title-row">
                              <span className="user-link-title" title={link.title}>
                                {link.title}
                              </span>
                              {isAudioPlaying && (
                                <div className="music-wave-indicator mini" title="Playing">
                                  <span className="wave-bar bar-1" />
                                  <span className="wave-bar bar-2" />
                                  <span className="wave-bar bar-3" />
                                </div>
                              )}
                            </div>
                            <div className="user-link-meta">
                              {link.provider === 'youtube' && <YouTubeIcon size={12} />}
                              {link.provider === 'spotify' && <SpotifyIcon size={12} />}
                              {link.provider === 'appleMusic' && <AppleMusicIcon size={12} />}
                              <span className={`user-link-type-tag ${link.provider}`}>
                                {getSecondaryBadge(link)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons: Mở popup (bên trái) + Xóa (bên phải), ẩn mặc định, hiện khi hover */}
                          <div className="user-link-actions" onClick={(e) => e.stopPropagation()}>
                            {/* Nút mở popup player */}
                            <button
                              type="button"
                              className="user-link-action-btn popup-btn"
                              onClick={() => handleOpenPopup(link)}
                              title={language === 'vi' ? 'Mở popup player' : 'Open popup player'}
                              aria-label="Open popup player"
                            >
                              <PictureInPicture2 size={13} />
                            </button>

                            {/* Nút xóa */}
                            <button
                              type="button"
                              className="user-link-action-btn delete-btn"
                              onClick={(e) => handleDeleteUserLink(link.id, e)}
                              title={language === 'vi' ? 'Xóa link' : 'Delete link'}
                              aria-label="Delete"
                            >
                              <Trash2 size={13} />
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
                          ? 'Dán link YouTube, Spotify, Apple Music...'
                          : 'Paste YouTube, Spotify, Apple Music link...'
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

              {/* 3. Thanh Volume ở DƯỚI CÙNG của Panel (dưới Your Links / ô dán link) */}
              <div className="music-bottom-volume-wrap">
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
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
