import { Photo } from '../types';

export interface OptimizedImageUrls {
  thumbnail: string;  // 150px blur placeholder
  display: string;   // 800-1200px display size
  full: string;      // Original full size
}

/**
 * Generate optimized image URLs for a photo.
 * For picsum.photos: creates sized URLs
 * For other sources: returns original
 */
export function getOptimizedImageUrls(photo: Photo): OptimizedImageUrls {
  const base = photo.url;

  // Handle picsum.photos
  if (base.includes('picsum.photos')) {
    // Extract seed and dimensions
    const match = base.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
    if (match) {
      const [, seed, width, height] = match;
      const aspectRatio = parseInt(height) / parseInt(width);
      return {
        thumbnail: `https://picsum.photos/seed/${seed}/150/150?blur=5`,
        display: `https://picsum.photos/seed/${seed}/1200/${Math.round(1200 * aspectRatio)}`,
        full: base,
      };
    }
  }

  // For other URLs, return original
  return {
    thumbnail: base,
    display: base,
    full: base,
  };
}

/**
 * Generate a blur placeholder URL for picsum images
 */
export function getBlurPlaceholder(photo: Photo): string {
  if (photo.url.includes('picsum.photos')) {
    const match = photo.url.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
    if (match) {
      const [, seed, width, height] = match;
      const aspectRatio = parseInt(height) / parseInt(width);
      // Use tiny dimensions and blur for fast load
      return `https://picsum.photos/seed/${seed}/20/${Math.round(20 * aspectRatio)}?blur=3`;
    }
  }
  return photo.url;
}
