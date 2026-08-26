import { useEffect, useState } from 'react';
import { getRecentSearches } from '@/services/searchHistoryService';
import { useAuth } from '@/context/AuthContext';

interface SearchHistoryRecord {
  id: string;
  created_at: string;
  supabase_user_id: string;
  woo_customer_id: string | null;
  query: string;
}

/**
 * Hook que obtiene las búsquedas recientes del usuario autenticado
 * @param limit - Número máximo de búsquedas a obtener (default: 5)
 * @returns { searches, loading, error, isEmpty }
 */
export function useRecentSearches(limit: number = 5) {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SearchHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSearches([]);
      return;
    }

    setLoading(true);
    setError(null);

    getRecentSearches(limit)
      .then((data) => {
        setSearches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useRecentSearches] Error:', err);
        setError(err);
        setLoading(false);
      });
  }, [user, limit]);

  return {
    searches,
    loading,
    error,
    isEmpty: !loading && searches.length === 0,
  };
}
