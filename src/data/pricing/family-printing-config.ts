/**
 * Configuración de métodos de impresión permitidos por familia de producto
 * 
 * Define:
 * - Métodos disponibles para cada familia
 * - Métodos activos en la UI (subset de métodos disponibles)
 * - Cantidades mínimas por método
 * 
 * Esta configuración sirve como:
 * 1. Default/fallback cuando una categoría no tiene override específico
 * 2. Fuente de verdad de negocio para armonizar con CATEGORY_ALLOWED_METHODS
 * 3. Base para activar/desactivar métodos en Fase 2 sin cambiar código
 */

import type { FamilyPrintingConfig, PricingFamilyId } from '../../types/printing';

export const FAMILY_PRINTING_CONFIG: Record<PricingFamilyId, FamilyPrintingConfig> = {
  /**
   * TEXTIL: Ropa (camisetas, polos, sudaderas, chaquetas, etc.)
   * 
   * Métodos: DTF, Serigrafía 1 color, Bordado
   * Activo en UI: Solo DTF (Fase 1.2)
   * 
   * Mínimos:
   * - DTF: 25 uds (tiradas pequeñas-medias)
   * - Serigrafía: 50 uds (tiradas medias)
   * - Bordado: 25 uds (tiradas pequeñas-medias)
   */
  ropa: {
    methods: ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO'],
    activeInUI: ['DTF'],
    minQtyByMethod: {
      DTF: 25,
      SERIGRAFIA_1_COLOR: 50,
      BORDADO: 25
    }
  },

  /**
   * TEXTIL: Accesorios (bolsas, mochilas, gorras, llaveros, etc.)
   * 
   * Métodos: DTF, Serigrafía 1 color, Bordado
   * Activo en UI: Solo DTF (Fase 1.2)
   * 
   * Mínimos:
   * - DTF: 50 uds (tiradas medias)
   * - Serigrafía: 100 uds (tiradas grandes)
   * - Bordado: 50 uds (tiradas medias)
   */
  accesorios: {
    methods: ['DTF', 'SERIGRAFIA_1_COLOR', 'BORDADO'],
    activeInUI: ['DTF'],
    minQtyByMethod: {
      DTF: 50,
      SERIGRAFIA_1_COLOR: 100,
      BORDADO: 50
    }
  },

  /**
   * RÍGIDO: Hogar (tazas, botellas, decoración, etc.)
   * 
   * Métodos: DTF UV, Tampografía 1 color
   * Activo en UI: Ninguno (Fase 2)
   * 
   * Mínimos:
   * - DTF UV: 20 uds (tiradas pequeñas)
   * - Tampografía: 100 uds (tiradas medianas)
   */
  hogar: {
    methods: ['DTF_UV', 'TAMPO_1_COLOR'],
    activeInUI: [],
    minQtyByMethod: {
      DTF_UV: 20,
      TAMPO_1_COLOR: 100
    }
  },

  /**
   * RÍGIDO: Papelería (bolígrafos, libretas, agendas, USB, etc.)
   * 
   * Métodos: DTF UV, Tampografía 1 color
   * Activo en UI: Ninguno (Fase 2)
   * 
   * Mínimos:
   * - DTF UV: 100 uds (tiradas medianas)
   * - Tampografía: 250 uds (tiradas grandes)
   */
  papeleria: {
    methods: ['DTF_UV', 'TAMPO_1_COLOR'],
    activeInUI: [],
    minQtyByMethod: {
      DTF_UV: 100,
      TAMPO_1_COLOR: 250
    }
  },

  /**
   * FALLBACK: Otros productos
   * 
   * Métodos: DTF (salvavidas genérico)
   * Activo en UI: DTF
   * 
   * Mínimos:
   * - DTF: 10 uds (tiradas muy pequeñas)
   */
  otros: {
    methods: ['DTF'],
    activeInUI: ['DTF'],
    minQtyByMethod: {
      DTF: 10
    }
  }
};

/**
 * Obtener configuración de métodos para una familia
 * 
 * @param familyId - ID de la familia
 * @returns Configuración de la familia o fallback a 'otros'
 */
export function getFamilyPrintingConfig(familyId: PricingFamilyId): FamilyPrintingConfig {
  return FAMILY_PRINTING_CONFIG[familyId] || FAMILY_PRINTING_CONFIG.otros;
}

/**
 * Obtener cantidad mínima para un método en una familia
 * 
 * @param familyId - ID de la familia
 * @param methodId - ID del método
 * @returns Cantidad mínima o 1 si no existe
 */
export function getMinQtyForMethod(familyId: PricingFamilyId, methodId: string): number {
  const config = getFamilyPrintingConfig(familyId);
  const minQty = config.minQtyByMethod[methodId as keyof typeof config.minQtyByMethod];
  return minQty || 1;
}

/**
 * Verificar si un método está activo en la UI para una familia
 * 
 * @param familyId - ID de la familia
 * @param methodId - ID del método
 * @returns true si el método está activo en la UI
 */
export function isMethodActiveInUI(familyId: PricingFamilyId, methodId: string): boolean {
  const config = getFamilyPrintingConfig(familyId);
  return config.activeInUI.some(method => method === methodId);
}

/**
 * Obtener métodos permitidos (disponibles) para una familia
 * 
 * @param familyId - ID de la familia
 * @returns Array de métodos permitidos
 */
export function getAllowedMethodsForFamily(familyId: PricingFamilyId): string[] {
  const config = getFamilyPrintingConfig(familyId);
  return config.methods as string[];
}

/**
 * Obtener métodos activos en la UI para una familia
 * 
 * @param familyId - ID de la familia
 * @returns Array de métodos activos en la UI
 */
export function getActiveMethodsInUI(familyId: PricingFamilyId): string[] {
  const config = getFamilyPrintingConfig(familyId);
  return config.activeInUI as string[];
}
