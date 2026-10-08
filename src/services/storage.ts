import { MediaItem } from '../types';
import { INITIAL_MEDIA_ITEMS } from '../data/mockData';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

const MEDIA_STORAGE_KEY = 'miflix_media_catalog_v2';
const MY_LIST_STORAGE_KEY = 'miflix_user_watchlist';
const ADMIN_AUTH_KEY = 'miflix_admin_session';

export const ADMIN_CREDENTIALS = {
  username: 'miflix',
  password: 'mi0155176@'
};

// Real-time synchronization with Cloud Firestore for global visibility
export const subscribeToGlobalMediaCatalog = (onUpdate: (items: MediaItem[]) => void) => {
  try {
    const colRef = collection(db, 'media_items');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudItems: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          cloudItems.push(docSnap.data() as MediaItem);
        });
        if (cloudItems.length > 0) {
          localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(cloudItems));
          onUpdate(cloudItems);
        }
      } else {
        // If cloud database is empty initially, seed it with INITIAL_MEDIA_ITEMS
        seedCloudCatalogWithDefaults();
      }
    }, (error) => {
      console.warn('Firestore real-time subscription error, using local fallback:', error);
    });
  } catch (err) {
    console.warn('Firestore subscription init warning:', err);
    return () => {};
  }
};

export const seedCloudCatalogWithDefaults = async () => {
  try {
    for (const item of INITIAL_MEDIA_ITEMS) {
      await setDoc(doc(db, 'media_items', item.id), item, { merge: true });
    }
  } catch (e) {
    console.warn('Seed error:', e);
  }
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

// Saves media items locally AND syncs to Firebase Cloud Firestore for all users worldwide!
export const saveMediaItems = async (items: MediaItem[]): Promise<void> => {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    
    // Asynchronously sync each item to Firebase Cloud database
    for (const item of items) {
      if (item && item.id) {
        setDoc(doc(db, 'media_items', item.id), item, { merge: true }).catch((err) => {
          console.warn(`Failed to sync item ${item.id} to cloud:`, err);
        });
      }
    }
  } catch (err) {
    console.error('Error saving media items:', err);
  }
};

// Increment view count automatically when media is watched
export const recordMediaView = (mediaId: string): MediaItem[] => {
  const current = getStoredMediaItems();
  const updated = current.map(item => {
    if (item.id === mediaId) {
      const newViews = (item.views || 0) + 1;
      const updatedItem = { ...item, views: newViews };
      setDoc(doc(db, 'media_items', mediaId), { views: newViews }, { merge: true }).catch(() => {});
      return updatedItem;
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
    seedCloudCatalogWithDefaults();
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
    setDoc(doc(db, 'site_settings', 'ads'), settings, { merge: true }).catch(() => {});
  } catch (err) {
    console.error('Error saving ad settings:', err);
  }
};
