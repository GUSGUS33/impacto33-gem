import type { PricingData, PriceCalculation } from '../types/pricing';
import type { PrintingMethodId } from '../types/printing';
import defaultPricing from '../data/pricing/_default.json';
import { getPricingFamilyConfig } from '../data/pricing/pricing-families';
import { getPricingFamilyFromCategory } from '../data/pricing/category-to-family';
import { getAllowedMethodsForCategory } from '../data/pricing/category-allowed-methods';
import { PRINTING_METHODS, isPrintingMethodActive } from '../data/pricing/printing-methods';

// Cache en memoria para evitar recargas innecesarias
const pricingCache = new Map<string, PricingData>();

// Valores hardcoded de emergencia por si falla todo lo demás
const EMERGENCY_PRICING: PricingData = {
  categoria: "Emergency",
  cantidad_minima: 10,
  factores_escalado: { "1": 1.0 },
  coste_personalizacion: { "frontal": 0.5 },
  zonas_permitidas: ["frontal"],
  notas: "Emergency Fallback"
};

/**
 * Obtener datos de pricing para una familia de productos
 * En esta fase (1.2), todas las familias usan la misma fórmula de DTF
 */
export const loadPricingDataFromFamily = (categorySlug: string): PricingData => {
  // Obtener familia de precios desde categoría WooCommerce
  const familyId = getPricingFamilyFromCategory(categorySlug);
  
  // Obtener configuración de la familia
  const pricingData = getPricingFamilyConfig(familyId);
  
  return pricingData;
};

/**
 * Cargar datos de pricing con sistema de cache y fallback
 * (Mantiene compatibilidad con sistema anterior)
 */
export const loadPricingData = async (categoryId: string): Promise<PricingData> => {
  // Nivel 1: Cache en memoria
  if (pricingCache.has(categoryId)) {
    return pricingCache.get(categoryId)!;
  }

  try {
    // Normalizar ID de categoría para buscar el archivo
    const normalizedId = categoryId.toLowerCase().replace(/\s+/g, '-');
    
    // Nivel 2: Intentar cargar JSON específico
    // Nota: En Vite/Webpack, las importaciones dinámicas de JSON deben manejarse con cuidado.
    // Usamos import() dinámico que Vite resolverá.
    const pricingJson = await import(`../data/pricing/${normalizedId}.json`);
    const data = pricingJson.default as PricingData;
    
    pricingCache.set(categoryId, data);
    return data;
  } catch (error) {
    console.warn(`Pricing data not found for category "${categoryId}", using default fallback.`);
    
    // Nivel 3: Fallback a _default.json
    // Ya importado estáticamente arriba para asegurar disponibilidad
    const fallbackData = defaultPricing as unknown as PricingData;
    
    // Guardamos en cache el fallback para esta categoría también
    pricingCache.set(categoryId, fallbackData);
    return fallbackData;
  }
};

/**
 * Calcular multiplicador de escalado según cantidad
 */
export const getEscaladoMultiplier = (cantidad: number, escalados: Record<string, number>): number => {
  const tramos = Object.keys(escalados)
    .map(Number)
    .sort((a, b) => a - b); // Ordenar ascendente: 25, 50, 100...

  // Encontrar el tramo más alto que sea menor o igual a la cantidad
  // Ej: cantidad 75 -> tramo 50
  let tramoAplicable = tramos[0];
  
  for (const tramo of tramos) {
    if (cantidad >= tramo) {
      tramoAplicable = tramo;
    } else {
      break; // Ya nos pasamos, nos quedamos con el anterior
    }
  }

  return escalados[tramoAplicable.toString()] || 1.0;
};

/**
 * Calcular precio final con escalado y personalización
 * 
 * FASE 1.2: Solo DTF está activo
 * La fórmula es idéntica a la anterior para garantizar compatibilidad
 */
export const calculateScaledPrice = (
  regularPrice: number,
  cantidad: number,
  zonasSeleccionadas: string[],
  pricingData: PricingData,
  printingMethod: PrintingMethodId = 'DTF'
): PriceCalculation => {
  // Validar que el método de impresión esté activo
  if (!isPrintingMethodActive(printingMethod)) {
    console.warn(`Printing method "${printingMethod}" is not active. Using DTF instead.`);
    // En Fase 1.2, solo DTF está activo, así que siempre usaremos DTF
  }

  // 1. Precio base real: regularPrice / 2 (Según fórmula del proyecto)
  const precioUnitarioBase = regularPrice / 2;

  // 2. Costo de personalización: sumar zonas seleccionadas
  const precioPersonalizacion = zonasSeleccionadas.reduce((total, zona) => {
    return total + (pricingData.coste_personalizacion[zona] || 0);
  }, 0);

  // 3. Coste base total
  const costeBaseTotal = precioUnitarioBase + precioPersonalizacion;

  // 4. Obtener multiplicador de escalado
  const escalado = getEscaladoMultiplier(cantidad, pricingData.factores_escalado);

  // 5. Aplicar escalado al TOTAL
  const precioUnitarioFinal = costeBaseTotal * escalado;

  // 6. Precios totales
  const precioTotalSinIVA = precioUnitarioFinal * cantidad;
  const precioTotalConIVA = precioTotalSinIVA * 1.21; // IVA 21%

  return {
    precioUnitarioBase,
    precioPersonalizacion,
    precioUnitarioFinal,
    precioTotalSinIVA,
    precioTotalConIVA,
    cantidadTotal: cantidad,
    cantidadMinima: pricingData.cantidad_minima,
    cumpleCantidadMinima: cantidad >= pricingData.cantidad_minima,
    escalado,
    zonasSeleccionadas
  };
};

