export function getMedusaBaseUrl() {
  return (import.meta.env.VITE_MEDUSA_URL || 'https://130.49.149.59').replace(/\/$/, '');
}

export function normalizeMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  const staticMatch = trimmed.match(/^https?:\/\/[^/]+(\/static\/.+)$/);
  if (staticMatch) {
    return staticMatch[1];
  }
  return trimmed;
}

export function resolveAsset(url) {
  if (!url) return '';
  const str = String(url).trim();
  const medusaBase = getMedusaBaseUrl();
  const staticMatch = str.match(/^https?:\/\/[^/]+(\/static\/.+)$/);
  if (staticMatch) {
    return medusaBase + staticMatch[1];
  }
  if (str.startsWith('/static/')) {
    return medusaBase + str;
  }
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('//') || str.startsWith('data:')) {
    return str;
  }
  const clean = str.replace(/^\.?\//, '');
  if (typeof window === 'undefined') return '/' + clean;

  const isGhPages = window.location.hostname.includes('github.io');
  if (isGhPages) {
    if (window.location.pathname.startsWith('/apeks-gnss/docs')) {
      return '/apeks-gnss/docs/' + clean;
    }
    return '/apeks-gnss/' + clean;
  }
  return '/' + clean;
}
