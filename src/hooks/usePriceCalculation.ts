import { useState, useEffect, useCallback } from 'react';
import type { PriceCalculation } from '../types/pricing';

export type PriceCalculationResult = PriceCalculation;
import { calculateScaledPrice, loadPricingData } from '../services/pricingService';

interface UsePriceCalculationOptions {
  regularPrice: number;
  categoryId?: string;
  quantities?: Record<string, number>; // Cambiado de initialQuantities a quantities (controlado)
  selectedZones?: string[]; // Cambiado de initialZones a selectedZones (controlado)
  selectedColor?: string;
  sizeOptions?: any[];
}

export const usePriceCalculation = (options: UsePriceCalculationOptions) => {
  const { regularPrice, categoryId, quantities = {}, selectedZones = [] } = options;
  
  // Eliminamos estado interno duplicado para quantities y selectedZones
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  // Calcular total de unidades directamente de las props
  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  // Auto-calcular cuando cambien cantidades, zonas o precio
  useEffect(() => {
    let isMounted = true;

    const performCalculation = async () => {
      if (totalQuantity > 0) {
        setLoading(true);
        try {
          // Cargar datos de pricing (usará caché si ya está cargado)
          const pricingData = await loadPricingData(categoryId || 'general');
          
          if (isMounted) {
            const calculation = calculateScaledPrice(
              regularPrice,
              totalQuantity,
              selectedZones,
              pricingData
            );
            setPriceCalculation(calculation);
          }
        } catch (error) {
          console.error("Error calculating price:", error);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setPriceCalculation(null);
      }
    };

    performCalculation();

    return () => {
      isMounted = false;
    };
  }, [regularPrice, totalQuantity, selectedZones, categoryId]);

  // Funciones dummy para mantener compatibilidad si se usan (aunque ahora el control es externo)
  const updateQuantity = useCallback((size: string, quantity: number) => {
    console.warn('usePriceCalculation is now controlled externally. Use props to update quantities.');
  }, []);

  const toggleZone = useCallback((zone: string) => {
    console.warn('usePriceCalculation is now controlled externally. Use props to update zones.');
  }, []);

  // Validaciones
  // isValid es true si:
  // 1. Hay cantidad seleccionada (totalQuantity > 0)
  // 2. El presupuesto se ha calculado (priceCalculation !== null)
  // 3. Se cumple la cantidad mínima (cumpleCantidadMinima === true)
  const isValid = totalQuantity > 0 && 
                  priceCalculation !== null &&
                  (priceCalculation?.cumpleCantidadMinima ?? false);
  
  // Estado intermedio: cantidad válida pero presupuesto aún calculando
  const isCalculating = totalQuantity > 0 && loading && !priceCalculation;

  return {
    quantities,
    selectedZones,
    priceCalculation,
    totalQuantity,
    updateQuantity,
    toggleZone,
    isValid,
    isCalculating,
    loading,
    // Estados auxiliares
    hasQuantities: totalQuantity > 0,
    hasZones: selectedZones.length > 0,
    cumpleCantidadMinima: priceCalculation?.cumpleCantidadMinima ?? false,
    escaladoAplicado: priceCalculation?.escalado ?? 1
  };
};
