import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';

export interface TrackProductViewInput {
  productId: number;
  productSlug: string;
}

/**
 * Registra una vista de producto en public.viewed_products
 * Solo funciona si el usuario está autenticado
 */
export async function trackProductView(input: TrackProductViewInput): Promise<void> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return;
    }

    const siteId = await getSiteId();
    const { productId, productSlug } = input;

    const { error } = await supabase.from('viewed_products').insert({
      supabase_user_id: session.user.id,
      product_id: productId,
      product_slug: productSlug,
      site_id: siteId,
    });

    if (error) {
      console.error('[trackProductView] Error registrando vista:', error);
      return;
    }
  } catch (err) {
    console.error('[trackProductView] Error inesperado:', err);
  }
}

/**
 * Obtiene los últimos N productos visitados por el usuario actual para este site
 */
export async function getViewedProducts(limit: number = 8): Promise<
  Array<{
    id: number;
    product_id: number;
    product_slug: string;
    created_at: string;
  }>
> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return [];
    }

    const siteId = await getSiteId();

    const { data, error } = await supabase
      .from('viewed_products')
      .select('id, product_id, product_slug, created_at')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getViewedProducts] Error obteniendo productos visitados:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[getViewedProducts] Error inesperado:', err);
    return [];
  }
}

/**
 * Limpia el historial de productos visitados del usuario actual para este site
 */
export async function clearViewedProducts(): Promise<boolean> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return false;
    }

    const siteId = await getSiteId();

    const { error } = await supabase
      .from('viewed_products')
      .delete()
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId);

    if (error) {
      console.error('[clearViewedProducts] Error limpiando historial:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[clearViewedProducts] Error inesperado:', err);
    return false;
  }
}