/**
 * Calcular precio desde categoría WooCommerce (nueva API)
 * 
 * Obtiene automáticamente la familia de precios desde la categoría
 */
export const calculateScaledPriceFromCategory = (
  regularPrice: number,
  cantidad: number,
  zonasSeleccionadas: string[],
  categorySlug: string,
  printingMethod: PrintingMethodId = 'DTF'
): PriceCalculation => {
  const pricingData = loadPricingDataFromFamily(categorySlug);
  return calculateScaledPrice(regularPrice, cantidad, zonasSeleccionadas, pricingData, printingMethod);
};

/**
 * Obtener métodos de impresión permitidos para una categoría
 */
export const getAvailablePrintingMethods = (categorySlug: string): PrintingMethodId[] => {
  const allowedMethods = getAllowedMethodsForCategory(categorySlug);
  // Filtrar solo los métodos que están activos
  return allowedMethods.filter(methodId => isPrintingMethodActive(methodId));
};

/**
 * Calcular precio "desde" para mostrar en listas (basado en cantidad óptima/máxima)
 */
export const calculateFromPrice = async (regularPrice: number, categoryId: string = 'general'): Promise<string> => {
  const data = await loadPricingData(categoryId);
  
  // Asumimos una cantidad alta para mostrar el precio más bajo posible ("Desde...")
  // Usamos el tramo más alto disponible
  const tramos = Object.keys(data.factores_escalado).map(Number);
  const maxCantidad = Math.max(...tramos);
  
  const calculo = calculateScaledPrice(regularPrice, maxCantidad, [], data);
  return formatEuroPrice(calculo.precioUnitarioFinal);
};

/**
 * Formatear precio en euros
 */
export const formatEuroPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Limpiar cache (útil para desarrollo)
 */
export const clearPricingCache = (): void => {
  pricingCache.clear();
};

/**
 * ========================================
 * HELPERS DE MÉTODOS DE IMPRESIÓN
 * ========================================
 * 
 * Funciones para acceder a la configuración de métodos de impresión
 * por familia de producto, con soporte para overrides por categoría.
 */

import { 
  getFamilyPrintingConfig, 
  getMinQtyForMethod, 
  isMethodActiveInUI, 
  getAllowedMethodsForFamily, 
  getActiveMethodsInUI 
} from '../data/pricing/family-printing-config';
import type { PricingFamilyId } from '../types/printing';

/**
 * Obtener métodos de impresión permitidos para una categoría
 * 
 * Prioridad:
 * 1. Override específico por categoría (CATEGORY_ALLOWED_METHODS)
 * 2. Métodos de la familia (FAMILY_PRINTING_CONFIG)
 * 3. Fallback a familia 'otros'
 * 
 * @param categorySlug - Slug de la categoría WooCommerce
 * @returns Array de métodos permitidos
 */
export const getPrintingMethodsForCategory = (categorySlug: string): PrintingMethodId[] => {
  // Primero intentar obtener override específico por categoría
  const categoryMethods = getAllowedMethodsForCategory(categorySlug);
  if (categoryMethods && categoryMethods.length > 0) {
    return categoryMethods;
  }
  
  // Fallback a métodos de la familia
  const familyId = getPricingFamilyFromCategory(categorySlug);
  const familyMethods = getAllowedMethodsForFamily(familyId as PricingFamilyId);
  return familyMethods as PrintingMethodId[];
};

/**
 * Obtener métodos de impresión activos en la UI para una categoría
 * 
 * Prioridad:
 * 1. Override específico por categoría
 * 2. Métodos activos de la familia
 * 3. Fallback a familia 'otros'
 * 
 * @param categorySlug - Slug de la categoría WooCommerce
 * @returns Array de métodos activos en la UI
 */
export const getActiveUIMethodsForCategory = (categorySlug: string): PrintingMethodId[] => {
  const familyId = getPricingFamilyFromCategory(categorySlug);
  const activeMethods = getActiveMethodsInUI(familyId as PricingFamilyId);
  return activeMethods as PrintingMethodId[];
};

/**
 * Obtener cantidad mínima para un método en una categoría
 * 
 * @param categorySlug - Slug de la categoría WooCommerce
 * @param methodId - ID del método de impresión
 * @returns Cantidad mínima requerida
 */
export const getMinimumQtyForMethod = (categorySlug: string, methodId: PrintingMethodId): number => {
  const familyId = getPricingFamilyFromCategory(categorySlug);
  return getMinQtyForMethod(familyId as PricingFamilyId, methodId);
};

/**
 * Verificar si un método está activo en la UI para una categoría
 * 
 * @param categorySlug - Slug de la categoría WooCommerce
 * @param methodId - ID del método de impresión
 * @returns true si el método está activo en la UI
 */
export const isMethodActiveForCategory = (categorySlug: string, methodId: PrintingMethodId): boolean => {
  const familyId = getPricingFamilyFromCategory(categorySlug);
  return isMethodActiveInUI(familyId as PricingFamilyId, methodId);
};

/**
 * Obtener configuración completa de métodos para una familia
 * 
 * Útil para debugging o cuando necesitas toda la información
 * 
 * @param familyId - ID de la familia
 * @returns Configuración completa de la familia
 */
export const getPrintingConfigForFamily = (familyId: PricingFamilyId) => {
  return getFamilyPrintingConfig(familyId);
};
