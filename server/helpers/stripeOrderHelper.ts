import { createClient } from "@supabase/supabase-js";

// Site ID fijo de impacto33
const IMPACTO33_SITE_ID = "6321b8a8-976f-49b3-84f1-05b427f8e138";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
);

/**
 * HELPER PARA CREAR ÓRDENES DESDE EVENTOS DE STRIPE
 *
 * Este archivo contiene la lógica para procesar eventos de Stripe y crear órdenes
 * en la base de datos. Se implementará cuando STRIPE_ENABLED sea true y se active
 * el procesamiento de pagos.
 *
 * MULTI-SITE: Todas las queries filtran por site_id = IMPACTO33_SITE_ID
 *
 * Flujo esperado:
 * 1. Webhook de Stripe recibe evento 'payment_intent.succeeded'
 * 2. Valida la firma del webhook
 * 3. Extrae cartId y userId del metadata del PaymentIntent
 * 4. Llama a createOrderFromStripeEvent()
 * 5. Crea orden, order_items y payment_event en Supabase
 * 6. Actualiza cart.status a 'converted_to_order'
 * 7. Envía email de confirmación
 */

interface StripePaymentIntentMetadata {
  cartId: string;
  userId: string;
  [key: string]: string;
}

interface StripePaymentEvent {
  id: string;
  object: string;
  amount: number;
  currency: string;
  metadata: StripePaymentIntentMetadata;
  status:
    | "succeeded"
    | "processing"
    | "requires_action"
    | "requires_payment_method"
    | "canceled";
  client_secret: string;
}

/**
 * Crear orden desde evento de Stripe
 * Todas las queries filtran por site_id = IMPACTO33_SITE_ID
 */
export async function createOrderFromStripeEvent(
  paymentIntent: StripePaymentEvent
): Promise<string | null> {
  try {
    console.log(
      "[StripeOrderHelper] Procesando evento de pago:",
      paymentIntent.id
    );

    // TODO: Implementar lógica de creación de orden
    /*
    const { cartId, userId } = paymentIntent.metadata;

    // 1. Validar carrito (filtrado por site_id)
    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('supabase_user_id', userId)
      .eq('site_id', IMPACTO33_SITE_ID)
      .single();

    if (!cart) {
      throw new Error(`Carrito no encontrado: ${cartId}`);
    }

    // 2. Obtener items del carrito (filtrado por site_id)
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('site_id', IMPACTO33_SITE_ID);

    if (!cartItems || cartItems.length === 0) {
      throw new Error(`No hay items en el carrito: ${cartId}`);
    }

    // 3. Crear orden (con site_id)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        supabase_user_id: userId,
        site_id: IMPACTO33_SITE_ID,
        status: 'pending',
        total_with_vat: cart.total_with_vat,
        total_without_vat: cart.subtotal_without_vat,
        vat_amount: cart.vat_amount,
        currency: cart.currency,
        payment_status: 'paid',
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Error creando orden: ${orderError?.message}`);
    }

    // 4. Crear order_items (con site_id)
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      site_id: IMPACTO33_SITE_ID,
      product_id: item.product_id,
      product_name: item.product_name,
      product_slug: item.product_slug,
      quantity: item.quantity,
      unit_price_with_vat: item.unit_price_with_vat,
      unit_price_without_vat: item.unit_price_without_vat,
      total_with_vat: item.total_with_vat,
      total_without_vat: item.total_without_vat,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      throw new Error(`Error creando order_items: ${orderItemsError.message}`);
    }

    // 5. Crear payment_event (con site_id)
    const { error: paymentEventError } = await supabase
      .from('payment_events')
      .insert({
        order_id: order.id,
        site_id: IMPACTO33_SITE_ID,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'succeeded',
        amount: paymentIntent.amount / 100,
      });

    if (paymentEventError) {
      throw new Error(`Error creando payment_event: ${paymentEventError.message}`);
    }

    // 6. Actualizar cart.status (filtrado por site_id)
    await supabase
      .from('carts')
      .update({ status: 'converted_to_order' })
      .eq('id', cartId)
      .eq('site_id', IMPACTO33_SITE_ID);

    // 7. Enviar email de confirmación (integración con servicio de email)
    // await sendOrderConfirmationEmail(userId, order);

    console.log('[StripeOrderHelper] Orden creada exitosamente:', order.id);
    return order.id;
    */

    // Por ahora, solo registramos el evento
    console.log(
      "[StripeOrderHelper] Evento de pago registrado (implementación pendiente)"
    );
    return null;
  } catch (error) {
    console.error("[StripeOrderHelper] Error procesando evento:", error);
    return null;
  }
}

/**
 * Validar firma del webhook de Stripe
 */
export function validateStripeWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  // TODO: Implementar validación de firma
  console.log(
    "[StripeOrderHelper] Validación de firma (implementación pendiente)"
  );
  return false;
}

/**
 * Procesar webhook de Stripe
 */
export async function handleStripeWebhook(event: any): Promise<boolean> {
  try {
    console.log(
      "[StripeOrderHelper] Procesando webhook de Stripe:",
      event.type
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        // TODO: Procesar pago exitoso
        // await createOrderFromStripeEvent(event.data.object);
        break;

      case "payment_intent.payment_failed":
        // TODO: Procesar pago fallido
        console.log("[StripeOrderHelper] Pago fallido:", event.data.object.id);
        break;

      default:
        console.log("[StripeOrderHelper] Evento no procesado:", event.type);
    }

    return true;
  } catch (error) {
    console.error("[StripeOrderHelper] Error procesando webhook:", error);
    return false;
  }
}
