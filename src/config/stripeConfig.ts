/**
 * Configuración de Stripe con feature flag
 * 
 * STRIPE_ENABLED: boolean que controla si Stripe está activo
 * STRIPE_PUBLIC_KEY: clave pública de Stripe (solo si está habilitado)
 */

export const stripeConfig = {
  // Feature flag: true para activar Stripe, false para desactivar
  enabled: (process.env.NEXT_PUBLIC_STRIPE_ENABLED || process.env.VITE_STRIPE_ENABLED) === 'true',
  
  // Clave pública de Stripe (vacía si está desactivado)
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.VITE_STRIPE_PUBLIC_KEY || '',
  
  // Validar que si está habilitado, tenga la clave pública
  isValid: () => {
    if (!stripeConfig.enabled) {
      return true; // Si está desactivado, es válido
    }
    return !!stripeConfig.publicKey;
  },
  
  // Mensaje informativo cuando Stripe está desactivado
  disabledMessage: 'El pago online todavía no está disponible. Estamos afinando el sistema de precios. Puedes usar el presupuesto rápido por ahora.',
};

export function isStripeEnabled(): boolean {
  return stripeConfig.enabled && stripeConfig.isValid();
}
