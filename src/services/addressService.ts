import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';

/**
 * Tipos de dirección
 */
export type AddressType = 'billing' | 'shipping' | 'both';

/**
 * Dirección guardada del usuario
 */
export interface UserAddress {
  id: string;
  supabase_user_id: string;
  label: string;
  address_type: AddressType;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  customer_type: 'particular' | 'empresa';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  cif: string | null;
  address: string;
  address_line_2: string | null;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  site_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Datos para crear/actualizar una dirección
 */
export interface AddressFormData {
  label: string;
  address_type: AddressType;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  customer_type: 'particular' | 'empresa';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  cif?: string;
  address: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
}

/**
 * Obtiene todas las direcciones del usuario actual para este site
 */
export async function getUserAddresses(): Promise<{ data: UserAddress[] | null; error: any }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('No hay sesión activa') };
    }

    const siteId = await getSiteId();

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .order('is_default_billing', { ascending: false })
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (err) {
    console.error('[getUserAddresses] Error:', err);
    return { data: null, error: err };
  }
}

/**
 * Obtiene la dirección predeterminada de facturación para este site
 */
export async function getDefaultBillingAddress(): Promise<UserAddress | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const siteId = await getSiteId();

    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('is_default_billing', true)
      .limit(1)
      .maybeSingle();

    return data;
  } catch (err) {
    console.error('[getDefaultBillingAddress] Error:', err);
    return null;
  }
}

/**
 * Obtiene la dirección predeterminada de envío para este site
 */
export async function getDefaultShippingAddress(): Promise<UserAddress | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const siteId = await getSiteId();

    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('is_default_shipping', true)
      .limit(1)
      .maybeSingle();

    return data;
  } catch (err) {
    console.error('[getDefaultShippingAddress] Error:', err);
    return null;
  }
}

/**
 * Crea una nueva dirección con site_id
 */
export async function createAddress(formData: AddressFormData): Promise<{ data: UserAddress | null; error: any }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('No hay sesión activa') };
    }

    const siteId = await getSiteId();

    // Si esta dirección es predeterminada, quitar el flag de las demás (solo para este site)
    if (formData.is_default_billing) {
      await supabase
        .from('user_addresses')
        .update({ is_default_billing: false })
        .eq('supabase_user_id', session.user.id)
        .eq('site_id', siteId)
        .eq('is_default_billing', true);
    }
    if (formData.is_default_shipping) {
      await supabase
        .from('user_addresses')
        .update({ is_default_shipping: false })
        .eq('supabase_user_id', session.user.id)
        .eq('site_id', siteId)
        .eq('is_default_shipping', true);
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        supabase_user_id: session.user.id,
        label: formData.label,
        address_type: formData.address_type,
        is_default_billing: formData.is_default_billing,
        is_default_shipping: formData.is_default_shipping,
        customer_type: formData.customer_type,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name || null,
        cif: formData.cif || null,
        address: formData.address,
        address_line_2: formData.address_line_2 || null,
        postal_code: formData.postal_code,
        city: formData.city,
        province: formData.province,
        country: formData.country || 'España',
        site_id: siteId,
      })
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('[createAddress] Error:', err);
    return { data: null, error: err };
  }
}

/**
 * Actualiza una dirección existente (verificando site_id)
 */
