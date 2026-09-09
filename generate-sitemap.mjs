import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of the website
const BASE_URL = 'https://impacto33.com';

// Load SEO data
const seoDataPath = path.join(__dirname, 'src/data/seo-sitemap.json');
const seoData = JSON.parse(fs.readFileSync(seoDataPath, 'utf-8'));
const extraRoutesPath = path.join(__dirname, 'src/data/sitemap-extra-routes.json');
const extraRoutes = JSON.parse(fs.readFileSync(extraRoutesPath, 'utf-8'));

function normalizePath(value) {
  if (!value || value === '/') return '/';
  const pathWithLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return pathWithLeadingSlash.replace(/\/+$/, '');
}

// Static routes
const staticRoutes = [
  '/',
  '/provincias',
  '/contacto',
  '/presupuesto-rapido',
  '/quienes-somos',
  '/plazos-de-entrega',
  '/enviar-archivos',
  '/formas-de-pago',
  '/tarifa-portes',
  '/precios',
  '/garantia-de-calidad',
  '/trabajos-realizados',
  '/marcas',
  '/condiciones-generales',
  '/politica-privacidad',
  '/cookies',
  '/aviso-legal'
];

// Function to generate sitemap XML
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const seenUrls = new Set();
  let count = 0;

  function addUrl(route, changeFrequency, priority) {
    const normalizedPath = normalizePath(route);
    const location = normalizedPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${normalizedPath}`;
    if (seenUrls.has(location)) return;

    seenUrls.add(location);
    count += 1;
    xml += '  <url>\n';
    xml += `    <loc>${location}</loc>\n`;
    xml += `    <changefreq>${changeFrequency}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  }

  staticRoutes.forEach(route => {
    addUrl(route, 'monthly', '0.8');
  });

  // Add category routes from SEO data
  seoData.forEach(item => {
    if (item.url) {
      addUrl(item.url, 'weekly', '0.9');
    }
  });

  extraRoutes.forEach(route => {
    addUrl(route, 'weekly', '0.9');
  });

  xml += '</urlset>';

  return { xml, count };
}

// Write sitemap to public directory
const { xml: sitemap, count } = generateSitemap();
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

console.log('Sitemap generated successfully at public/sitemap.xml');
console.log(`Total URLs: ${count}`);
