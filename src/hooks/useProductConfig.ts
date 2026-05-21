import { useEffect, useCallback } from 'react';
import {
  ProductConfig,
  saveProductConfig,
  loadProductConfig,
  clearProductConfig,
} from '@/services/productConfigService';

interface UseProductConfigProps {
  productId: number;
  productSlug: string;
  selectedColor: string | null;
  quantities: Record<string, number>;
  printingMethod: string | null;
  activeZones: string[];
  deliveryOption: 'sin_prisa' | 'normal' | 'urgente';
  skipAutoSave?: boolean; // Skip auto-save during initialization
}

interface UseProductConfigReturn {
  saveConfig: () => void;
  loadConfig: () => ProductConfig | null;
  clearConfig: () => void;
}

/**
 * Hook to manage product configuration persistence
 * Auto-saves configuration with debounce
 */
export function useProductConfig({
  productId,
  productSlug,
  selectedColor,
  quantities,
  printingMethod,
  activeZones,
  deliveryOption,
  skipAutoSave = false,
}: UseProductConfigProps): UseProductConfigReturn {
  
  // Auto-save configuration with debounce (1 second)
  useEffect(() => {
    // Skip auto-save during initialization
    if (skipAutoSave) {
      return;
    }

    // Only save if there's meaningful data
    const hasData = 
      selectedColor !== null ||
      Object.values(quantities).some(q => q > 0) ||
      printingMethod !== null ||
      activeZones.length > 0;

    if (!hasData) {
      return;
    }

    const timer = setTimeout(() => {
      const config: ProductConfig = {
        productId,
        productSlug,
        selectedColor,
        quantities,
        printingMethod,
        activeZones,
        deliveryOption,
        timestamp: Date.now(),
      };
      
      saveProductConfig(config);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [productId, productSlug, selectedColor, quantities, printingMethod, activeZones, deliveryOption, skipAutoSave]);

  const saveConfig = useCallback(() => {
    const config: ProductConfig = {
      productId,
      productSlug,
      selectedColor,
      quantities,
      printingMethod,
      activeZones,
      deliveryOption,
      timestamp: Date.now(),
    };
    saveProductConfig(config);
  }, [productId, productSlug, selectedColor, quantities, printingMethod, activeZones, deliveryOption]);

  const loadConfig = useCallback(() => {
    return loadProductConfig(productSlug);
  }, [productSlug]);

  const clearConfig = useCallback(() => {
    clearProductConfig(productSlug);
  }, [productSlug]);

  return {
    saveConfig,
    loadConfig,
    clearConfig,
  };
}
