import { Preferences } from '@capacitor/preferences';
import { fetchYouTubeTitle, isValidYouTubeUrl } from './youtubeService';

export interface UserSavedLink {
  id: string;
  url: string;
  title: string;
  type: 'youtube' | 'spotify';
  addedAt: number;
}

export const USER_LINKS_STORAGE_KEY = 'study_pomodoro_user_links_v1';

/**
 * Detect whether a given URL is a YouTube or Spotify link
 */
export const detectLinkType = (url: string): 'youtube' | 'spotify' | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (isValidYouTubeUrl(trimmed)) {
    return 'youtube';
  }
  if (
    /^(https?:\/\/)?(open\.)?spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/i.test(trimmed) ||
    /^(https?:\/\/)?spotify\.link\/[a-zA-Z0-9]+/i.test(trimmed)
  ) {
    return 'spotify';
  }
  return null;
};

/**
 * Fetch public oEmbed title for a Spotify URL with intelligent fallbacks
 */
export const fetchSpotifyTitle = async (url: string): Promise<string> => {
  const trimmed = url.trim();

  // 1. Official Spotify oEmbed endpoint (CORS-friendly, no API key required)
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.title === 'string' && data.title.trim()) {
        return data.title.trim();
      }
    }
  } catch {
    // network or CORS fallback
  }

  // 2. Fallback based on URL category
  try {
    const parsed = new URL(trimmed);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const category = pathParts[0]?.toLowerCase();
    if (category === 'playlist') return 'Spotify Playlist';
    if (category === 'track') return 'Spotify Track';
    if (category === 'album') return 'Spotify Album';
    if (category === 'artist') return 'Spotify Artist';
  } catch {
    // fallback
  }

  return 'Spotify Music';
};

/**
 * Fetch media title according to detected type
 */
export const fetchMediaTitle = async (url: string, type: 'youtube' | 'spotify'): Promise<string> => {
  const trimmed = url.trim();
  if (type === 'youtube') {
    return fetchYouTubeTitle(trimmed);
  }
  if (type === 'spotify') {
    return fetchSpotifyTitle(trimmed);
  }
  return trimmed;
};

/**
 * Normalize a media URL for deduplication checks
 */
export const normalizeMediaUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    // Lowercase host
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    let pathname = parsed.pathname.replace(/\/+$/, '');
    let search = '';

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      if (host.includes('youtu.be')) {
        const videoId = pathname.replace(/^\//, '');
        return `youtube:${videoId}`;
      }
      const v = parsed.searchParams.get('v');
      if (v) return `youtube:${v}`;
      const list = parsed.searchParams.get('list');
      if (list) return `youtube:list:${list}`;
    }

    if (host.includes('spotify.com')) {
      // open.spotify.com/track/xxxx or playlist/xxxx
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `spotify:${parts[0]}:${parts[1]}`;
      }
    }

    return `${host}${pathname}${search}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
};

/**
 * Check if link already exists in user saved links list
 */
export const isDuplicateUrl = (newUrl: string, existingLinks: UserSavedLink[]): boolean => {
  const normNew = normalizeMediaUrl(newUrl);
  return existingLinks.some((item) => normalizeMediaUrl(item.url) === normNew);
};

/**
 * Load user saved links from Capacitor Preferences / LocalStorage
 */
export const loadUserSavedLinks = async (): Promise<UserSavedLink[]> => {
  try {
    const { value } = await Preferences.get({ key: USER_LINKS_STORAGE_KEY });
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load user links from Preferences:', err);
  }

  try {
    const local = localStorage.getItem(USER_LINKS_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }

  return [];
};

/**
 * Persist user saved links to Capacitor Preferences and LocalStorage
 */
export const saveUserSavedLinks = async (links: UserSavedLink[]): Promise<void> => {
  const json = JSON.stringify(links);
  try {
    await Preferences.set({ key: USER_LINKS_STORAGE_KEY, value: json });
  } catch (err) {
    console.warn('Failed to save user links to Preferences:', err);
  }
  try {
    localStorage.setItem(USER_LINKS_STORAGE_KEY, json);
  } catch {
    // ignore
  }
};
