import { MetadataRoute } from 'next';
import { PENINSULAR_PROVINCES } from '@/data/provincias';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://impacto33.com';

  const staticRoutes = [
    '',
    '/provincias',
    '/contacto',
    '/presupuesto-rapido',
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

  const provinceRoutes = PENINSULAR_PROVINCES.map((p) => `/${p.slug}`);

  const sitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  })) as MetadataRoute.Sitemap;

  const provinceEntries = provinceRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) as MetadataRoute.Sitemap;

  return [
    ...sitemapEntries,
    ...provinceEntries,
  ];
}
