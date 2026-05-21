import { useState, useEffect, useCallback } from 'react';
import type { PricingData, PriceCalculation } from '../types/pricing';
import { loadPricingData, calculateScaledPrice } from '../services/pricingService';

export const usePricingData = (categoryId?: string) => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cuando cambia la categoría
  useEffect(() => {
    let isMounted = true;

    const fetchPricing = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadPricingData(categoryId);
        if (isMounted) {
          setPricingData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading pricing data:", err);
          setError("No se pudieron cargar los datos de precios.");
          // Podríamos cargar default aquí si loadPricingData fallara catastróficamente
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPricing();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  // Función de cálculo expuesta por el hook
  const calculatePrice = useCallback((
    regularPrice: number,
    cantidad: number,
    zonasSeleccionadas: string[]
  ): PriceCalculation | null => {
    if (!pricingData) return null;

    return calculateScaledPrice(
      regularPrice,
      cantidad,
      zonasSeleccionadas,
      pricingData
    );
  }, [pricingData]);

  return {
    pricingData,
    loading,
    error,
    calculatePrice
  };
};
