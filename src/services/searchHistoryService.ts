import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';

interface SearchHistoryRecord {
  id: string;
  created_at: string;
  supabase_user_id: string;
  woo_customer_id: string | null;
  query: string;
  site_id: string | null;
}

/**
 * Registra una búsqueda en el historial del usuario para este site
 * Evita duplicados muy recientes (misma query en los últimos 5 minutos)
 */
export async function trackSearch(query: string): Promise<boolean> {
  try {
    if (!query || query.trim().length === 0) {
      return false;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.warn('[trackSearch] Usuario no autenticado');
      return false;
    }

    const siteId = await getSiteId();
    const normalizedQuery = query.toLowerCase().trim();

    // Verificar si existe una búsqueda idéntica en los últimos 5 minutos para este site
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: recentSearch } = await supabase
      .from('search_history')
      .select('id')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .eq('query', normalizedQuery)
      .gte('created_at', fiveMinutesAgo)
      .limit(1)
      .single();

    if (recentSearch) {
      return true;
    }

    const { error } = await supabase.from('search_history').insert({
      supabase_user_id: session.user.id,
      woo_customer_id: null,
      query: normalizedQuery,
      site_id: siteId,
    });

    if (error) {
      console.error('[trackSearch] Error registrando búsqueda:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[trackSearch] Error inesperado:', err);
    return false;
  }
}

/**
 * Obtiene las búsquedas recientes únicas del usuario para este site
 */
export async function getRecentSearches(limit: number = 5): Promise<SearchHistoryRecord[]> {
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
      .from('search_history')
      .select('*')
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getRecentSearches] Error obteniendo búsquedas:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[getRecentSearches] Error inesperado:', err);
    return [];
  }
}

/**
 * Limpia todo el historial de búsquedas del usuario para este site
 */
export async function clearSearchHistory(): Promise<boolean> {
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
      .from('search_history')
      .delete()
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId);

    if (error) {
      console.error('[clearSearchHistory] Error limpiando historial:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[clearSearchHistory] Error inesperado:', err);
    return false;
  }
}

/**
 * Elimina una búsqueda específica del historial
 */
export async function deleteSearchHistoryItem(searchId: string): Promise<boolean> {
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
      .from('search_history')
      .delete()
      .eq('id', searchId)
      .eq('supabase_user_id', session.user.id)
      .eq('site_id', siteId);

    if (error) {
      console.error('[deleteSearchHistoryItem] Error eliminando búsqueda:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[deleteSearchHistoryItem] Error inesperado:', err);
    return false;
  }
}
