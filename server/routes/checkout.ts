import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Site ID fijo de impacto33
const IMPACTO33_SITE_ID = '6321b8a8-976f-49b3-84f1-05b427f8e138';

// Inicializar cliente de Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * Configuración de Stripe desde variables de entorno
 */
const stripeConfig = {
  enabled: process.env.STRIPE_ENABLED === 'true',
  publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
};

/**
 * Validar que Stripe está habilitado y configurado correctamente
 */
function isStripeConfigured(): boolean {
  if (!stripeConfig.enabled) {
    return false;
  }
  return !!(stripeConfig.publicKey && stripeConfig.secretKey);
}

/**
 * POST /api/checkout
 * Crear sesión de pago o PaymentIntent en Stripe
 * Filtra por site_id = impacto33
 */
router.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    if (!stripeConfig.enabled) {
      return res.status(503).json({
        error: 'Stripe no está habilitado todavía',
        message: 'El pago online estará disponible próximamente',
      });
    }

    if (!isStripeConfigured()) {
      console.error('[Checkout] Stripe habilitado pero no configurado correctamente');
      return res.status(500).json({
        error: 'Error de configuración',
        message: 'El sistema de pagos no está correctamente configurado',
      });
    }

    const { cartId, userId } = req.body;

    if (!cartId || !userId) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere cartId y userId',
      });
    }

    // Obtener carrito desde Supabase filtrando por site_id
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('supabase_user_id', userId)
      .eq('site_id', IMPACTO33_SITE_ID)
      .single();

    if (cartError || !cart) {
      return res.status(404).json({
        error: 'Carrito no encontrado',
      });
    }

    // Obtener items del carrito filtrando por site_id
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('site_id', IMPACTO33_SITE_ID);

    if (itemsError) {
      return res.status(500).json({
        error: 'Error al obtener items del carrito',
      });
    }

    console.log('[Checkout] Preparando sesión de Stripe (placeholder)');
    console.log('[Checkout] Cart ID:', cartId);
    console.log('[Checkout] Total:', cart.total_with_vat);
    console.log('[Checkout] Items:', items?.length);

    return res.status(200).json({
      status: 'ready',
      message: 'Sesión de Stripe preparada (placeholder)',
      cartId,
      total: cart.total_with_vat,
      itemsCount: items?.length || 0,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * GET /api/checkout/status
 * Obtener estado de la configuración de Stripe
 */
router.get('/api/checkout/status', (req: Request, res: Response) => {
  return res.status(200).json({
    stripeEnabled: stripeConfig.enabled,
    stripeConfigured: isStripeConfigured(),
    message: stripeConfig.enabled
      ? 'Stripe está habilitado'
      : 'Stripe está deshabilitado',
  });
});

export default router;
