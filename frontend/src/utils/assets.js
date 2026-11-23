export function resolveAsset(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.replace(/^\.?\//, '');
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
