/**
 * Mapeo de categorías WooCommerce → Métodos de impresión permitidos
 * 
 * Define qué técnicas de impresión se pueden usar para cada categoría.
 * En esta fase (1.2), solo DTF está activo, pero la estructura permite
 * activar nuevos métodos sin cambiar el código.
 */

import type { PrintingMethodId } from '../../types/printing';

export const CATEGORY_ALLOWED_METHODS: Record<string, PrintingMethodId[]> = {
  // ============================================
  // TEST - Todos los métodos disponibles
  // ============================================
  'test': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'DTF_UV', 'TAMPO_1_COLOR', 'SIN_IMPRESION'],

  // ============================================
  // ROPA - Textil
  // ============================================
  't_shirts': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'SIN_IMPRESION'],
  'cam': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'SIN_IMPRESION'],
  'cam_w': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'SIN_IMPRESION'],
  'cat': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'SIN_IMPRESION'],
  'camisetas-manga-corta': ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO', 'SIN_IMPRESION'],
  'sp_tshi': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'industrytshirts': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'serviciostshirts': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'highvistshirts': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  'pol_s': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'pol_l': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  'swe': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'hoodies': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  'cha': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'chuba': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'coats': ['DTF', 'SIN_IMPRESION'],
  'w_coats': ['DTF', 'SIN_IMPRESION'],
  'subcoats': ['DTF', 'SIN_IMPRESION'],
  'raincoats': ['DTF', 'SIN_IMPRESION'],
  'windbreak': ['DTF', 'SIN_IMPRESION'],

  'pan': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'trousers': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  'mono': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'chnd': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  // Vestuario laboral
  'servicioschalecos': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'highvischalecos': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'sanitarybata': ['DTF', 'SIN_IMPRESION'],
  'foodindustrybata': ['DTF', 'SIN_IMPRESION'],
  'horecachaqueta': ['DTF', 'SIN_IMPRESION'],
  'horecacamisas': ['DTF', 'SIN_IMPRESION'],
  'horecadelantal': ['DTF', 'SIN_IMPRESION'],

  // ============================================
  // ACCESORIOS - Bolsas, mochilas, gorras, etc.
  // ============================================
  'bags': ['DTF', 'SIN_IMPRESION'],
  'sub_bags': ['DTF', 'SIN_IMPRESION'],
  'drawstring_bag': ['DTF', 'SIN_IMPRESION'],
  'bags_coolers': ['DTF', 'SIN_IMPRESION'],
  'bags_travel': ['DTF', 'SIN_IMPRESION'],
  'waterproof_dry_bags': ['DTF', 'SIN_IMPRESION'],
  'summer_cooler_bags': ['DTF', 'SIN_IMPRESION'],

  'subbackpacks': ['DTF', 'SIN_IMPRESION'],
  'backpacks': ['DTF', 'SIN_IMPRESION'],

  'gor': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'hats': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'travel_caps': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],
  'christmas_hats': ['DTF', 'SERIGRAFIA_1_COLOR', 'SIN_IMPRESION'],

  'gloves': ['DTF', 'SIN_IMPRESION'],
  'neckwarmer': ['DTF', 'SIN_IMPRESION'],

  'travel_accessories': ['DTF', 'SIN_IMPRESION'],
  'travel_adaptors': ['DTF', 'SIN_IMPRESION'],
  'sunglasses': ['DTF', 'SIN_IMPRESION'],
  'subsunglasses': ['DTF', 'SIN_IMPRESION'],

  'tech_accessories': ['DTF', 'SIN_IMPRESION'],
  'wireless_charger': ['DTF', 'SIN_IMPRESION'],
  'car_charger': ['DTF', 'SIN_IMPRESION'],
  'chargers': ['DTF', 'SIN_IMPRESION'],
  'earphones': ['DTF', 'SIN_IMPRESION'],
  'headphones': ['DTF', 'SIN_IMPRESION'],
  'speakers': ['DTF', 'SIN_IMPRESION'],
  'mouse_pad': ['DTF', 'SIN_IMPRESION'],

  'acc': ['DTF', 'SIN_IMPRESION'],
  'accessories_travel': ['DTF', 'SIN_IMPRESION'],
  'sport_accessories': ['DTF', 'SIN_IMPRESION'],
  'acc_outdoor': ['DTF', 'SIN_IMPRESION'],
  'take_away': ['DTF', 'SIN_IMPRESION'],
  'pets_accessories': ['DTF', 'SIN_IMPRESION'],

  // ============================================
  // HOGAR - Tazas, botellas, decoración
  // ============================================
  'mugs': ['DTF', 'SIN_IMPRESION'],
  'submugs': ['DTF', 'SIN_IMPRESION'],
  'cup_warmer': ['DTF', 'SIN_IMPRESION'],

  'bottles': ['DTF', 'SIN_IMPRESION'],
  'bottles_thermos_flas': ['DTF', 'SIN_IMPRESION'],
  'glass_bottles': ['DTF', 'SIN_IMPRESION'],
  'thermos_flasks': ['DTF', 'SIN_IMPRESION'],
  'sports_bottles': ['DTF', 'SIN_IMPRESION'],

  'home_gifts': ['DTF', 'SIN_IMPRESION'],
  'kitchen': ['DTF', 'SIN_IMPRESION'],
  'home_cocktail': ['DTF', 'SIN_IMPRESION'],
  'decoration': ['DTF', 'SIN_IMPRESION'],
  'decoration_games': ['DTF', 'SIN_IMPRESION'],
  'decorations': ['DTF', 'SIN_IMPRESION'],

  // ============================================
  // PAPELERÍA - Bolígrafos, libretas, etc.
  // ============================================
  'ball_pens': ['DTF', 'SIN_IMPRESION'],
  'notebooks': ['DTF', 'SIN_IMPRESION'],
  'pencil_cases': ['DTF', 'SIN_IMPRESION'],
  'diaries_calendars': ['DTF', 'SIN_IMPRESION'],
  'writing': ['DTF', 'SIN_IMPRESION'],
  'writing_office': ['DTF', 'SIN_IMPRESION'],

  // ============================================
  // FALLBACK - Categorías no mapeadas
  // ============================================
  'default': ['DTF', 'SIN_IMPRESION']
};

/**
 * Obtener métodos de impresión permitidos para una categoría
 * @param categorySlug - Slug de categoría WooCommerce
 * @returns Array de IDs de métodos permitidos
 */
export const getAllowedMethodsForCategory = (categorySlug: string): PrintingMethodId[] => {
  if (!categorySlug) {
    return CATEGORY_ALLOWED_METHODS['default'];
  }

  return CATEGORY_ALLOWED_METHODS[categorySlug] || CATEGORY_ALLOWED_METHODS['default'];
};

/**
 * Verificar si un método está permitido para una categoría
 * @param categorySlug - Slug de categoría WooCommerce
 * @param methodId - ID del método de impresión
 * @returns true si el método está permitido
 */
export const isMethodAllowedForCategory = (categorySlug: string, methodId: PrintingMethodId): boolean => {
  const allowed = getAllowedMethodsForCategory(categorySlug);
  return allowed.includes(methodId);
};
