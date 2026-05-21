/**
 * Catálogo de métodos de impresión disponibles
 * 
 * Define todos los métodos de impresión que IMPACTO33 ofrece.
 * En esta fase (1.2), solo DTF está activo en la UI.
 * Serigrafía 1 color y Sin impresión están definidos pero inactivos.
 */

import type { PrintingMethodConfig, PrintingMethodId } from '../../types/printing';

export const PRINTING_METHODS: Record<PrintingMethodId, PrintingMethodConfig> = {
  /**
   * DTF (Direct-to-Film)
   * Impresión digital a todo color, ideal para diseños complejos
   */
  DTF: {
    id: 'DTF',
    label: 'DTF Full Color',
    description: 'Impresión digital a todo color, ideal para logos con muchos detalles y gradientes.',
    pricingType: 'FLAT_PER_ZONE',
    isActive: true,
    notes: 'Método principal en Fase 1.2. Reutiliza la fórmula actual de precios.'
  },

  /**
   * SERIGRAFIA_1_COLOR
   * Serigrafía clásica, óptima para pedidos medianos/grandes con 1 color
   */
  SERIGRAFIA_1_COLOR: {
    id: 'SERIGRAFIA_1_COLOR',
    label: 'Serigrafía 1 color',
    description: 'Serigrafía clásica, óptima para pedidos medios/grandes con diseños de 1 color.',
    pricingType: 'COLOR_COUNT',
    isActive: false,
    notes: 'Inactivo en Fase 1.2. Fórmula de precios pendiente de definir.'
  },

  /**
   * BORDADO
   * Bordado textil, óptima para prendas premium
   */
  BORDADO: {
    id: 'BORDADO',
    label: 'Bordado Textil',
    description: 'Bordado textil, ideal para prendas premium y acabados duraderos.',
    pricingType: 'FLAT_PER_ZONE',
    isActive: false,
    notes: 'Inactivo en Fase 1.2. Disponible para textil (ropa, accesorios).'
  },

  /**
   * DTF_UV
   * DTF con curado UV, para superficies rígidas
   */
  DTF_UV: {
    id: 'DTF_UV',
    label: 'DTF UV',
    description: 'Impresión DTF con curado UV, ideal para productos rígidos (tazas, botellas, etc.).',
    pricingType: 'FLAT_PER_ZONE',
    isActive: false,
    notes: 'Inactivo en Fase 1.2. Disponible para rígidos (hogar, papelería).'
  },

  /**
   * TAMPO_1_COLOR
   * Tampografía, óptima para volúmenes grandes en rígidos
   */
  TAMPO_1_COLOR: {
    id: 'TAMPO_1_COLOR',
    label: 'Tampografía 1 color',
    description: 'Tampografía clásica, óptima para volúmenes grandes en productos rígidos.',
    pricingType: 'COLOR_COUNT',
    isActive: false,
    notes: 'Inactivo en Fase 1.2. Disponible para rígidos (hogar, papelería).'
  },

  /**
   * SIN_IMPRESION
   * Solo la prenda, sin personalización
   */
  SIN_IMPRESION: {
    id: 'SIN_IMPRESION',
    label: 'Solo prenda, sin impresión',
    description: 'Solo la prenda sin personalización.',
    pricingType: 'FLAT_PER_ZONE',
    isActive: false,
    notes: 'Inactivo en Fase 1.2. Fórmula de precios pendiente de definir.'
  }
};

/**
 * Obtener método de impresión por ID
 */
export const getPrintingMethod = (methodId: PrintingMethodId): PrintingMethodConfig | null => {
  return PRINTING_METHODS[methodId] || null;
};

/**
 * Obtener lista de métodos activos (visibles en UI)
 */
export const getActivePrintingMethods = (): PrintingMethodConfig[] => {
  return Object.values(PRINTING_METHODS).filter(method => method.isActive);
};

/**
 * Obtener lista de todos los métodos (incluyendo inactivos)
 */
export const getAllPrintingMethods = (): PrintingMethodConfig[] => {
  return Object.values(PRINTING_METHODS);
};

/**
 * Verificar si un método está activo
 */
export const isPrintingMethodActive = (methodId: PrintingMethodId): boolean => {
  const method = PRINTING_METHODS[methodId];
  return method ? method.isActive : false;
};
