import { MediaItem, AdSettings } from '../types';
import { INITIAL_MEDIA_ITEMS } from '../data/mockData';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

const MEDIA_STORAGE_KEY = 'miflix_media_catalog_v2';
const MY_LIST_STORAGE_KEY = 'miflix_user_watchlist';
const ADMIN_AUTH_KEY = 'miflix_admin_session';
const ADS_STORAGE_KEY = 'miflix_ad_settings';

export const ADMIN_CREDENTIALS = {
  username: 'miflix',
  password: 'mi0155176@'
};

/**
 * Sanitizes object deeply to remove all `undefined` values.
 * Firestore throws a fatal error if any field in an object is `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item)) as any;
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value === undefined) continue;
      if (value !== null && typeof value === 'object') {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }
  return data;
}

/**
 * Immediately saves a single media item to Firebase Cloud Firestore.
 * Automatically removes any undefined fields and updates local cache.
 */
export async function saveSingleMediaItemToCloud(item: MediaItem): Promise<void> {
  if (!item || !item.id) {
    throw new Error('العمل المطلوب حفظه غير صالح أو يفتقد لمعرف ID.');
  }

  const cleanItem = sanitizeForFirestore(item);
  const docRef = doc(db, 'media_items', item.id);
  await setDoc(docRef, cleanItem, { merge: true });

  // Update local storage cache
  try {
    const current = getStoredMediaItems();
    const idx = current.findIndex(i => i.id === item.id);
    let updated: MediaItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = cleanItem;
    } else {
      updated = [cleanItem, ...current];
    }
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Local storage cache update warning:', err);
  }
}

/**
 * Immediately deletes a media item from Firebase Cloud Firestore.
 * This guarantees the item is deleted across all devices and browsers globally!
 */
export async function deleteMediaItemFromCloud(itemId: string): Promise<void> {
  if (!itemId) {
    throw new Error('معرف العمل غير صالح.');
  }

  const docRef = doc(db, 'media_items', itemId);
  await deleteDoc(docRef);

  // Update local storage cache
  try {
    const current = getStoredMediaItems();
    const updated = current.filter(i => i.id !== itemId);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Local storage cache delete warning:', err);
  }
}

function normalizeMediaItem(data: any): MediaItem | null {
  if (!data || !data.id || !data.title) return null;
  return {
    ...data,
    genres: Array.isArray(data.genres) && data.genres.length > 0 ? data.genres : ['دراما'],
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    servers: Array.isArray(data.servers) ? data.servers : [],
    seasons: Array.isArray(data.seasons) ? data.seasons : [],
    views: typeof data.views === 'number' ? data.views : 0,
    rating: typeof data.rating === 'number' ? data.rating : 8.5,
    releaseYear: typeof data.releaseYear === 'number' ? data.releaseYear : 2024,
    categoryId: data.categoryId || 'turkish_drama',
    type: data.type === 'series' ? 'series' : 'movie'
  };
}

/**
 * Fetches the entire media catalog directly from Cloud Firestore once.
 */
export async function fetchGlobalMediaCatalog(): Promise<MediaItem[]> {
  try {
    const colRef = collection(db, 'media_items');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: MediaItem[] = [];
      snapshot.forEach(docSnap => {
        const item = normalizeMediaItem(docSnap.data());
        if (item) {
          items.push(item);
        }
      });
      if (items.length > 0) {
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
        return items;
      }
    }
    return getStoredMediaItems();
  } catch (err) {
    console.warn('fetchGlobalMediaCatalog fallback:', err);
    return getStoredMediaItems();
  }
}

/**
 * Real-time synchronization with Cloud Firestore for global visibility across all browsers.
 */
export const subscribeToGlobalMediaCatalog = (
  onUpdate: (items: MediaItem[]) => void,
  onStatusChange?: (status: 'connected' | 'connecting' | 'error', errorMsg?: string) => void
) => {
  try {
    onStatusChange?.('connecting');
    const colRef = collection(db, 'media_items');
    return onSnapshot(colRef, (snapshot) => {
      onStatusChange?.('connected');
      if (!snapshot.empty) {
        const cloudItems: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          const item = normalizeMediaItem(docSnap.data());
          if (item) {
            cloudItems.push(item);
          }
        });
        if (cloudItems.length > 0) {
          // Sort newest items first
          cloudItems.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(cloudItems));
          onUpdate(cloudItems);
        }
      } else {
        // If cloud database is empty initially, seed it with INITIAL_MEDIA_ITEMS
        seedCloudCatalogWithDefaults().then(() => {
          onUpdate(INITIAL_MEDIA_ITEMS);
        });
      }
    }, (error) => {
      console.warn('Firestore real-time subscription error, using local fallback:', error);
      onStatusChange?.('error', error.message);
    });
  } catch (err: any) {
    console.warn('Firestore subscription init warning:', err);
    onStatusChange?.('error', err?.message);
    return () => {};
  }
};

export const seedCloudCatalogWithDefaults = async () => {
  try {
    const local = getStoredMediaItems();
    const itemsToSeed = local && local.length > 0 ? local : INITIAL_MEDIA_ITEMS;
    for (const item of itemsToSeed) {
      if (item && item.id) {
        const clean = sanitizeForFirestore(item);
        await setDoc(doc(db, 'media_items', item.id), clean, { merge: true });
      }
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

/**
 * Saves media items array and bulk syncs each to Cloud Firestore.
 */
export const saveMediaItems = async (items: MediaItem[]): Promise<void> => {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    
    // Asynchronously sync each item to Firebase Cloud database with sanitization
    for (const item of items) {
      if (item && item.id) {
        const clean = sanitizeForFirestore(item);
        await setDoc(doc(db, 'media_items', item.id), clean, { merge: true });
      }
    }
  } catch (err) {
    console.error('Error saving media items:', err);
    throw err;
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
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
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
export const DEFAULT_AD_SETTINGS: AdSettings = {
  isEnabled: false,
  headerScript: '',
  playerBannerHtml: '',
  homeBannerHtml: ''
};

export const getStoredAdSettings = (): AdSettings => {
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

export const subscribeToAdSettings = (onUpdate: (settings: AdSettings) => void) => {
  try {
    const docRef = doc(db, 'site_settings', 'ads');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdSettings;
        const formatted: AdSettings = {
          isEnabled: Boolean(data?.isEnabled),
          headerScript: String(data?.headerScript || ''),
          playerBannerHtml: String(data?.playerBannerHtml || ''),
          homeBannerHtml: String(data?.homeBannerHtml || '')
        };
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(formatted));
        onUpdate(formatted);
      }
    }, (err) => {
      console.warn('Ad settings subscription warning:', err);
    });
  } catch {
    return () => {};
  }
};

export const saveAdSettings = async (settings: AdSettings): Promise<void> => {
  try {
    const clean = sanitizeForFirestore(settings);
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(clean));
    await setDoc(doc(db, 'site_settings', 'ads'), clean, { merge: true });
  } catch (err) {
    console.error('Error saving ad settings:', err);
    throw err;
  }
};
