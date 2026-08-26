import { useCallback, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_SEO_PAGE_COMPLETE } from '@/queries/seoPageComplete';

/**
 * Hook para prefetch de páginas transaccionales
 * Precarga datos de GraphQL en caché de Apollo para navegación instantánea
 * 
 * @returns prefetchPage - Función para precargar una página por URI
 * 
 * @example
 * const prefetchPage = usePrefetch();
 * 
 * <Link 
 *   href="/camisetas-personalizadas/ecologicas/"
 *   onMouseEnter={() => prefetchPage('/camisetas-personalizadas/ecologicas/')}
 * >
 *   Camisetas Ecológicas
 * </Link>
 */
export function usePrefetch() {
  const client = useApolloClient();
  const prefetchedPages = useRef<Set<string>>(new Set());

  const prefetchPage = useCallback(
    (uri: string) => {
      // Evitar prefetch duplicado
      if (prefetchedPages.current.has(uri)) {
        return;
      }

      // Marcar como prefetched
      prefetchedPages.current.add(uri);

      // Ejecutar query en background
      client
        .query({
          query: GET_SEO_PAGE_COMPLETE,
          variables: { uri },
          fetchPolicy: 'cache-first', // Usar caché si ya existe
        })
        .catch((error) => {
          // Silenciar errores de prefetch (no críticos)
          console.debug('[Prefetch] Error prefetching page:', uri, error);
          // Remover de prefetched para permitir retry
          prefetchedPages.current.delete(uri);
        });
    },
    [client]
  );

  return prefetchPage;
}