export async function updateAddress(id: string, formData: AddressFormData): Promise<{ data: UserAddress | null; error: any }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('No hay sesión activa') };
    }

    const siteId = await getSiteId();

    // Si esta dirección es predeterminada, quitar el flag de las demás (solo para este site)
    if (formData.is_default_billing) {
      await supabase
        .from('user_addresses')
        .update({ is_default_billing: false })
        .eq('supabase_user_id', session.user.id)
        .eq('site_id', siteId)
        .eq('is_default_billing', true)
        .neq('id', id);
    }
    if (formData.is_default_shipping) {
      await supabase
        .from('user_addresses')
        .update({ is_default_shipping: false })
        .eq('supabase_user_id', session.user.id)
        .eq('site_id', siteId)
        .eq('is_default_shipping', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .update({
        label: formData.label,
        address_type: formData.address_type,
        is_default_billing: formData.is_default_billing,
        is_default_shipping: formData.is_default_shipping,
        customer_type: formData.customer_type,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name || null,
        cif: formData.cif || null,
        address: formData.address,
        address_line_2: formData.address_line_2 || null,
        postal_code: formData.postal_code,
        city: formData.city,
        province: formData.province,
        country: formData.country || 'España',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('[updateAddress] Error:', err);
    return { data: null, error: err };
  }
}

/**
 * Elimina una dirección (verificando site_id)
 */
export async function deleteAddress(id: string): Promise<{ error: any }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { error: sessionError || new Error('No hay sesión activa') };
    }

    const siteId = await getSiteId();

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId);

    return { error };
  } catch (err) {
    console.error('[deleteAddress] Error:', err);
    return { error: err };
  }
}

/**
 * Crea una dirección a partir de los datos de un pedido (auto-guardado post-checkout)
 * Solo crea si no existe una dirección con los mismos datos para este site
 */
export async function saveAddressFromOrder(
  billingAddress: Record<string, any>,
  isFirstOrder: boolean
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const siteId = await getSiteId();

    // Verificar si ya existe una dirección con la misma combinación de datos para este site
    const { data: existing } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('address', billingAddress.address || '')
      .eq('postal_code', billingAddress.postalCode || '')
      .eq('city', billingAddress.city || '')
      .limit(1);

    if (existing && existing.length > 0) {
      return;
    }

    await createAddress({
      label: isFirstOrder ? 'Principal' : `Dirección del pedido`,
      address_type: 'both',
      is_default_billing: isFirstOrder,
      is_default_shipping: isFirstOrder,
      customer_type: billingAddress.customerType || 'particular',
      first_name: billingAddress.firstName || '',
      last_name: billingAddress.lastName || '',
      email: billingAddress.email || '',
      phone: billingAddress.phone || '',
      company_name: billingAddress.companyName || undefined,
      cif: billingAddress.cif || undefined,
      address: billingAddress.address || '',
      address_line_2: billingAddress.addressLine2 || undefined,
      postal_code: billingAddress.postalCode || '',
      city: billingAddress.city || '',
      province: billingAddress.province || '',
      country: billingAddress.country || 'España',
    });
  } catch (err) {
    console.error('[saveAddressFromOrder] Error guardando dirección:', err);
  }
}

/**
 * Valida los datos de una dirección
 */
export function validateAddressForm(data: AddressFormData): string[] {
  const errors: string[] = [];

  if (!data.label.trim()) errors.push('El nombre de la dirección es obligatorio');
  if (!data.first_name.trim()) errors.push('El nombre es obligatorio');
  if (!data.last_name.trim()) errors.push('Los apellidos son obligatorios');
  if (!data.email.trim()) errors.push('El email es obligatorio');
  if (!data.phone.trim()) errors.push('El teléfono es obligatorio');
  if (!data.address.trim()) errors.push('La dirección es obligatoria');
  if (!data.postal_code.trim()) errors.push('El código postal es obligatorio');
  if (!data.city.trim()) errors.push('La ciudad es obligatoria');
  if (!data.province.trim()) errors.push('La provincia es obligatoria');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email.trim() && !emailRegex.test(data.email)) {
    errors.push('El email no es válido');
  }

  const cpRegex = /^\d{5}$/;
  if (data.postal_code.trim() && !cpRegex.test(data.postal_code)) {
    errors.push('El código postal debe tener 5 dígitos');
  }

  if (data.customer_type === 'empresa') {
    if (!data.company_name?.trim()) errors.push('La razón social es obligatoria para empresas');
    if (!data.cif?.trim()) errors.push('El CIF/NIF es obligatorio para empresas');
  }

  return errors;
}
