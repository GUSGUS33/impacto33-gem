import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of the website
const BASE_URL = 'https://impacto33.com';

// Load SEO data
const seoDataPath = path.join(__dirname, 'client/src/data/seo-sitemap.json');
const seoData = JSON.parse(fs.readFileSync(seoDataPath, 'utf-8'));

// Static routes
const staticRoutes = [
  '/',
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

  // Add static routes
  staticRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  // Add category routes from SEO data
  seoData.forEach(item => {
    if (item.url) {
      // Ensure URL starts with / and doesn't end with / if it's already in the base URL logic (optional, but good for consistency)
      // Here we assume item.url comes as "/category/" or "/category/subcategory/"
      const url = item.url.startsWith('/') ? item.url : `/${item.url}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${url}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    }
  });

  // Note: Product URLs would typically be fetched from an API or database here
  // For this MVP static generator, we are only including categories and static pages
  // In a real scenario, you would fetch all products and add them:
  /*
  const products = await fetchProducts();
  products.forEach(product => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/producto/${product.slug}</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
  });
  */

  xml += '</urlset>';

  return xml;
}

// Write sitemap to public directory
const sitemap = generateSitemap();
const publicDir = path.join(__dirname, 'client/public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

console.log('Sitemap generated successfully at client/public/sitemap.xml');
console.log(`Total URLs: ${staticRoutes.length + seoData.length}`);
