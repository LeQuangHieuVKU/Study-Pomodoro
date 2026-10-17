import { Preferences } from '@capacitor/preferences';

export const YOUTUBE_URL_STORAGE_KEY = 'study_pomodoro_yt_url';
export const YOUTUBE_TITLE_STORAGE_KEY = 'study_pomodoro_yt_title';

export interface YouTubePreset {
  name: string;
  url: string;
  title: string;
}

export const YOUTUBE_PRESETS: YouTubePreset[] = [
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

export const isValidYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url.trim());
};

export const getShortUrlFallback = (url: string): string => {
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

export const fetchYouTubeTitle = async (url: string): Promise<string> => {
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
    // fallback
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
