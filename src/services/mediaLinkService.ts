import { Preferences } from '@capacitor/preferences';
import { fetchYouTubeTitle, isValidYouTubeUrl } from './youtubeService';

export type MediaProvider = 'youtube' | 'spotify' | 'appleMusic';
export type MediaType = 'video' | 'playlist' | 'track' | 'album' | 'song';

export interface UserSavedLink {
  id: string;
  url: string;
  title: string;
  provider: MediaProvider;
  type: MediaType;
  addedAt: number;
}

export const USER_LINKS_STORAGE_KEY = 'study_pomodoro_user_links_v1';

/**
 * Parse a media URL into provider and media type metadata
 */
export const parseMediaUrl = (
  url: string
): { provider: MediaProvider; type: MediaType } | null => {
  if (!url) return null;
  const trimmed = url.trim();
  let parsed: URL;
  try {
    parsed = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    );
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = parsed.pathname.toLowerCase();
  const searchParams = parsed.searchParams;

  // 1. YouTube
  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtu.be'
  ) {
    if (searchParams.has('list') || pathname.startsWith('/playlist')) {
      return { provider: 'youtube', type: 'playlist' };
    }
    if (
      pathname.startsWith('/watch') ||
      pathname.startsWith('/shorts/') ||
      host === 'youtu.be'
    ) {
      return { provider: 'youtube', type: 'video' };
    }
    return { provider: 'youtube', type: 'video' };
  }

  // 2. Spotify
  if (
    host === 'open.spotify.com' ||
    host === 'spotify.com' ||
    host === 'spotify.link'
  ) {
    if (pathname.includes('/playlist/')) {
      return { provider: 'spotify', type: 'playlist' };
    }
    if (pathname.includes('/album/')) {
      return { provider: 'spotify', type: 'album' };
    }
    if (pathname.includes('/track/')) {
      return { provider: 'spotify', type: 'track' };
    }
    return { provider: 'spotify', type: 'track' };
  }

  // 3. Apple Music
  if (host === 'music.apple.com') {
    if (searchParams.has('i') || pathname.includes('/song/')) {
      return { provider: 'appleMusic', type: 'song' };
    }
    if (pathname.includes('/playlist/')) {
      return { provider: 'appleMusic', type: 'playlist' };
    }
    if (pathname.includes('/album/')) {
      return { provider: 'appleMusic', type: 'album' };
    }
    return { provider: 'appleMusic', type: 'song' };
  }

  return null;
};

/**
 * Backward compatibility alias
 */
export const detectLinkType = (url: string): MediaProvider | null => {
  const result = parseMediaUrl(url);
  return result ? result.provider : null;
};

/**
 * Fetch public oEmbed title for a Spotify URL with intelligent fallbacks
 */
export const fetchSpotifyTitle = async (url: string): Promise<string> => {
  const trimmed = url.trim();

  // Official Spotify oEmbed endpoint (CORS-friendly, no API key required)
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

  try {
    const parsed = new URL(trimmed);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const category = pathParts[0]?.toLowerCase();
    if (category === 'playlist') return 'Spotify Playlist';
    if (category === 'track') return 'Spotify Track';
    if (category === 'album') return 'Spotify Album';
  } catch {
    // fallback
  }

  return 'Spotify Music';
};

/**
 * Parse Apple Music title from URL path slug
 */
export const extractAppleMusicTitle = (url: string, type: MediaType): string => {
  try {
    const parsed = new URL(
      url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    );
    const parts = parsed.pathname.split('/').filter(Boolean);
    // Typical pattern: /[country]/[type]/[slug]/[id] -> parts[2] is slug
    let slug = '';
    if (
      parts.length >= 3 &&
      ['album', 'playlist', 'song'].includes(parts[1]?.toLowerCase())
    ) {
      slug = parts[2];
    } else if (
      parts.length >= 2 &&
      ['album', 'playlist', 'song'].includes(parts[0]?.toLowerCase())
    ) {
      slug = parts[1];
    }

    if (slug) {
      const cleaned = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
      const words = cleaned
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      const title = words.join(' ');
      if (title.length > 0) {
        return title;
      }
    }
  } catch {
    // ignore
  }

  if (type === 'song') return 'Apple Music Song';
  if (type === 'album') return 'Apple Music Album';
  if (type === 'playlist') return 'Apple Music Playlist';
  return 'Apple Music';
};

