import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';
import type { Cart, CartItem } from './cartService';

/**
 * Tipos de cliente para facturación
 */
export type CustomerType = 'particular' | 'empresa';

/**
 * Métodos de pago disponibles
 */
export type PaymentMethod = 'card' | 'transfer';

/**
 * Datos de facturación del checkout
 */
export interface BillingData {
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  cif?: string;
  address: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

/**
 * Datos de envío del checkout
 */
export interface ShippingData {
  sameAsBilling: boolean;
  firstName?: string;
  lastName?: string;
  address?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
}

/**
 * Datos completos del checkout
 */
export interface CheckoutData {
  billing: BillingData;
  shipping: ShippingData;
  paymentMethod: PaymentMethod;
  notes?: string;
}

/**
 * Resultado de crear un pedido
 */
export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * Genera un número de pedido único con formato IMP-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `IMP-${datePart}-${randomPart}`;
}

/**
 * Lista de provincias españolas para el selector
 */
export const SPANISH_PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias',
  'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz',
  'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Illes Balears', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida',
  'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense',
  'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
];

/**
 * Crea un pedido a partir del carrito actual
 */
export async function createOrder(
  cart: Cart,
  items: CartItem[],
  checkoutData: CheckoutData
): Promise<CreateOrderResult> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { success: false, error: 'No se pudo verificar tu sesión. Inicia sesión de nuevo.' };
    }

    if (items.length === 0) {
      return { success: false, error: 'El carrito está vacío.' };
    }

    const siteId = await getSiteId();
    const orderNumber = generateOrderNumber();

    // Construir dirección de facturación
    const billingAddress = {
      customerType: checkoutData.billing.customerType,
      firstName: checkoutData.billing.firstName,
      lastName: checkoutData.billing.lastName,
      email: checkoutData.billing.email,
      phone: checkoutData.billing.phone,
      companyName: checkoutData.billing.companyName || null,
      cif: checkoutData.billing.cif || null,
      address: checkoutData.billing.address,
      addressLine2: checkoutData.billing.addressLine2 || null,
      postalCode: checkoutData.billing.postalCode,
      city: checkoutData.billing.city,
      province: checkoutData.billing.province,
      country: checkoutData.billing.country || 'España',
    };

    // Construir dirección de envío
    const shippingAddress = checkoutData.shipping.sameAsBilling
      ? {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          address: billingAddress.address,
          addressLine2: billingAddress.addressLine2,
          postalCode: billingAddress.postalCode,
          city: billingAddress.city,
          province: billingAddress.province,
          country: billingAddress.country,
          phone: billingAddress.phone,
        }
      : {
          firstName: checkoutData.shipping.firstName || '',
          lastName: checkoutData.shipping.lastName || '',
          address: checkoutData.shipping.address || '',
          addressLine2: checkoutData.shipping.addressLine2 || null,
          postalCode: checkoutData.shipping.postalCode || '',
          city: checkoutData.shipping.city || '',
          province: checkoutData.shipping.province || '',
          country: checkoutData.shipping.country || 'España',
          phone: checkoutData.shipping.phone || billingAddress.phone,
        };

    // 1. Crear la orden con site_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        supabase_user_id: session.user.id,
        order_number: orderNumber,
        status: checkoutData.paymentMethod === 'transfer' ? 'pending' : 'processing',
        currency: cart.currency || 'EUR',
        subtotal_without_vat: cart.subtotal_without_vat,
        vat_amount: cart.vat_amount,
        total_with_vat: cart.total_with_vat,
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        payment_method: checkoutData.paymentMethod,
        notes: checkoutData.notes || null,
        site_id: siteId,
        cart_id: cart.id,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('[createOrder] Error creando orden:', orderError);
      return { success: false, error: 'Error al crear el pedido. Inténtalo de nuevo.' };
    }

    // 2. Copiar items del carrito a order_items con site_id
    const orderItems = items.map((item) => ({
      order_id: order.id,
      supabase_user_id: session.user.id,
      product_id: item.product_id,
      variation_id: item.variation_id,
      product_name: item.product_name,
      product_slug: item.product_slug,
      quantity: item.quantity,
      unit_price_without_vat: item.unit_price_without_vat,
      unit_price_with_vat: item.unit_price_with_vat,
      total_without_vat: item.total_without_vat,
      total_with_vat: item.total_with_vat,
      personalization_config: item.personalization_config,
      site_id: siteId,
      design_id: item.design_id || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[createOrder] Error insertando items:', itemsError);
      // Intentar limpiar la orden creada
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: 'Error al guardar los productos del pedido.' };
    }

    // 3. Marcar el carrito como convertido
    await supabase
      .from('carts')
      .update({ status: 'converted_to_order' })
      .eq('id', cart.id);

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (err) {
    console.error('[createOrder] Error inesperado:', err);
    return { success: false, error: 'Error inesperado. Inténtalo de nuevo.' };
  }
}

/**
 * Valida los datos de facturación
 */
export function validateBillingData(data: BillingData): string[] {
  const errors: string[] = [];

  if (!data.firstName.trim()) errors.push('El nombre es obligatorio');
  if (!data.lastName.trim()) errors.push('Los apellidos son obligatorios');
  if (!data.email.trim()) errors.push('El email es obligatorio');
  if (!data.phone.trim()) errors.push('El teléfono es obligatorio');
  if (!data.address.trim()) errors.push('La dirección es obligatoria');
  if (!data.postalCode.trim()) errors.push('El código postal es obligatorio');
  if (!data.city.trim()) errors.push('La ciudad es obligatoria');
  if (!data.province.trim()) errors.push('La provincia es obligatoria');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email.trim() && !emailRegex.test(data.email)) {
    errors.push('El email no es válido');
  }

  const cpRegex = /^\d{5}$/;
  if (data.postalCode.trim() && !cpRegex.test(data.postalCode)) {
    errors.push('El código postal debe tener 5 dígitos');
  }

  if (data.customerType === 'empresa') {
    if (!data.companyName?.trim()) errors.push('La razón social es obligatoria para empresas');
    if (!data.cif?.trim()) errors.push('El CIF/NIF es obligatorio para empresas');
  }

  return errors;
}

/**
 * Valida los datos de envío
 */
export function validateShippingData(data: ShippingData): string[] {
  if (data.sameAsBilling) return [];

  const errors: string[] = [];

  if (!data.firstName?.trim()) errors.push('El nombre de envío es obligatorio');
  if (!data.lastName?.trim()) errors.push('Los apellidos de envío son obligatorios');
  if (!data.address?.trim()) errors.push('La dirección de envío es obligatoria');
  if (!data.postalCode?.trim()) errors.push('El código postal de envío es obligatorio');
  if (!data.city?.trim()) errors.push('La ciudad de envío es obligatoria');
  if (!data.province?.trim()) errors.push('La provincia de envío es obligatoria');

  const cpRegex = /^\d{5}$/;
  if (data.postalCode?.trim() && !cpRegex.test(data.postalCode)) {
    errors.push('El código postal de envío debe tener 5 dígitos');
  }

  return errors;
}
