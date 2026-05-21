import { useQuery } from '@apollo/client';
import {
  GET_SEO_PAGE_COMPLETE,
  GetSeoPageCompleteResponse,
  GetSeoPageCompleteVariables,
  PageBlock,
} from '@/queries/seoPageComplete';
import { useMemo } from 'react';

/**
 * Hook para obtener el detalle completo de una página transaccional
 * @param databaseId ID de la página en WordPress
 */
export function useTransactionalPage(databaseId: number | null) {
  const { data, loading, error } = useQuery<
    GetSeoPageCompleteResponse,
    GetSeoPageCompleteVariables
  >(GET_SEO_PAGE_COMPLETE, {
    variables: { id: databaseId! },
    skip: !databaseId, // No ejecutar si no hay ID
    fetchPolicy: 'cache-first',
  });

  // Filtrar bloques que tienen contenido (no null)
  const filteredBlocks = useMemo(() => {
    if (!data?.page?.pageBlocks?.pageBlocks) return [];

    return data.page.pageBlocks.pageBlocks.filter((block) => {
      // Un bloque tiene contenido si al menos uno de sus campos no es null/undefined
      return hasBlockContent(block);
    });
  }, [data]);

  return {
    page: data?.page,
    blocks: filteredBlocks,
    loading,
    error,
  };
}

/**
 * Verifica si un bloque tiene contenido válido
 * Un bloque se considera válido si tiene al menos un campo con contenido
 */
function hasBlockContent(block: PageBlock): boolean {
  const { blockType, ...fields } = block;

  // Verificar si hay al menos un campo con valor
  for (const value of Object.values(fields)) {
    if (value !== null && value !== undefined) {
      // Si es un array, verificar que tenga elementos
      if (Array.isArray(value)) {
        if (value.length > 0) return true;
      }
      // Si es un objeto, verificar que tenga propiedades
      else if (typeof value === 'object') {
        if (Object.keys(value).length > 0) return true;
      }
      // Si es un string, verificar que no esté vacío
      else if (typeof value === 'string') {
        if (value.trim() !== '') return true;
      }
      // Cualquier otro valor no null/undefined
      else {
        return true;
      }
    }
  }

  return false;
}
