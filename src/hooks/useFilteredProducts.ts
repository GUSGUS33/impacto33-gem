import { useQuery } from "@apollo/client";
import { GET_FILTERED_PRODUCTS } from "@/queries/filteredProducts";
import { normalizeSlug } from "@/lib/slugUtils";

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  image: {
    sourceUrl: string;
    altText: string;
  } | null;
  attributes: {
    nodes: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface FilteredProduct {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  type: string;
  onSale: boolean;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  featuredImage: {
    node:{
      sourceUrl: string;
      altText: string;
    };
  } | null;
  productCategories: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  variations?: {
    nodes: ProductVariation[];
  };
}

interface UseFilteredProductsOptions {
  categorySlug?: string | null;
  tagSlug?: string | null;
  limit?: number;
  orderBy?: "DATE" | "PRICE" | "POPULARITY" | "RATING" | "TITLE";
}

interface UseFilteredProductsResult {
  products: FilteredProduct[];
  loading: boolean;
  error: Error | undefined;
}

/**
 * Hook para obtener productos filtrados por categoría y/o etiqueta
 * 
 * Resiliente al SSR: si Apollo no está disponible, devuelve valores por defecto.
 * 
 * @param options - Opciones de filtrado
 * @returns Productos filtrados, estado de carga y error
 */
export function useFilteredProducts(options: UseFilteredProductsOptions): UseFilteredProductsResult {
  const {
    categorySlug,
    tagSlug,
    limit = 20,
    orderBy = "DATE",
  } = options;

  // Normalizar slugs para eliminar caracteres invisibles (tabs, espacios, newlines)
  const cleanCategorySlug = normalizeSlug(categorySlug);
  const cleanTagSlug = normalizeSlug(tagSlug);

  // Determinar orden: ASC para PRICE (precio más bajo primero), DESC para el resto
  const order = orderBy === "PRICE" ? "ASC" : "DESC";

  const { data, loading, error } = useQuery(GET_FILTERED_PRODUCTS, {
    variables: {
      categorySlug: cleanCategorySlug,
      tagSlug: cleanTagSlug,
      first: limit,
      orderby: orderBy,
      order,
    },
    skip: !cleanCategorySlug && !cleanTagSlug,
  });

  const products: FilteredProduct[] = data?.products?.nodes || [];

  return {
    products,
    loading,
    error,
  };
}
