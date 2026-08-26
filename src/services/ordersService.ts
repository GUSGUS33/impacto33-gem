import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  variation_id: number | null;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price_without_vat: number;
  unit_price_with_vat: number;
  total_without_vat: number;
  total_with_vat: number;
  personalization_config: Record<string, any> | null;
  site_id: string | null;
  design_id: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  supabase_user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  currency: string;
  subtotal_without_vat: number;
  vat_amount: number;
  total_with_vat: number;
  billing_address: Record<string, any> | null;
  shipping_address: Record<string, any> | null;
  notes: string | null;
  site_id: string | null;
  cart_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todas las órdenes del usuario actual para este site
 */
export async function getUserOrders(limit = 20): Promise<Order[] | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    const siteId = await getSiteId();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getUserOrders] Error obteniendo órdenes:', error);
      return null;
    }

    return orders || [];
  } catch (err) {
    console.error('[getUserOrders] Error inesperado:', err);
    return null;
  }
}

/**
 * Obtiene los detalles de una orden específica (order_items) filtrado por site
 */
export async function getOrderDetails(orderId: string): Promise<OrderItem[] | null> {
  try {
    const siteId = await getSiteId();

    const { data: items, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getOrderDetails] Error obteniendo detalles:', error);
      return null;
    }

    return items || [];
  } catch (err) {
    console.error('[getOrderDetails] Error inesperado:', err);
    return null;
  }
}

/**
 * Obtiene una orden específica con sus detalles (filtrado por site)
 */
export async function getOrderWithDetails(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  try {
    const siteId = await getSiteId();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('site_id', siteId)
      .single();

    if (orderError || !order) {
      return null;
    }

    const items = await getOrderDetails(orderId);

    return { order, items: items || [] };
  } catch (err) {
    console.error('[getOrderWithDetails] Error inesperado:', err);
    return null;
  }
}

/**
 * Repite un pedido anterior creando un nuevo carrito con los mismos items
 */
export async function repeatOrder(orderId: string): Promise<{ cartId: string; itemsCount: number } | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[repeatOrder] No session found');
      return null;
    }

    const siteId = await getSiteId();

    // 1. Obtener la orden y sus items (ya filtrado por site)
    const orderWithDetails = await getOrderWithDetails(orderId);
    if (!orderWithDetails) {
      console.error('[repeatOrder] Order not found');
      return null;
    }

    const { order, items: orderItems } = orderWithDetails;

    if (!orderItems || orderItems.length === 0) {
      console.error('[repeatOrder] Order has no items');
      return null;
    }

    // 2. Buscar carrito activo existente para este site
    const { data: existingCart, error: fetchCartError } = await supabase
      .from('carts')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('status', 'active')
      .limit(1)
      .single();

    let cartId: string;

    if (!fetchCartError && existingCart) {
      cartId = existingCart.id;

      // Limpiar items existentes
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (deleteError) {
        console.error('[repeatOrder] Error limpiando items del carrito:', deleteError);
        return null;
      }
    } else {
      // Crear nuevo carrito con site_id
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          supabase_user_id: session.user.id,
          woo_customer_id: null,
          status: 'active',
          currency: order.currency || 'EUR',
          subtotal_without_vat: 0,
          vat_amount: 0,
          total_with_vat: 0,
          site_id: siteId,
        })
        .select()
        .single();

      if (createError || !newCart) {
        console.error('[repeatOrder] Error creando carrito:', createError);
        return null;
      }

      cartId = newCart.id;
    }

    // 3. Copiar items del pedido al carrito con site_id
    const cartItemsToInsert = orderItems.map((orderItem) => ({
      cart_id: cartId,
      supabase_user_id: session.user.id,
      product_id: orderItem.product_id,
      variation_id: orderItem.variation_id,
      product_name: orderItem.product_name,
      product_slug: orderItem.product_slug,
      quantity: orderItem.quantity,
      unit_price_without_vat: orderItem.unit_price_without_vat,
      unit_price_with_vat: orderItem.unit_price_with_vat,
      total_without_vat: orderItem.total_without_vat,
      total_with_vat: orderItem.total_with_vat,
      personalization_config: orderItem.personalization_config,
      site_id: siteId,
      design_id: orderItem.design_id || null,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(cartItemsToInsert);

    if (insertError) {
      console.error('[repeatOrder] Error insertando items al carrito:', insertError);
      return null;
    }

    // 4. Actualizar totales del carrito
    const totalWithoutVat = orderItems.reduce((sum, item) => sum + item.total_without_vat, 0);
    const totalWithVat = orderItems.reduce((sum, item) => sum + item.total_with_vat, 0);
    const vatAmount = totalWithVat - totalWithoutVat;

    const { error: updateError } = await supabase
      .from('carts')
      .update({
        subtotal_without_vat: totalWithoutVat,
        vat_amount: vatAmount,
        total_with_vat: totalWithVat,
      })
      .eq('id', cartId);

    if (updateError) {
      console.error('[repeatOrder] Error actualizando totales del carrito:', updateError);
      return null;
    }

    return {
      cartId,
      itemsCount: orderItems.length,
    };
  } catch (err) {
    console.error('[repeatOrder] Error inesperado:', err);
    return null;
  }
}
