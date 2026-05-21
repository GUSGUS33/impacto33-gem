import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPricingDataFromFamily,
  calculateScaledPrice,
  calculateScaledPriceFromCategory,
  getAvailablePrintingMethods,
  getEscaladoMultiplier,
  clearPricingCache
} from './pricingService';
import { getPricingFamilyFromCategory } from '../data/pricing/category-to-family';
import { getAllowedMethodsForCategory } from '../data/pricing/category-allowed-methods';

describe('Pricing Service - Fase 1.2', () => {
  beforeEach(() => {
    clearPricingCache();
  });

  describe('Category to Family Mapping', () => {
    it('debería mapear categoría t_shirts a familia ropa', () => {
      const family = getPricingFamilyFromCategory('t_shirts');
      expect(family).toBe('ropa');
    });

    it('debería mapear categoría bags a familia accesorios', () => {
      const family = getPricingFamilyFromCategory('bags');
      expect(family).toBe('accesorios');
    });

    it('debería mapear categoría mugs a familia hogar', () => {
      const family = getPricingFamilyFromCategory('mugs');
      expect(family).toBe('hogar');
    });

    it('debería mapear categoría ball_pens a familia papeleria', () => {
      const family = getPricingFamilyFromCategory('ball_pens');
      expect(family).toBe('papeleria');
    });

    it('debería usar fallback "otros" para categoría desconocida', () => {
      const family = getPricingFamilyFromCategory('categoria_inexistente');
      expect(family).toBe('otros');
    });

    it('debería usar fallback "otros" para categoría vacía', () => {
      const family = getPricingFamilyFromCategory('');
      expect(family).toBe('otros');
    });
  });

  describe('Category Allowed Methods', () => {
    it('debería permitir DTF y SERIGRAFIA_1_COLOR para camisetas', () => {
      const methods = getAllowedMethodsForCategory('t_shirts');
      expect(methods).toContain('DTF');
      expect(methods).toContain('SERIGRAFIA_1_COLOR');
      expect(methods).toContain('SIN_IMPRESION');
    });

    it('debería permitir solo DTF y SIN_IMPRESION para bolsas', () => {
      const methods = getAllowedMethodsForCategory('bags');
      expect(methods).toContain('DTF');
      expect(methods).toContain('SIN_IMPRESION');
      expect(methods).not.toContain('SERIGRAFIA_1_COLOR');
    });

    it('debería usar fallback para categoría desconocida', () => {
      const methods = getAllowedMethodsForCategory('categoria_inexistente');
      expect(methods).toBeDefined();
      expect(methods.length).toBeGreaterThan(0);
    });
  });

  describe('Available Printing Methods (Solo activos)', () => {
    it('debería retornar solo métodos activos para camisetas', () => {
      const activeMethods = getAvailablePrintingMethods('t_shirts');
      // En Fase 1.2, solo DTF está activo
      expect(activeMethods).toContain('DTF');
      expect(activeMethods).not.toContain('SERIGRAFIA_1_COLOR');
      expect(activeMethods).not.toContain('SIN_IMPRESION');
    });

    it('debería retornar solo DTF para bolsas', () => {
      const activeMethods = getAvailablePrintingMethods('bags');
      expect(activeMethods).toEqual(['DTF']);
    });

    it('debería retornar array con DTF para categoría desconocida', () => {
      const activeMethods = getAvailablePrintingMethods('categoria_inexistente');
      expect(Array.isArray(activeMethods)).toBe(true);
      expect(activeMethods).toContain('DTF');
    });
  });

  describe('Pricing Data from Family', () => {
    it('debería cargar datos de familia ropa', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      expect(pricingData).toBeDefined();
      expect(pricingData.categoria).toBe('Ropa Personalizada');
      expect(pricingData.cantidad_minima).toBe(25);
    });

    it('debería cargar datos de familia accesorios', () => {
      const pricingData = loadPricingDataFromFamily('bags');
      expect(pricingData).toBeDefined();
      expect(pricingData.categoria).toBe('Accesorios Personalizados');
      expect(pricingData.cantidad_minima).toBe(50);
    });

    it('debería cargar datos de familia hogar', () => {
      const pricingData = loadPricingDataFromFamily('mugs');
      expect(pricingData).toBeDefined();
      expect(pricingData.categoria).toBe('Artículos para el Hogar');
      expect(pricingData.cantidad_minima).toBe(20);
    });

    it('debería cargar datos de familia papeleria', () => {
      const pricingData = loadPricingDataFromFamily('ball_pens');
      expect(pricingData).toBeDefined();
      expect(pricingData.categoria).toBe('Papelería Personalizada');
      expect(pricingData.cantidad_minima).toBe(100);
    });

    it('debería cargar datos de familia otros para categoría desconocida', () => {
      const pricingData = loadPricingDataFromFamily('categoria_inexistente');
      expect(pricingData).toBeDefined();
      expect(pricingData.categoria).toBe('Otros Productos');
    });
  });

  describe('Escalado Multiplier', () => {
    it('debería retornar factor correcto para cantidad en tramo exacto', () => {
      const escalados = { '25': 5.16, '50': 3.69, '100': 2.47 };
      const factor = getEscaladoMultiplier(50, escalados);
      expect(factor).toBe(3.69);
    });

    it('debería retornar factor del tramo inferior para cantidad intermedia', () => {
      const escalados = { '25': 5.16, '50': 3.69, '100': 2.47 };
      const factor = getEscaladoMultiplier(75, escalados);
      expect(factor).toBe(3.69); // Tramo 50
    });

    it('debería retornar factor del tramo más alto para cantidad muy grande', () => {
      const escalados = { '25': 5.16, '50': 3.69, '100': 2.47 };
      const factor = getEscaladoMultiplier(1000, escalados);
      expect(factor).toBe(2.47); // Tramo 100
    });

    it('debería retornar factor del primer tramo para cantidad menor', () => {
      const escalados = { '25': 5.16, '50': 3.69, '100': 2.47 };
      const factor = getEscaladoMultiplier(10, escalados);
      expect(factor).toBe(5.16); // Tramo 25
    });
  });

  describe('Calculate Scaled Price - DTF (Fase 1.2)', () => {
    it('debería calcular precio correcto para 50 unidades, 2 zonas (familia ropa)', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const regularPrice = 20; // Precio WooCommerce
      const cantidad = 50;
      const zonas = ['frontal', 'espalda'];

      const result = calculateScaledPrice(regularPrice, cantidad, zonas, pricingData, 'DTF');

      // Verificar estructura del resultado
      expect(result).toBeDefined();
      expect(result.precioUnitarioBase).toBe(10); // 20 / 2
      expect(result.precioPersonalizacion).toBeCloseTo(0.85, 2); // 0.45 + 0.40
      expect(result.cantidadTotal).toBe(50);
      expect(result.cumpleCantidadMinima).toBe(true);
      expect(result.escalado).toBe(3.69); // Factor para 50 unidades
      expect(result.zonasSeleccionadas).toEqual(['frontal', 'espalda']);

      // Precio unitario final: (10 + 0.85) * 3.69 = 40.0365
      const expectedUnitario = (10 + 0.85) * 3.69;
      expect(result.precioUnitarioFinal).toBeCloseTo(expectedUnitario, 2);

      // Precio total sin IVA: 40.0365 * 50
      const expectedSinIVA = expectedUnitario * 50;
      expect(result.precioTotalSinIVA).toBeCloseTo(expectedSinIVA, 2);

      // Precio total con IVA
      const expectedConIVA = expectedSinIVA * 1.21;
      expect(result.precioTotalConIVA).toBeCloseTo(expectedConIVA, 2);
    });

    it('debería calcular precio correcto para 10 unidades sin cumplir mínimo', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const regularPrice = 20;
      const cantidad = 10;
      const zonas = ['frontal'];

      const result = calculateScaledPrice(regularPrice, cantidad, zonas, pricingData, 'DTF');

      expect(result.cumpleCantidadMinima).toBe(false); // Mínimo es 25
      expect(result.cantidadMinima).toBe(25);
    });

    it('debería retornar mismo precio que antes para DTF (compatibilidad)', () => {
      // Esto verifica que la fórmula de DTF es idéntica a la anterior
      // Nota: mangas ahora se desglosó en manga_izquierda y manga_derecha
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const regularPrice = 50;
      const cantidad = 100;
      const zonas = ['frontal', 'espalda', 'manga_izquierda', 'manga_derecha'];

      const result = calculateScaledPrice(regularPrice, cantidad, zonas, pricingData, 'DTF');

      // Verificar que el cálculo es correcto
      const precioBase = 50 / 2; // 25
      const personalizacion = 0.45 + 0.40 + 0.50 + 0.50; // 1.85 (frontal + espalda + manga_izq + manga_der)
      const total = precioBase + personalizacion; // 26.85
      const escalado = 2.47; // Factor para 100 unidades
      const unitarioFinal = total * escalado; // 66.3495
      const totalSinIVA = unitarioFinal * 100; // 6634.95
      const totalConIVA = totalSinIVA * 1.21; // 8030.2395
      
      // Permitir pequeñas variaciones por rounding

      expect(result.precioUnitarioFinal).toBeCloseTo(unitarioFinal, 1);
      expect(result.precioTotalSinIVA).toBeCloseTo(totalSinIVA, 1);
      expect(result.precioTotalConIVA).toBeCloseTo(totalConIVA, 1);
    });
  });

  describe('Calculate Scaled Price from Category', () => {
    it('debería calcular precio usando categoría WooCommerce', () => {
      const regularPrice = 30;
      const cantidad = 50;
      const zonas = ['frontal'];

      const result = calculateScaledPriceFromCategory(regularPrice, cantidad, zonas, 't_shirts', 'DTF');

      expect(result).toBeDefined();
      expect(result.cantidadTotal).toBe(50);
      expect(result.zonasSeleccionadas).toEqual(['frontal']);
    });

    it('debería usar fallback para categoría desconocida', () => {
      const regularPrice = 30;
      const cantidad = 50;
      const zonas = ['frontal'];

      const result = calculateScaledPriceFromCategory(regularPrice, cantidad, zonas, 'categoria_inexistente', 'DTF');

      expect(result).toBeDefined();
      expect(result.cantidadTotal).toBe(50);
    });
  });

  describe('Printing Method Validation', () => {
    it('debería usar DTF por defecto si no se especifica método', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const result = calculateScaledPrice(20, 50, ['frontal'], pricingData);
      // Si no especificamos método, debería usar DTF por defecto
      expect(result).toBeDefined();
    });

    it('debería ignorar métodos inactivos en Fase 1.2', () => {
      const activeMethods = getAvailablePrintingMethods('t_shirts');
      // En Fase 1.2, solo DTF está activo
      expect(activeMethods).toContain('DTF');
      expect(activeMethods.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar cantidad 0', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const result = calculateScaledPrice(20, 0, ['frontal'], pricingData);
      expect(result.cantidadTotal).toBe(0);
      expect(result.precioTotalSinIVA).toBe(0);
      expect(result.precioTotalConIVA).toBe(0);
    });

    it('debería manejar zonas vacías', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const result = calculateScaledPrice(20, 50, [], pricingData);
      expect(result.precioPersonalizacion).toBe(0);
      expect(result.zonasSeleccionadas).toEqual([]);
    });

    it('debería manejar precio base 0', () => {
      const pricingData = loadPricingDataFromFamily('t_shirts');
      const result = calculateScaledPrice(0, 50, ['frontal'], pricingData);
      expect(result.precioUnitarioBase).toBe(0);
    });
  });
});
