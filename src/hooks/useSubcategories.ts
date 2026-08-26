import { useQuery } from "@apollo/client";
import { GET_SUBCATEGORIES_BY_PARENT_SLUG } from "@/queries/subcategories";

export interface Subcategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  uri: string;
  description: string | null;
  count: number;
  image: {
    sourceUrl: string;
    altText: string;
  } | null;
}

interface UseSubcategoriesResult {
  subcategories: Subcategory[];
  loading: boolean;
  error: Error | undefined;
}

/**
 * Hook para obtener subcategorías de WooCommerce dado el slug de la categoría padre
 * 
 * @param parentSlug - Slug de la categoría padre (ej: "camisetas-personalizadas")
 * @returns Subcategorías, estado de carga y error
 * 
 * @example
 * ```tsx
 * const { subcategories, loading, error } = useSubcategories("camisetas-personalizadas");
 * ```
 */
export function useSubcategories(parentSlug: string | null | undefined): UseSubcategoriesResult {
  const { data, loading, error } = useQuery(GET_SUBCATEGORIES_BY_PARENT_SLUG, {
    variables: { parentSlug },
    skip: !parentSlug, // No ejecutar query si no hay parentSlug
  });

  // La query retorna productCategory.children.nodes
  const subcategories: Subcategory[] = data?.productCategory?.children?.nodes || [];

  return {
    subcategories,
    loading,
    error,
  };
}
