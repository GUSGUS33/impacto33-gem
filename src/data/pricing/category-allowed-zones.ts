/**
 * Configuración de zonas de impresión permitidas por categoría
 * 
 * Permite hacer overrides específicos para categorías que necesitan
 * configuraciones distintas a su familia.
 * 
 * Estructura:
 * - categorySlug: slug exacto de la categoría WooCommerce
 * - allowedZones: zonas de impresión permitidas
 * - allowedMethods: (opcional) override de métodos de impresión
 * 
 * Si una categoría NO está en esta lista, se usa la configuración de su familia.
 * 
 * TODO (Fase 2):
 * - Pantalones → 2 zonas (frontal, espalda)
 * - Tazas/bolis/USB → 1 zona (frontal)
 * - Otros overrides específicos según feedback de negocio
 */

import type { CategoryPrintingZonesConfig, PrintingMethodId } from '../../types/printing';

export const CATEGORY_ALLOWED_ZONES: CategoryPrintingZonesConfig[] = [
  /**
   * Camisetas estándar: 4 zonas
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia ropa)
   */
  {
    categorySlug: 'camisetas-personalizadas',
    allowedZones: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha']
    // allowedMethods no especificado → usa familia 'ropa'
  },

  /**
   * Polos: 4 zonas
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia ropa)
   */
  {
    categorySlug: 'polos-personalizados',
    allowedZones: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha']
  },

  /**
   * Sudaderas: 4 zonas
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia ropa)
   */
  {
    categorySlug: 'sudaderas-personalizadas',
    allowedZones: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha']
  },

  /**
   * Chaquetas: 4 zonas
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia ropa)
   */
  {
    categorySlug: 'chaquetas-personalizadas',
    allowedZones: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha']
  },

  /**
   * Bolsas: 2 zonas (frontal, espalda)
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia accesorios)
   */
  {
    categorySlug: 'bolsas-personalizadas',
    allowedZones: ['frontal', 'espalda']
  },

  /**
   * Gorras: 2 zonas (frontal, espalda)
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia accesorios)
   */
  {
    categorySlug: 'gorras-personalizadas',
    allowedZones: ['frontal', 'espalda']
  },

  /**
   * Llaveros: 1 zona (frontal)
   * Métodos: DTF, Serigrafía, Bordado (heredado de familia accesorios)
   */
  {
    categorySlug: 'llaveros-personalizados',
    allowedZones: ['frontal']
  },

  // TODO (Fase 2): Añadir categorías de rígidos (tazas, bolis, USB, etc.)
  // Cuando se activen DTF_UV y Tampografía
];

/**
 * Obtener configuración de zonas para una categoría
 * 
 * @param categorySlug - Slug de la categoría
 * @returns Configuración de zonas o null si no existe override
 */
export function getCategoryZonesConfig(categorySlug: string): CategoryPrintingZonesConfig | null {
  return CATEGORY_ALLOWED_ZONES.find(config => config.categorySlug === categorySlug) || null;
}

/**
 * Obtener zonas permitidas para una categoría
 * 
 * @param categorySlug - Slug de la categoría
 * @returns Array de zonas permitidas o null si no existe
 */
export function getAllowedZonesForCategory(categorySlug: string): string[] | null {
  const config = getCategoryZonesConfig(categorySlug);
  return config ? config.allowedZones : null;
}

/**
 * Obtener métodos permitidos (override) para una categoría
 * 
 * @param categorySlug - Slug de la categoría
 * @returns Array de métodos o null si no existe override
 */
export function getAllowedMethodsOverrideForCategory(categorySlug: string): PrintingMethodId[] | null {
  const config = getCategoryZonesConfig(categorySlug);
  return config?.allowedMethods || null;
}

/**
 * Verificar si una categoría tiene override de zonas
 * 
 * @param categorySlug - Slug de la categoría
 * @returns true si existe override específico
 */
export function hasZonesOverride(categorySlug: string): boolean {
  return getCategoryZonesConfig(categorySlug) !== null;
}
