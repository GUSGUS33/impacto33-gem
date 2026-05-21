import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://impacto33.com';

  const staticRoutes = [
    '',
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

  const sitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  })) as MetadataRoute.Sitemap;

  // Si tienes una base de datos o API, podrías añadir los productos dinámicamente aquí
  // Ejemplo:
  // const products = await getProducts();
  // const productEntries = products.map((product) => ({
  //   url: `${baseUrl}/producto/${product.slug}`,
  //   lastModified: product.updatedAt,
  //   changeFrequency: 'weekly',
  //   priority: 0.6,
  // }));

  return [
    ...sitemapEntries,
    // ...productEntries
  ];
}
