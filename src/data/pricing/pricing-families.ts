/**
 * Configuración de familias de precios
 * 
 * Define la estructura de precios para cada familia de productos.
 * En esta fase (1.2), todas las familias usan la misma fórmula de DTF.
 * Más adelante se pueden personalizar por familia.
 */

import type { PricingData } from '../../types/pricing';
import type { PricingFamilyId } from './category-to-family';

export const PRICING_FAMILIES: Record<PricingFamilyId, PricingData> = {
  /**
   * FAMILIA: ROPA
   * Camisetas, polos, sudaderas, chaquetas, pantalones, etc.
   */
  ropa: {
    categoria: 'Ropa Personalizada',
    cantidad_minima: 25,
    factores_escalado: {
      '25': 5.16,
      '50': 3.69,
      '100': 2.47,
      '250': 1.85,
      '500': 1.32,
      '1000': 1.0,
      '2000': 0.89
    },
    coste_personalizacion: {
      'frontal': 0.45,
      'espalda': 0.40,
      'manga_izquierda': 0.50,
      'manga_derecha': 0.50
    },
    zonas_permitidas: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha'],
    notas: 'Precios DTF, IVA incluido. Personalización full color.'
  },

  /**
   * FAMILIA: ACCESORIOS
   * Bolsas, mochilas, gorras, accesorios tecnológicos, etc.
   */
  accesorios: {
    categoria: 'Accesorios Personalizados',
    cantidad_minima: 50,
    factores_escalado: {
      '50': 4.50,
      '100': 3.00,
      '250': 2.00,
      '500': 1.50,
      '1000': 1.00,
      '2000': 0.90
    },
    coste_personalizacion: {
      'frontal': 0.60,
      'espalda': 0.50
    },
    zonas_permitidas: ['frontal', 'espalda'],
    notas: 'Precios DTF, IVA incluido. Cantidad mínima 50 unidades.'
  },

  /**
   * FAMILIA: HOGAR
   * Tazas, botellas, decoración, artículos para el hogar, etc.
   */
  hogar: {
    categoria: 'Artículos para el Hogar',
    cantidad_minima: 20,
    factores_escalado: {
      '20': 6.00,
      '50': 4.00,
      '100': 2.50,
      '250': 1.80,
      '500': 1.40,
      '1000': 1.00,
      '2000': 0.90
    },
    coste_personalizacion: {
      'frontal': 0.30
    },
    zonas_permitidas: ['frontal'],
    notas: 'Precios DTF, IVA incluido. Cantidad mínima 20 unidades.'
  },

  /**
   * FAMILIA: PAPELERÍA
   * Bolígrafos, libretas, agendas, cuadernos, etc.
   */
  papeleria: {
    categoria: 'Papelería Personalizada',
    cantidad_minima: 100,
    factores_escalado: {
      '100': 5.00,
      '250': 3.50,
      '500': 2.50,
      '1000': 1.50,
      '2000': 1.00
    },
    coste_personalizacion: {
      'frente': 0.20
    },
    zonas_permitidas: ['frente'],
    notas: 'Precios DTF, IVA incluido. Cantidad mínima 100 unidades.'
  },

  /**
   * FAMILIA: OTROS
   * Categorías genéricas o no clasificadas
   */
  otros: {
    categoria: 'Otros Productos',
    cantidad_minima: 10,
    factores_escalado: {
      '10': 5.16,
      '25': 3.69,
      '50': 2.97,
      '100': 2.13,
      '250': 1.67,
      '500': 1.32,
      '1000': 1.0,
      '2000': 0.89
    },
    coste_personalizacion: {
      'frontal': 0.50,
      'espalda': 0.45,
      'manga_izquierda': 0.50,
      'manga_derecha': 0.50
    },
    zonas_permitidas: ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha'],
    notas: 'Precios DTF por defecto, IVA incluido.'
  }
};

/**
 * Obtener configuración de precios para una familia
 * @param familyId - ID de familia de precios
 * @returns Configuración de precios
 */
export const getPricingFamilyConfig = (familyId: PricingFamilyId): PricingData => {
  return PRICING_FAMILIES[familyId] || PRICING_FAMILIES['otros'];
};
