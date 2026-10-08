import { MediaItem } from '../types';
import { INITIAL_MEDIA_ITEMS } from '../data/mockData';

const MEDIA_STORAGE_KEY = 'miflix_media_catalog_v2';
const MY_LIST_STORAGE_KEY = 'miflix_user_watchlist';
const ADMIN_AUTH_KEY = 'miflix_admin_session';

export const ADMIN_CREDENTIALS = {
  username: 'miflix',
  password: 'mi0155176@'
};

export const getStoredMediaItems = (): MediaItem[] => {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ITEMS));
      return INITIAL_MEDIA_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ITEMS));
      return INITIAL_MEDIA_ITEMS;
    }
    return parsed;
  } catch {
    return INITIAL_MEDIA_ITEMS;
  }
};

export const saveMediaItems = (items: MediaItem[]): void => {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving media items to localStorage:', err);
  }
};

// Increment view count automatically when media is watched
export const recordMediaView = (mediaId: string): MediaItem[] => {
  const current = getStoredMediaItems();
  const updated = current.map(item => {
    if (item.id === mediaId) {
      return {
        ...item,
        views: (item.views || 0) + 1
      };
    }
    return item;
  });
  saveMediaItems(updated);
  return updated;
};

export const incrementMediaViews = recordMediaView;

export const resetMediaCatalogToDefault = (): MediaItem[] => {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ITEMS));
  } catch {
    // ignore
  }
  return INITIAL_MEDIA_ITEMS;
};

// My List (Watchlist) Management
export const getMyListIds = (): string[] => {
  try {
    const raw = localStorage.getItem(MY_LIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleMyList = (id: string): string[] => {
  const current = getMyListIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter(x => x !== id) : [...current, id];
  try {
    localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving watchlist:', err);
  }
  return updated;
};

export const isInMyList = (id: string): boolean => {
  return getMyListIds().includes(id);
};

// Admin Session Management
export const isAdminLoggedIn = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

export const verifyAdminLogin = (user: string, pass: string): boolean => {
  // Support both "miflix" and "Admin miflix" to prevent any user lockout
  const cleanUser = user.trim().toLowerCase();
  const matchesUser = cleanUser === 'miflix' || cleanUser === 'admin miflix';
  const matchesPass = pass === ADMIN_CREDENTIALS.password;

  if (matchesUser && matchesPass) {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } catch {
      // ignore
    }
    return true;
  }
  return false;
};

export const logoutAdmin = (): void => {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {
    // ignore
  }
};

// Ads Settings Management
const ADS_STORAGE_KEY = 'miflix_ad_settings';

export const DEFAULT_AD_SETTINGS: import('../types').AdSettings = {
  isEnabled: false,
  headerScript: '',
  playerBannerHtml: '',
  homeBannerHtml: ''
};

export const getStoredAdSettings = (): import('../types').AdSettings => {
  try {
    const raw = localStorage.getItem(ADS_STORAGE_KEY);
    if (!raw) return DEFAULT_AD_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      isEnabled: Boolean(parsed && parsed.isEnabled),
      headerScript: String((parsed && parsed.headerScript) || ''),
      playerBannerHtml: String((parsed && parsed.playerBannerHtml) || ''),
      homeBannerHtml: String((parsed && parsed.homeBannerHtml) || '')
    };
  } catch {
    return DEFAULT_AD_SETTINGS;
  }
};

export const saveAdSettings = (settings: import('../types').AdSettings): void => {
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving ad settings:', err);
  }
};
