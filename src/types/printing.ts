/**
 * Tipos para el sistema de métodos de impresión
 * 
 * Este archivo define las entidades base para modelar diferentes técnicas de impresión
 * (DTF, Serigrafía, Bordado, etc.) y sus configuraciones de precios.
 */

/**
 * ID único para cada método de impresión
 */
export type PrintingMethodId =
  | 'DTF'
  | 'SERIGRAFIA_1_COLOR'
  | 'BORDADO'
  | 'DTF_UV'
  | 'TAMPO_1_COLOR'
  | 'SIN_IMPRESION';

/**
 * Familias de productos para agrupar métodos de impresión permitidos
 */
export enum PricingFamilyId {
  ROPA = 'ropa',
  ACCESORIOS = 'accesorios',
  HOGAR = 'hogar',
  PAPELERIA = 'papeleria',
  OTROS = 'otros'
}

/**
 * Configuración de métodos de impresión permitidos por familia de producto
 */
export interface FamilyPrintingConfig {
  /** Métodos de impresión disponibles para esta familia */
  methods: PrintingMethodId[];

  /** Métodos activos en la UI (subset de methods) */
  activeInUI: PrintingMethodId[];

  /** Cantidad mínima requerida por cada método */
  minQtyByMethod: Partial<Record<PrintingMethodId, number>>;
}

/**
 * Configuración de zonas de impresión permitidas por categoría
 * (Permite overrides específicos por slug de categoría)
 */
export interface CategoryPrintingZonesConfig {
  /** Slug de la categoría */
  categorySlug: string;

  /** Zonas de impresión permitidas para esta categoría */
  allowedZones: string[];

  /** Métodos de impresión permitidos (override de familia si se especifica) */
  allowedMethods?: PrintingMethodId[];
}

/**
 * Tipo de estrategia de cálculo de precios para un método
 */
export type PricingStrategyType = 'COLOR_COUNT' | 'AREA' | 'FLAT_PER_ZONE';

/**
 * Configuración de un método de impresión
 */
export interface PrintingMethodConfig {
  /** ID único del método */
  id: PrintingMethodId;

  /** Etiqueta visible para el usuario (ej: "DTF Full Color") */
  label: string;

  /** Descripción corta explicativa */
  description: string;

  /** Tipo de estrategia de pricing para este método */
  pricingType: PricingStrategyType;

  /** Si está activo y visible en la UI */
  isActive: boolean;

  /** Notas internas (opcional) */
  notes?: string;
}

/**
 * Configuración de precios específica para un método de impresión
 * (Se usará cuando el método esté activo)
 */
export interface PrintingMethodPricingConfig {
  /** ID del método */
  methodId: PrintingMethodId;

  /** Coste base por zona (para FLAT_PER_ZONE) */
  costPerZone?: number;

  /** Coste por color adicional (para COLOR_COUNT) */
  costPerAdditionalColor?: number;

  /** Coste por cm² (para AREA) */
  costPerArea?: number;

  /** Cantidad mínima para este método */
  minimumQuantity?: number;

  /** Factores de escalado específicos del método */
  scalingFactors?: Record<string, number>;

  /** Notas internas */
  notes?: string;
}

/**
 * Información de un método de impresión con su configuración de precios
 */
export interface PrintingMethodWithPricing extends PrintingMethodConfig {
  pricing?: PrintingMethodPricingConfig;
}

/**
 * Información completa de un método con su configuración de familia y precios
 */
export interface PrintingMethodWithFamilyConfig extends PrintingMethodWithPricing {
  /** Familia a la que pertenece */
  familyId: PricingFamilyId;

  /** Cantidad mínima para esta familia */
  minQtyForFamily: number;

  /** Si está activo en la UI para esta familia */
  activeInUI: boolean;
}
