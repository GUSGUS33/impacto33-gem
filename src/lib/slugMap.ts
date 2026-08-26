import seoSitemap from '../data/seo-sitemap.json';

export const wooToTransactional: Record<string, string> = {
  t_shirts: '/camisetas-personalizadas/',
  cam: '/camisetas-personalizadas/',
  cam_w: '/camisetas-personalizadas/',
  cat: '/camisetas-personalizadas/',
  sp_tshi: '/camisetas-personalizadas/camiseta-deporte/',
  pol_s: '/polos-personalizados/',
  cam_po: '/polos-personalizados/',
  cam_sp: '/polos-personalizados/polo-deportivo/',
  sp_polshi: '/polos-personalizados/polo-deportivo/',
  bags: '/bolsas-personalizadas/',
  bags_travel_backpack: '/mochilas-personalizadas/',
  bags_travel: '/mochilas-personalizadas/',
  coats: '/chaquetas-personalizadas/',
  raincoats: '/chaquetas-personalizadas/',
  tech_accessories: '/tecnologia-personalizada/',
  speakers: '/tecnologia-personalizada/',
  writing_office: '/escritura-personalizada/',
  kitchen: '/hogar-personalizado/',
  lanyards_badge_holde: '/eventos-personalizados/',
  towels_sarong: '/verano-personalizado/',
  sweatshirts: '/sudaderas-personalizadas/',
  sudaderas: '/sudaderas-personalizadas/',
  mugs: '/tazas-personalizadas/',
  bottles_thermos_flas: '/botellas-personalizadas/',
  bottles: '/botellas-personalizadas/',
  glass_bottles: '/botellas-personalizadas/',
  thermos_flasks: '/botellas-personalizadas/',
  highviz: '/ropa-laboral-personalizada/ropa-alta-visibilidad/',
  industry_services: '/ropa-laboral-personalizada/ropa-industria/',
  sanitarybata: '/ropa-laboral-personalizada/ropa-sanidad/',
  horeca: '/ropa-laboral-personalizada/ropa-hosteleria/',
  travel_accessories: '/accesorios-viaje/',
};

export const transactionalTitles: Record<string, string> = {
  '/camisetas-personalizadas/': 'Camisetas personalizadas',
  '/camisetas-personalizadas/camisetas-manga-larga/': 'Camisetas manga larga',
  '/camisetas-personalizadas/camisetas-manga-corta/': 'Camisetas manga corta',
  '/camisetas-personalizadas/camisetas-tirantes/': 'Camisetas de tirantes',
  '/camisetas-personalizadas/camisetas-deporte/': 'Camisetas de deporte',
  '/camisetas-personalizadas/camisetas-ecologicas/': 'Camisetas ecológicas',
  '/polos-personalizados/': 'Polos personalizados',
  '/polos-personalizados/polo-deportivo/': 'Polos deportivos',
  '/bolsas-personalizadas/': 'Bolsas personalizadas',
  '/mochilas-personalizadas/': 'Mochilas personalizadas',
  '/chaquetas-personalizadas/': 'Chaquetas personalizadas',
  '/tecnologia-personalizada/': 'Tecnología personalizada',
  '/escritura-personalizada/': 'Escritura personalizada',
  '/hogar-personalizado/': 'Hogar personalizado',
  '/eventos-personalizados/': 'Eventos personalizados',
  '/verano-personalizado/': 'Verano personalizado',
  '/sudaderas-personalizadas/': 'Sudaderas personalizadas',
  '/tazas-personalizadas/': 'Tazas personalizadas',
  '/botellas-personalizadas/': 'Botellas personalizadas',
  '/ropa-laboral-personalizada/': 'Ropa laboral personalizada',
  '/ropa-laboral-personalizada/ropa-alta-visibilidad/': 'Ropa de alta visibilidad',
  '/ropa-laboral-personalizada/ropa-industria/': 'Ropa de industria',
  '/ropa-laboral-personalizada/ropa-sanidad/': 'Ropa de sanidad',
  '/ropa-laboral-personalizada/ropa-hosteleria/': 'Ropa de hostelería',
  '/accesorios-viaje/': 'Accesorios de viaje',
};

