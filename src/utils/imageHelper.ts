/**
 * Normalizes image URLs from hosting sites like ImgBB, Postimages, Google Drive, Dropbox, etc.
 * Converts viewer web pages into direct, high-speed image URLs so they render reliably.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. ImgBB direct link or viewer link: https://ibb.co/VYTqf4w1 or https://ibb.co/xxxx
  // Notice: ibb.co/xxxx is an HTML webpage, not a direct image URL.
  // Direct images are on i.ibb.co/<folder>/<filename>
  // If the user pastes an ibb.co viewer link, we should guide them or normalize common patterns.
  // When a user pastes https://i.ibb.co/... it works directly.

  // 2. Google Drive shared link: drive.google.com/file/d/ID/view?usp=sharing
  const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
  }

  // 3. Dropbox: ?dl=0 -> ?raw=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  // 4. Postimages viewer: postimg.cc/xxx -> direct if applicable or return trimmed
  return trimmed;
}

/**
 * Checks if a URL looks like an HTML viewer page rather than a direct image file
 */
export function isHtmlViewerImageUrl(url: string): { isViewer: boolean; reason?: string; directHint?: string } {
  if (!url) return { isViewer: false };
  const trimmed = url.trim();

  // Check ImgBB webpage viewer (ibb.co/XYZ instead of i.ibb.co/XYZ/image.jpg)
  if (/^https?:\/\/ibb\.co\/[a-zA-Z0-9]+/i.test(trimmed)) {
    return {
      isViewer: true,
      reason: 'رابط صفحة معاينة وليس رابط مباشر للصورة',
      directHint: 'على موقع ImgBB: اضغط كليك يمين على الصورة واختر "نسخ عنوان الصورة" (Copy Image Address) بحيث يبدأ الرابط بـ https://i.ibb.co/ وينتهي بـ .jpg أو .png'
    };
  }

  return { isViewer: false };
}

/**
 * Returns the latest episode number for a series (highest episode number across all seasons)
 */
export function getLatestEpisodeNumber(item: { type: string; seasons?: { episodes?: { episodeNumber?: number }[] }[] }): number | null {
  if (item.type !== 'series' || !item.seasons || item.seasons.length === 0) {
    return null;
  }
  let maxEp = 0;
  for (const season of item.seasons) {
    if (season.episodes && season.episodes.length > 0) {
      for (const ep of season.episodes) {
        if (typeof ep.episodeNumber === 'number' && ep.episodeNumber > maxEp) {
          maxEp = ep.episodeNumber;
        }
      }
    }
  }
  return maxEp > 0 ? maxEp : null;
}
