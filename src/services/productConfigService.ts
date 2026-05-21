/**
 * Product Configuration Service
 * 
 * Manages persistence of product configuration in localStorage.
 * Prepares data structure for future integration with product customizer.
 */

export interface ProductConfig {
  productId: number;
  productSlug: string;
  selectedColor: string | null;
  quantities: Record<string, number>; // { "s": 10, "m": 20, "l": 15 }
  printingMethod: string | null; // "SERIGRAFIA_1_COLOR" | "DTF_FULL_COLOR" | etc.
  activeZones: string[]; // ["frontal", "espalda", "manga_izq", "manga_der"]
  deliveryOption: 'sin_prisa' | 'normal' | 'urgente'; // Plazo de entrega seleccionado
  timestamp: number; // Unix timestamp for expiration
}

const STORAGE_KEY_PREFIX = 'product_config_';
const EXPIRATION_DAYS = 7;

/**
 * Save product configuration to localStorage
 */
export function saveProductConfig(config: ProductConfig): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${config.productSlug}`;
    const dataToSave = {
      ...config,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving product config:', error);
  }
}

/**
 * Load product configuration from localStorage
 * Returns null if not found or expired
 */
export function loadProductConfig(productSlug: string): ProductConfig | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${productSlug}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }

    const config: ProductConfig = JSON.parse(stored);
    
    // Check expiration (7 days)
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - config.timestamp > expirationTime;
    
    if (isExpired) {
      clearProductConfig(productSlug);
      return null;
    }

    return config;
  } catch (error) {
    console.error('Error loading product config:', error);
    return null;
  }
}

/**
 * Clear product configuration from localStorage
 */
export function clearProductConfig(productSlug: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${productSlug}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing product config:', error);
  }
}

/**
 * Clear all expired product configurations
 */
export function clearExpiredConfigs(): void {
  try {
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const config: ProductConfig = JSON.parse(stored);
            const isExpired = Date.now() - config.timestamp > expirationTime;
            if (isExpired) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error clearing expired configs:', error);
  }
}