export const productCategoryOverrides: Record<string, string> = {
  'body-de-bebe-de-manga-larga-96-algodon-personalizable': '/camisetas-personalizadas/camisetas-manga-larga/',
};

export function sanitizeBreadcrumbUrl(url?: string | null): string {
  if (!url) return "/";
  // Si viene URL absoluta, extraer pathname
  let clean = url.replace(/^https?:\/\/[^\/]+/, "");
  // Eliminar prefijos de taxonomías nativas de WooCommerce
  clean = clean.replace(/^\/(?:categoria-producto|product-category|categoria|product_cat)\//i, "/");
  
  const trimmed = clean.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "/";

  // Si coincide directamente con una clave de WooCommerce en el mapa
  if (wooToTransactional[trimmed]) {
    return wooToTransactional[trimmed];
  }

  // Asegurar formato con trailing slash para consistencia transaccional
  return `/${trimmed}/`;
}

export function getTransactionalUrl(wooSlug: string): string {
  if (!wooSlug) return '#';
  const clean = wooSlug.replace(/^\/(?:categoria-producto|product-category|categoria|product_cat)\//i, '').replace(/^\/+|\/+$/g, '');
  return wooToTransactional[clean] ?? `/${clean}/`;
}

export interface CategoryNode {
  id?: string;
  name?: string;
  slug?: string;
}

export interface BreadcrumbInfo {
  label: string;
  url: string;
}

/**
 * Dada una lista de categorías de WooCommerce de un producto,
 * devuelve la mejor categoría transaccional mapeada para los breadcrumbs.
 */
export function getCategoryBreadcrumbForProduct(
  categories?: CategoryNode[] | null
): BreadcrumbInfo | null {
  if (!categories || categories.length === 0) return null;

  for (const cat of categories) {
    if (!cat.slug) continue;
    const mappedUrl = wooToTransactional[cat.slug];
    if (mappedUrl) {
      const label = transactionalTitles[mappedUrl] || cat.name || 'Categoría';
      return { label, url: mappedUrl };
    }
  }

  const first = categories[0];
  if (first?.name && first?.slug) {
    const fallbackUrl = `/${first.slug}/`;
    return {
      label: first.name,
      url: transactionalTitles[fallbackUrl] || fallbackUrl,
    };
  }

  return null;
}

/**
 * Devuelve la cadena completa de breadcrumbs (Madre > Hija) para un producto.
 */
export function getProductBreadcrumbChain(params: {
  productSlug?: string;
  productName?: string;
  categories?: CategoryNode[] | null;
}): BreadcrumbInfo[] {
  const { productSlug, productName, categories } = params;

  let targetCategoryUrl: string | null = null;

  // 1. Override específico por producto
  if (productSlug && productCategoryOverrides[productSlug]) {
    targetCategoryUrl = productCategoryOverrides[productSlug];
  }

  // 2. Coincidencia por palabras clave si no hay override
  if (!targetCategoryUrl) {
    const textToSearch = `${productSlug || ''} ${productName || ''}`.toLowerCase();

    // Ropa laboral y especialidades
    if (textToSearch.includes('alta visibilidad') || textToSearch.includes('reflectante')) {
      targetCategoryUrl = '/ropa-laboral-personalizada/ropa-alta-visibilidad/';
    } else if (textToSearch.includes('sanitario') || textToSearch.includes('bata médica') || textToSearch.includes('pijama sanitario')) {
      targetCategoryUrl = '/ropa-laboral-personalizada/ropa-sanidad/';
    } else if (textToSearch.includes('delantal') || textToSearch.includes('hostelería') || textToSearch.includes('hosteleria')) {
      targetCategoryUrl = '/ropa-laboral-personalizada/ropa-hosteleria/';
    } 
    // Polos
    else if (textToSearch.includes('polo')) {
      if (textToSearch.includes('deport') || textToSearch.includes('tecnic')) {
        targetCategoryUrl = '/polos-personalizados/polo-deportivo/';
      } else {
        targetCategoryUrl = '/polos-personalizados/';
      }
    } 
    // Sudaderas
    else if (textToSearch.includes('sudadera') || textToSearch.includes('hoodie')) {
      targetCategoryUrl = '/sudaderas-personalizadas/';
    } 
    // Mochilas y Bolsas
    else if (textToSearch.includes('mochila')) {
      targetCategoryUrl = '/mochilas-personalizadas/';
    } else if (textToSearch.includes('bolsa') || textToSearch.includes('tote')) {
      targetCategoryUrl = '/bolsas-personalizadas/';
    } 
    // Tazas y Botellas
    else if (textToSearch.includes('taza') || textToSearch.includes('mug')) {
      targetCategoryUrl = '/tazas-personalizadas/';
    } else if (textToSearch.includes('botella') || textToSearch.includes('termo') || textToSearch.includes('bidon')) {
      targetCategoryUrl = '/botellas-personalizadas/';
    } 
    // Chaquetas
    else if (textToSearch.includes('chaqueta') || textToSearch.includes('parka') || textToSearch.includes('softshell') || textToSearch.includes('cazadora')) {
      targetCategoryUrl = '/chaquetas-personalizadas/';
    } 
    // Camisetas por tipo
    else if (textToSearch.includes('manga larga') || textToSearch.includes('manga-larga') || textToSearch.includes('body')) {
      targetCategoryUrl = '/camisetas-personalizadas/camisetas-manga-larga/';
    } else if (textToSearch.includes('manga corta') || textToSearch.includes('manga-corta')) {
      targetCategoryUrl = '/camisetas-personalizadas/camisetas-manga-corta/';
    } else if (textToSearch.includes('tirantes')) {
      targetCategoryUrl = '/camisetas-personalizadas/camisetas-tirantes/';
    } else if (textToSearch.includes('ecologic') || textToSearch.includes('orgánic') || textToSearch.includes('organic')) {
      targetCategoryUrl = '/camisetas-personalizadas/camisetas-ecologicas/';
    } else if (textToSearch.includes('deporte') || textToSearch.includes('tecnica') || textToSearch.includes('técnica')) {
      targetCategoryUrl = '/camisetas-personalizadas/camisetas-deporte/';
    }
  }

  // 3. Mapeo estándar de WooCommerce
  if (!targetCategoryUrl && categories && categories.length > 0) {
    const mapped = getCategoryBreadcrumbForProduct(categories);
    if (mapped) {
      targetCategoryUrl = mapped.url;
    }
  }

  if (!targetCategoryUrl) return [];

  // 4. Construcción de jerarquía usando seo-sitemap.json
  const chain: BreadcrumbInfo[] = [];
  const normalizedTarget = targetCategoryUrl.endsWith('/') ? targetCategoryUrl : `${targetCategoryUrl}/`;

  const targetEntry = (seoSitemap as Array<any>).find(
    (item) => item.url === normalizedTarget || item.url === targetCategoryUrl
  );

  if (targetEntry) {
    if (targetEntry.parent) {
      const parentEntry = (seoSitemap as Array<any>).find(
        (item) => item.url === targetEntry.parent || item.url === `${targetEntry.parent}/`
      );
      if (parentEntry) {
        chain.push({
          label: parentEntry.anchor || transactionalTitles[parentEntry.url] || 'Categoría',
          url: parentEntry.url,
        });
      }
    }
    chain.push({
      label: targetEntry.anchor || transactionalTitles[targetEntry.url] || 'Subcategoría',
      url: targetEntry.url,
    });
  } else {
    chain.push({
      label: transactionalTitles[normalizedTarget] || 'Categoría',
      url: normalizedTarget,
    });
  }

  return chain;
}


