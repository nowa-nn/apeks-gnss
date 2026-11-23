export function resolveAsset(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.replace(/^\.?\//, '');
  const isGhPages = typeof window !== 'undefined' && window.location.pathname.includes('/apeks-gnss');
  const prefix = isGhPages ? '/apeks-gnss/' : '/';
  return prefix + clean;
}
