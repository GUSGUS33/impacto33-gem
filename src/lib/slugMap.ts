export const wooToTransactional: Record<string, string> = {
  t_shirts: '/camisetas-personalizadas',
  pol_s: '/polos-personalizados',
  bags: '/bolsas-personalizadas',
  bags_travel_backpack: '/mochilas-personalizadas',
  coats: '/chaquetas-personalizadas',
  tech_accessories: '/tecnologia-personalizada',
  writing_office: '/escritura-personalizada',
  kitchen: '/hogar-personalizado',
  lanyards_badge_holde: '/eventos-personalizados',
  towels_sarong: '/verano-personalizado',
  sweatshirts: '/sudaderas-personalizadas',
  bags_travel: '/accesorios-viaje',
  bottles_thermos_flas: '/botellas-personalizadas',
  sp_tshi: '/camisetas-personalizadas/camiseta-deporte',
  sp_polshi: '/polos-personalizados/polo-deportivo',
};

export function getTransactionalUrl(wooSlug: string): string {
  if (!wooSlug) return '#';
  return wooToTransactional[wooSlug] ?? `/${wooSlug}`;
}
