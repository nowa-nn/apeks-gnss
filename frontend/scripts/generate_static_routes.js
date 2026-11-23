import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist! Run vite build first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// Load products
const { products } = await import('../src/data/products.js');

const staticPaths = [
  'catalog',
  'checkout',
  'privacy',
  'offer',
  'oferta',
  'terms',
  'shop-terms.php',
  'services',
  'uslugi',
  'service',
  'instructions',
  'manuals',
  'instrukcii',
  'downloads',
  'partners',
  'partneram',
  'dealers',
  'page-template',
  'template',
  'custom-page'
];

products.forEach(p => {
  // main slug
  staticPaths.push(`product/${p.slug}`);
  staticPaths.push(`products/${p.slug}`);

  // aliases
  if (p.aliases && Array.isArray(p.aliases)) {
    p.aliases.forEach(alias => {
      staticPaths.push(`product/${alias}`);
      staticPaths.push(`products/${alias}`);
    });
  }
});

const uniquePaths = [...new Set(staticPaths)];
console.log(`Generating static route directories for ${uniquePaths.length} paths...`);

uniquePaths.forEach(relPath => {
  const targetDir = path.join(distDir, relPath);
  fs.mkdirSync(targetDir, { recursive: true });

  const segments = relPath.split('/').filter(Boolean);
  const depth = segments.length;
  const prefix = '../'.repeat(depth);

  // Adjust relative asset paths for subdirectories
  const customizedHtml = indexHtml
    .replace(/(src|href)=["']\.\/assets\//g, `$1="${prefix}assets/`)
    .replace(/(src|href)=["']assets\//g, `$1="${prefix}assets/`);

  fs.writeFileSync(path.join(targetDir, 'index.html'), customizedHtml, 'utf8');
});

console.log('Static route generation complete!');
