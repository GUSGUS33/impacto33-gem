import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';

export interface CartItem {
  id: string;
  cart_id: string;
  supabase_user_id: string;
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
  updated_at: string;
}

export interface Cart {
  id: string;
  supabase_user_id: string;
  woo_customer_id: string | null;
  status: 'active' | 'converted_to_order' | 'abandoned' | 'cancelled';
  currency: string;
  subtotal_without_vat: number;
  vat_amount: number;
  total_with_vat: number;
  notes: string | null;
  site_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene o crea el carrito activo del usuario para este site
 */
export async function getOrCreateActiveCartForUser(): Promise<Cart | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    const siteId = await getSiteId();

    // Buscar carrito activo existente para este site
    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!fetchError && existingCart) {
      return existingCart;
    }

    // Si no existe, crear uno nuevo con site_id
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({
        supabase_user_id: session.user.id,
        woo_customer_id: null,
        status: 'active',
        currency: 'EUR',
        subtotal_without_vat: 0,
        vat_amount: 0,
        total_with_vat: 0,
        site_id: siteId,
      })
      .select()
      .single();

    if (createError) {
      console.error('[getOrCreateActiveCartForUser] Error creando carrito:', createError);
      return null;
    }

    return newCart;
  } catch (err) {
    console.error('[getOrCreateActiveCartForUser] Error inesperado:', err);
    return null;
  }
}

/**
 * Obtiene el carrito con todos sus items (filtrado por site)
 */
export async function getCartWithItems(cartId: string): Promise<{ cart: Cart; items: CartItem[] } | null> {
  try {
    const siteId = await getSiteId();

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('site_id', siteId)
      .single();

    if (cartError || !cart) {
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('[getCartWithItems] Error obteniendo items:', itemsError);
      return { cart, items: [] };
    }

    return { cart, items: items || [] };
  } catch (err) {
    console.error('[getCartWithItems] Error inesperado:', err);
    return null;
  }
}

/**
 * Añade un item al carrito o actualiza su cantidad si ya existe
 */
export async function addItem({
  cartId,
  productId,
  productName,
  productSlug,
  quantity,
  unitPriceWithVat,
  variationId = null,
}: {
  cartId: string;
  productId: number;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPriceWithVat: number;
  variationId?: number | null;
}): Promise<CartItem | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    const siteId = await getSiteId();

    // Calcular precios (sin IVA = con IVA / 1.21)
    const unitPriceWithoutVat = unitPriceWithVat / 1.21;
    const totalWithVat = unitPriceWithVat * quantity;
    const totalWithoutVat = unitPriceWithoutVat * quantity;

    // Verificar si el item ya existe en este site
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('variation_id', variationId)
      .eq('site_id', siteId)
      .limit(1)
      .single();

    if (existingItem) {
      // Actualizar cantidad
      return updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    // Insertar nuevo item con site_id
    const { data: newItem, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        supabase_user_id: session.user.id,
        product_id: productId,
        variation_id: variationId,
        product_name: productName,
        product_slug: productSlug,
        quantity,
        unit_price_without_vat: unitPriceWithoutVat,
        unit_price_with_vat: unitPriceWithVat,
        total_without_vat: totalWithoutVat,
        total_with_vat: totalWithVat,
        personalization_config: null,
        site_id: siteId,
      })
      .select()
      .single();

    if (error) {
      console.error('[addItem] Error añadiendo item:', error);
      return null;
    }

    // Actualizar totales del carrito
    await updateCartTotals(cartId);

    return newItem;
  } catch (err) {
    console.error('[addItem] Error inesperado:', err);
    return null;
  }
}

/**
 * Actualiza la cantidad de un item del carrito
 */
export async function updateItemQuantity(cartItemId: string, newQuantity: number): Promise<CartItem | null> {
  try {
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return null;
    }

    // Obtener item actual para recalcular totales
    const { data: item, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', cartItemId)
      .single();

    if (fetchError || !item) {
      return null;
    }

    const totalWithVat = item.unit_price_with_vat * newQuantity;
    const totalWithoutVat = item.unit_price_without_vat * newQuantity;

    const { data: updatedItem, error } = await supabase
      .from('cart_items')
      .update({
        quantity: newQuantity,
        total_with_vat: totalWithVat,
        total_without_vat: totalWithoutVat,
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      console.error('[updateItemQuantity] Error actualizando cantidad:', error);
      return null;
    }

    // Actualizar totales del carrito
    if (updatedItem) {
      await updateCartTotals(updatedItem.cart_id);
    }

    return updatedItem;
  } catch (err) {
    console.error('[updateItemQuantity] Error inesperado:', err);
    return null;
  }
}

/**
 * Elimina un item del carrito
 */
export async function removeItem(cartItemId: string): Promise<boolean> {
  try {
    // Obtener item para saber el cart_id
    const { data: item, error: fetchError } = await supabase
      .from('cart_items')
      .select('cart_id')
      .eq('id', cartItemId)
      .single();

    if (fetchError || !item) {
      return false;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('[removeItem] Error eliminando item:', error);
      return false;
    }

    // Actualizar totales del carrito
    await updateCartTotals(item.cart_id);

    return true;
  } catch (err) {
    console.error('[removeItem] Error inesperado:', err);
    return false;
  }
}

/**
 * Vacía completamente el carrito
 */
export async function clearCart(cartId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('[clearCart] Error vaciando carrito:', error);
      return false;
    }

    // Resetear totales
    await supabase
      .from('carts')
      .update({
        subtotal_without_vat: 0,
        vat_amount: 0,
        total_with_vat: 0,
      })
      .eq('id', cartId);

    return true;
  } catch (err) {
    console.error('[clearCart] Error inesperado:', err);
    return false;
  }
}

/**
 * Actualiza los totales del carrito basado en sus items
 */
async function updateCartTotals(cartId: string): Promise<void> {
  try {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('total_with_vat, total_without_vat')
      .eq('cart_id', cartId);

    if (error || !items) {
      return;
    }

    const totalWithoutVat = items.reduce((sum, item) => sum + item.total_without_vat, 0);
    const totalWithVat = items.reduce((sum, item) => sum + item.total_with_vat, 0);
    const vatAmount = totalWithVat - totalWithoutVat;

    await supabase
      .from('carts')
      .update({
        subtotal_without_vat: totalWithoutVat,
        vat_amount: vatAmount,
        total_with_vat: totalWithVat,
      })
      .eq('id', cartId);
  } catch (err) {
    console.error('[updateCartTotals] Error actualizando totales:', err);
  }
}
