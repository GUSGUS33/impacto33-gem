import { useQuery } from '@apollo/client';
import {
  GET_ALL_TRANSACTIONAL_PAGES,
  GetAllTransactionalPagesResponse,
  TransactionalPageListItem,
  filterTransactionalPages,
} from '@/queries/transactionalPages';
import { useMemo } from 'react';

/**
 * Hook para obtener el listado de páginas transaccionales
 * Filtra automáticamente solo las páginas que usan la plantilla ACF correcta
 */
export function useTransactionalPages() {
  const { data, loading, error } = useQuery<GetAllTransactionalPagesResponse>(
    GET_ALL_TRANSACTIONAL_PAGES,
    {
      fetchPolicy: 'cache-first', // Cachear para evitar llamadas repetidas
    }
  );

  // Filtrar solo páginas transaccionales
  const transactionalPages = useMemo(() => {
    if (!data?.pages?.nodes) return [];
    return filterTransactionalPages(data.pages.nodes);
  }, [data]);

  // Crear un mapa de URI → página para búsqueda rápida
  const pagesByUri = useMemo(() => {
    const map = new Map<string, TransactionalPageListItem>();
    transactionalPages.forEach((page) => {
      // Normalizar URI (quitar / inicial y final)
      const normalizedUri = page.uri.replace(/^\/|\/$/g, '');
      map.set(normalizedUri, page);
    });
    return map;
  }, [transactionalPages]);

  /**
   * Buscar una página por su URI
   * @param uri URI de la página (con o sin / inicial/final)
   * @returns Página encontrada o undefined
   */
  const findPageByUri = (uri: string): TransactionalPageListItem | undefined => {
    const normalizedUri = uri.replace(/^\/|\/$/g, '');
    return pagesByUri.get(normalizedUri);
  };

  return {
    pages: transactionalPages,
    loading,
    error,
    findPageByUri,
    pagesByUri,
  };
}
