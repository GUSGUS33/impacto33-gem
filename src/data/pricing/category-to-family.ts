/**
 * Mapeo de categorías WooCommerce → Familias de Precios
 * 
 * Agrupa las 236+ categorías de WooCommerce en familias lógicas para precios.
 * Fuente única de verdad: slugs de all_categories_full.json
 * 
 * En esta fase (1.2), mapeamos las categorías principales del MVP.
 * El resto usa fallback a 'otros'.
 */

export type PricingFamilyId = 'ropa' | 'accesorios' | 'hogar' | 'papeleria' | 'otros';

export const CATEGORY_TO_FAMILY_MAPPING: Record<string, PricingFamilyId> = {
  // ============================================
  // FAMILIA: ROPA
  // ============================================
  // Camisetas
  't_shirts': 'ropa',
  'cam': 'ropa',
  'cam_w': 'ropa',
  'cat': 'ropa',
  'camisetas-manga-corta': 'ropa',
  'sp_tshi': 'ropa',
  'industrytshirts': 'ropa',
  'serviciostshirts': 'ropa',
  'highvistshirts': 'ropa',

  // Polos
  'pol_s': 'ropa',
  'pol_l': 'ropa',

  // Sudaderas
  'swe': 'ropa',
  'hoodies': 'ropa',

  // Chaquetas
  'cha': 'ropa',
  'chuba': 'ropa',
  'coats': 'ropa',
  'w_coats': 'ropa',
  'subcoats': 'ropa',
  'raincoats': 'ropa',
  'windbreak': 'ropa',
  // Pantalones
  'pan': 'ropa',
  'trousers': 'ropa',

  // Monos
  'mono': 'ropa',

  // Chándals
  'chnd': 'ropa',

  // Vestuario laboral
  'servicioschalecos': 'ropa',
  'highvischalecos': 'ropa',
  'sanitarybata': 'ropa',
  'foodindustrybata': 'ropa',
  'horecachaqueta': 'ropa',
  'horecacamisas': 'ropa',
  'horecadelantal': 'ropa',
  'sanitarycasaca': 'ropa',
  'sanitarygorro': 'ropa',
  'foodindustrygorro': 'ropa',
  'industryjackets': 'ropa',
  'servicioschaqutas': 'ropa',
  'highvischaquetas': 'ropa',

  // ============================================
  // FAMILIA: ACCESORIOS
  // ============================================
  // Bolsas
  'bags': 'accesorios',
  'sub_bags': 'accesorios',
  'drawstring_bag': 'accesorios',
  'bags_coolers': 'accesorios',
  'bags_travel': 'accesorios',
  'waterproof_dry_bags': 'accesorios',
  'summer_cooler_bags': 'accesorios',

  // Mochilas
  'subbackpacks': 'accesorios',
  'backpacks': 'accesorios',

  // Gorras / Sombreros
  'gor': 'accesorios',
  'hats': 'accesorios',
  'travel_caps': 'accesorios',
  'christmas_hats': 'accesorios',

  // Guantes / Accesorios de frío
  'gloves': 'accesorios',
  'neckwarmer': 'accesorios',

  // Accesorios viaje
  'travel_accessories': 'accesorios',
  'travel_adaptors': 'accesorios',
  'sunglasses': 'accesorios',
  'subsunglasses': 'accesorios',
  'sunglasses_pouches': 'accesorios',

  // Accesorios tecnológicos
  'tech_accessories': 'accesorios',
  'wireless_charger': 'accesorios',
  'car_charger': 'accesorios',
  'chargers': 'accesorios',
  'earphones': 'accesorios',
  'headphones': 'accesorios',
  'speakers': 'accesorios',
  'mouse_pad': 'accesorios',

  // Otros accesorios
  'acc': 'accesorios',
  'sport_accessories': 'accesorios',
  'acc_outdoor': 'accesorios',
  'take_away': 'accesorios',

  // ============================================
  // FAMILIA: HOGAR
  // ============================================
  // Tazas / Mugs
  'mugs': 'hogar',
  'submugs': 'hogar',
  'cup_warmer': 'hogar',

  // Botellas / Termos
  'bottles': 'hogar',
  'bottles_thermos_flas': 'hogar',
  'glass_bottles': 'hogar',
  'thermos_flasks': 'hogar',
  'sports_bottles': 'hogar',

  // Hogar general
  'home_gifts': 'hogar',
  'kitchen': 'hogar',
  'home_cocktail': 'hogar',
  'decoration': 'hogar',
  'decoration_games': 'hogar',
  'decorations': 'hogar',

  // Mascotas
  'pets_accessories': 'accesorios',

  // ============================================
  // FAMILIA: PAPELERÍA
  // ============================================
  // Bolígrafos
  'ball_pens': 'papeleria',

  // Libretas / Cuadernos
  'notebooks': 'papeleria',
  'pencil_cases': 'papeleria',

  // Agendas / Calendarios
  'diaries_calendars': 'papeleria',

  // Escritura general
  'writing': 'papeleria',
  'writing_office': 'papeleria',

  // ============================================
  // FALLBACK
  // ============================================
  'default': 'otros'
};

/**
 * Obtener familia de precios para una categoría WooCommerce
 * @param categorySlug - Slug de categoría de WooCommerce
 * @returns ID de familia de precios
 */
export const getPricingFamilyFromCategory = (categorySlug: string): PricingFamilyId => {
  if (!categorySlug) {
    return 'otros';
  }

  return CATEGORY_TO_FAMILY_MAPPING[categorySlug] || CATEGORY_TO_FAMILY_MAPPING['default'];
};

/**
 * Obtener todas las categorías de una familia
 * @param familyId - ID de familia
 * @returns Array de slugs de categorías
 */
export const getCategoriesInFamily = (familyId: PricingFamilyId): string[] => {
  return Object.entries(CATEGORY_TO_FAMILY_MAPPING)
    .filter(([_, family]) => family === familyId)
    .map(([slug, _]) => slug)
    .filter(slug => slug !== 'default');
};
