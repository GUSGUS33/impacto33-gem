import { MetadataRoute } from 'next';
import { PENINSULAR_PROVINCES } from '@/data/provincias';
import seoSitemap from '@/data/seo-sitemap.json';
import extraRoutes from '@/data/sitemap-extra-routes.json';
import excludedRoutes from '@/data/sitemap-excluded-routes.json';

const BASE_URL = 'https://impacto33.com';

function normalizePath(value: string): string {
  if (!value || value === '/') return '';
  const pathWithLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return pathWithLeadingSlash.replace(/\/+$/, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const excludedRouteSet = new Set(excludedRoutes.map(normalizePath));
  const staticRoutes = [
    '',
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
    '/aviso-legal',
    '/camisetas-personalizadas',
    '/polos-personalizados',
    '/sudaderas-personalizadas',
    '/chaquetas-personalizadas',
    '/pantalones-personalizados',
    '/monos-personalizados',
    '/vestuario-laboral',
    '/mochilas-personalizadas',
    '/bolsas-personalizadas',
    '/accesorios-viaje',
    '/papeleria-personalizada',
    '/escritura-personalizada',
    '/tecnologia-personalizada',
    '/hogar-personalizado',
    '/merchandising-eventos',
    '/verano-personalizado',
    '/mascotas-personalizadas',
    '/deporte-personalizado'
  ];

  const categoryRoutes = seoSitemap
    .map((entry) => entry.url)
    .filter((route): route is string => Boolean(route))
    .concat(extraRoutes);
  const provinceRoutes = PENINSULAR_PROVINCES.map((province) => `/${province.slug}`);
  const routes = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const route of staticRoutes) {
    const normalizedPath = normalizePath(route);
    if (excludedRouteSet.has(normalizedPath)) continue;
    routes.set(normalizedPath, {
      url: `${BASE_URL}${normalizedPath}`,
      changeFrequency: normalizedPath === '' ? 'daily' : 'monthly',
      priority: normalizedPath === '' ? 1 : 0.8,
    });
  }

  for (const route of categoryRoutes) {
    const normalizedPath = normalizePath(route);
    if (excludedRouteSet.has(normalizedPath)) continue;
    if (!routes.has(normalizedPath)) {
      routes.set(normalizedPath, {
        url: `${BASE_URL}${normalizedPath}`,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  for (const route of provinceRoutes) {
    const normalizedPath = normalizePath(route);
    if (excludedRouteSet.has(normalizedPath)) continue;
    if (!routes.has(normalizedPath)) {
      routes.set(normalizedPath, {
        url: `${BASE_URL}${normalizedPath}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return [...routes.values()];
}
