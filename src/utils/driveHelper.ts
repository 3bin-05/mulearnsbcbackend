/**
 * Normalizes image URLs from supported sources into a direct embeddable link.
 *
 * SUPPORTED SOURCES:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Google Photos (RECOMMENDED)
 *    How to get the URL:
 *    → Open the photo in Google Photos
 *    → Right-click the image → "Copy image address"
 *    Result: https://lh3.googleusercontent.com/pw/AP1GczM...=w1920-h1080
 *    Converted to: https://lh3.googleusercontent.com/pw/AP1GczM...=s0
 *
 * 2. Google Drive (NOT RECOMMENDED — requires viewer login)
 *    https://drive.google.com/file/d/{id}/view → converted via lh3 CDN
 *    Note: Will show a Google sign-in prompt for non-authenticated users.
 *
 * 3. Any other direct URL
 *    Passed through as-is (e.g., ImgBB, Unsplash, etc.)
 */
export const getDirectImageLink = (url: string | undefined): string => {
  if (!url) return '';

  const trimmed = url.trim();

  // ── Google Photos: lh3.googleusercontent.com/pw/... ───────────────────────
  // Strip any existing size/crop suffix and enforce =s0 (full original size).
  const googlePhotosMatch = trimmed.match(
    /^(https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+)(=.+)?$/
  );
  if (googlePhotosMatch && googlePhotosMatch[1]) {
    return `${googlePhotosMatch[1]}=s0`;
  }

  // ── Generic lh3.googleusercontent.com (other Google image CDN variants) ───
  const lh3Match = trimmed.match(
    /^(https:\/\/lh3\.googleusercontent\.com\/[^=]+)(=.+)?$/
  );
  if (lh3Match && lh3Match[1]) {
    return `${lh3Match[1]}=s0`;
  }

  // ── Google Drive: /file/d/{id}/view ───────────────────────────────────────
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    // Note: Drive requires Google login to view — use Google Photos instead.
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}=s0`;
  }

  // ── Google Drive: open?id={id} ────────────────────────────────────────────
  const openIdMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openIdMatch[1]}=s0`;
  }

  // ── Google Drive: uc?id={id} ──────────────────────────────────────────────
  const ucIdMatch = trimmed.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucIdMatch && ucIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucIdMatch[1]}=s0`;
  }

  // ── Fallback: pass through unchanged (ImgBB, Unsplash, etc.) ─────────────
  return trimmed;
};
