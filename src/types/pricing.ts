// Interface principal para datos de pricing por categoría
export interface PricingData {
  categoria: string;                    // Nombre de la categoría
  cantidad_minima: number;              // Cantidad mínima para personalización
  factores_escalado: Record<string, number>;  // Factores por cantidad (ej: "25": 5.16, "100": 2.47)
  coste_personalizacion: Record<string, number>;  // Coste por zona (ej: "frontal": 0.45)
  zonas_permitidas: string[];           // Array de zonas disponibles (frontal, espalda, mangas)
  notas?: string;                       // Notas adicionales
}

// Resultado del cálculo de precios
export interface PriceCalculation {
  precioUnitarioBase: number;           // Precio base con escalado
  precioPersonalizacion: number;        // Coste de personalización
  precioUnitarioFinal: number;          // Precio unitario total
  precioTotalSinIVA: number;            // Total sin IVA
  precioTotalConIVA: number;            // Total con IVA (21%)
  cantidadTotal: number;                // Total de unidades
  cantidadMinima: number;               // Mínimo requerido
  cumpleCantidadMinima: boolean;        // Si cumple el mínimo
  escalado: number;                     // Factor de escalado aplicado
  zonasSeleccionadas: string[];         // Zonas elegidas
}

// Selección de cantidades por talla
export interface QuantitySelection {
  [size: string]: number;               // key: talla (XS, S, M, L, XL), value: cantidad
}

// Zonas de personalización seleccionadas
export interface ZoneSelection {
  frontal: boolean;
  espalda: boolean;
  mangas: boolean;
}

// Opciones de plazo de entrega
export interface DeliveryOption {
  value: string;                        // "1", "2", "3"
  label: string;                        // "14 días", "10 días", "7 días"
  multiplier: number;                   // 1.0, 1.1, 1.2
  description: string;                  // "Sin recargo", "+10% recargo"
}
