export type CategoryId = 
  | 'turkish_drama' 
  | 'arabic_cinema' 
  | 'hollywood' 
  | 'anime'
  | 'miflix_originals';

export interface CategoryInfo {
  id: CategoryId;
  titleAr: string;
  order: number;
  descriptionAr: string;
}

export const CATEGORIES_ORDERED: CategoryInfo[] = [
  {
    id: 'turkish_drama',
    titleAr: 'تركي',
    order: 1,
    descriptionAr: 'أقوى المسلسلات والأفلام التركية الحصرية'
  },
  {
    id: 'arabic_cinema',
    titleAr: 'عربي',
    order: 2,
    descriptionAr: 'أحدث الأفلام والمسلسلات العربية والخليجية والمصرية'
  },
  {
    id: 'hollywood',
    titleAr: 'أجنبي',
    order: 3,
    descriptionAr: 'أقوى وأحدث أفلام هوليوود والسينما العالمية'
  },
  {
    id: 'anime',
    titleAr: 'أنمي',
    order: 4,
    descriptionAr: 'روائع الأنمي الياباني المترجم والمدبلج بجودة فائقة'
  }
];

export interface ServerSource {
  id: string;
  name: string; // e.g. "سيرفر 1 (سريع)", "سيرفر 2 (FHD)", "سيرفر 3 (VIP)"
  url: string; // embed URL or direct video URL
  quality?: string; // "1080p", "4K", "720p"
  type?: 'embed' | 'direct' | 'youtube';
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  views?: number;
  servers: ServerSource[];
  downloadUrl?: string; // Optional download server link
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export type MediaType = 'movie' | 'series';

// Explicitly NO cast or crew field in MediaItem
export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  categoryId: CategoryId;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  releaseYear: number;
  rating?: number; // e.g. 8.7 (optional)
  ageRating?: string; // "+16", "+13", "للجميع" (optional)
  genres: string[];
  duration?: string; // (optional)
  isFeatured?: boolean; // Show in hero banner
  views: number; // Real automated view count for dynamic trending calculation
  isMiflixOriginal?: boolean;
  keywords?: string[]; // SEO tags & keywords for Google & internal search
  servers?: ServerSource[]; // For movies
  downloadUrl?: string; // Optional direct download server link
  seasons?: Season[]; // For TV series
  createdAt: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
  isAuthenticated: boolean;
}

export interface AdSettings {
  isEnabled: boolean;
  headerScript: string;
  playerBannerHtml: string;
  homeBannerHtml: string;
}