/**
 * Fetch media title according to detected provider & type
 */
export const fetchMediaTitle = async (
  url: string,
  provider: MediaProvider,
  type: MediaType
): Promise<string> => {
  const trimmed = url.trim();
  if (provider === 'youtube') {
    return fetchYouTubeTitle(trimmed);
  }
  if (provider === 'spotify') {
    return fetchSpotifyTitle(trimmed);
  }
  if (provider === 'appleMusic') {
    return extractAppleMusicTitle(trimmed, type);
  }
  return trimmed;
};

/**
 * Generate Spotify iframe embed URL
 */
export const getSpotifyEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(
      url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    );
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!host.includes('spotify.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (
      parts.length >= 2 &&
      ['track', 'playlist', 'album', 'episode', 'show'].includes(
        parts[0].toLowerCase()
      )
    ) {
      return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator&theme=0`;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Generate Apple Music iframe embed URL
 */
export const getAppleMusicEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(
      url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    );
    if (!parsed.hostname.toLowerCase().includes('music.apple.com')) return null;
    return `https://embed.music.apple.com${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
};

/**
 * Normalize a media URL for deduplication checks
 */
export const normalizeMediaUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(
      url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    );
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, '').toLowerCase();

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      if (host.includes('youtu.be')) {
        return `yt:${pathname.replace(/^\//, '')}`;
      }
      const list = parsed.searchParams.get('list');
      if (list) return `yt:list:${list}`;
      const v = parsed.searchParams.get('v');
      if (v) return `yt:${v}`;
      return `yt:${pathname}`;
    }

    // Spotify
    if (host.includes('spotify.com')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `sp:${parts[0]}:${parts[1]}`;
      }
    }

    // Apple Music
    if (host.includes('apple.com')) {
      const songId = parsed.searchParams.get('i');
      if (songId) return `am:song:${songId}`;
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 4) {
        return `am:${parts[1]}:${parts[3]}`;
      }
      return `am:${pathname}`;
    }

    return `${host}${pathname}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
};

/**
 * Check if link already exists in user saved links list
 */
export const isDuplicateUrl = (
  newUrl: string,
  existingLinks: UserSavedLink[]
): boolean => {
  const normNew = normalizeMediaUrl(newUrl);
  return existingLinks.some((item) => normalizeMediaUrl(item.url) === normNew);
};

/**
 * Load user saved links from Capacitor Preferences / LocalStorage with schema migration
 */
export const loadUserSavedLinks = async (): Promise<UserSavedLink[]> => {
  let raw: any[] = [];
  try {
    const { value } = await Preferences.get({ key: USER_LINKS_STORAGE_KEY });
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) raw = parsed;
    }
  } catch (err) {
    console.warn('Failed to load user links from Preferences:', err);
  }

  if (raw.length === 0) {
    try {
      const local = localStorage.getItem(USER_LINKS_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) raw = parsed;
      }
    } catch {
      // ignore
    }
  }

  // Normalize legacy data
  return raw.map((item) => {
    let provider: MediaProvider = item.provider;
    let type: MediaType = item.type;

    if (!provider) {
      if (item.type === 'youtube') {
        provider = 'youtube';
        type = 'video';
      } else if (item.type === 'spotify') {
        provider = 'spotify';
        type = 'track';
      } else {
        const detected = parseMediaUrl(item.url);
        provider = detected ? detected.provider : 'youtube';
        type = detected ? detected.type : 'video';
      }
    }

    return {
      id:
        item.id ||
        `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: item.url,
      title: item.title || 'Media Link',
      provider,
      type,
      addedAt: item.addedAt || Date.now(),
    };
  });
};

/**
 * Persist user saved links to Capacitor Preferences and LocalStorage
 */
export const saveUserSavedLinks = async (
  links: UserSavedLink[]
): Promise<void> => {
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
