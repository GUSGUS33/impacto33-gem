import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import {
  GET_FILTERED_PRODUCTS,
  GET_PRODUCTS_BY_INCLUDE_IDS,
  GET_PRODUCT_BY_SKU,
} from "@/queries/filteredProducts";
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
  productIds?: number[] | string | null;
  productSkus?: string[] | string | null;
  limit?: number;
  orderBy?: "DATE" | "PRICE" | "POPULARITY" | "RATING" | "TITLE";
}

interface UseFilteredProductsResult {
  products: FilteredProduct[];
  loading: boolean;
  error: Error | undefined;
}

/**
 * Función auxiliar para parsear listas de IDs separados por comas o espacios
 */
function parseIds(input?: number[] | string | null): number[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((id) => Number(id)).filter((n) => !isNaN(n) && n > 0);
  }
  return String(input)
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n) && n > 0);
}

/**
 * Función auxiliar para parsear listas de SKUs separados por comas
 */
function parseSkus(input?: string[] | string | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(input)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Hook para obtener productos filtrados por categoría, etiqueta, IDs y/o SKUs.
 *
 * - Si solo hay IDs o SKUs: los consulta y muestra directamente.
 * - Si hay categoría + IDs/SKUs: los productos manuales se suman al listado sin duplicados.
 * - Si solo hay categoría/etiqueta: se comporta como antes.
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
    productIds,
    productSkus,
    limit = 20,
    orderBy = "DATE",
  } = options;

  const apolloClient = useApolloClient();

  // Normalizar slugs para eliminar caracteres invisibles (tabs, espacios, newlines)
  const cleanCategorySlug = normalizeSlug(categorySlug);
  const cleanTagSlug = normalizeSlug(tagSlug);

  // Parsear IDs y SKUs manuales
  const parsedIds = useMemo(() => parseIds(productIds), [productIds]);
  const parsedSkus = useMemo(() => parseSkus(productSkus), [productSkus]);

  // Serialización para dependencias de useEffect
  const idsKey = parsedIds.join(",");
  const skusKey = parsedSkus.join(",");

  const [manualProducts, setManualProducts] = useState<FilteredProduct[]>([]);
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [manualError, setManualError] = useState<Error | undefined>(undefined);

  // Efecto para buscar productos por ID o por SKU
  useEffect(() => {
    if (parsedIds.length === 0 && parsedSkus.length === 0) {
      setManualProducts([]);
      setManualLoading(false);
      return;
    }

    let isMounted = true;
    setManualLoading(true);
    setManualError(undefined);

    async function fetchManualProducts() {
      try {
        const fetched: FilteredProduct[] = [];

        // 1. Obtener por IDs si existen
        if (parsedIds.length > 0) {
          const res = await apolloClient.query({
            query: GET_PRODUCTS_BY_INCLUDE_IDS,
            variables: { ids: parsedIds },
            fetchPolicy: "cache-first",
          });
          const nodes = (res.data?.products?.nodes || []) as FilteredProduct[];
          fetched.push(...nodes);
        }

        // 2. Obtener por SKUs si existen
        if (parsedSkus.length > 0) {
          const skuPromises = parsedSkus.map(async (sku) => {
            try {
              const res = await apolloClient.query({
                query: GET_PRODUCT_BY_SKU,
                variables: { sku },
                fetchPolicy: "cache-first",
              });
              const nodes = (res.data?.products?.nodes || []) as FilteredProduct[];
              return nodes[0] || null;
            } catch (err) {
              console.warn(`Error buscando producto por SKU "${sku}":`, err);
              return null;
            }
          });

          const skuResults = await Promise.all(skuPromises);
          for (const item of skuResults) {
            if (item) {
              fetched.push(item);
            }
          }
        }

        if (isMounted) {
          setManualProducts(fetched);
          setManualLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error obteniendo productos manuales (IDs/SKUs):", err);
          setManualError(err);
          setManualLoading(false);
        }
      }
    }

    fetchManualProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, skusKey, apolloClient]);

  // Determinar orden: ASC para PRICE (precio más bajo primero), DESC para el resto
  const order = orderBy === "PRICE" ? "ASC" : "DESC";

  const hasCategoryOrTag = Boolean(cleanCategorySlug || cleanTagSlug);

  const { data, loading: catLoading, error: catError } = useQuery(GET_FILTERED_PRODUCTS, {
    variables: {
      categorySlug: cleanCategorySlug,
      tagSlug: cleanTagSlug,
      first: limit,
      orderby: orderBy,
      order,
    },
    skip: !hasCategoryOrTag,
  });

  const categoryProducts: FilteredProduct[] = useMemo(() => {
    return data?.products?.nodes || [];
  }, [data]);

  // Combinar productos: manuales (IDs/SKUs) + categoría (sin duplicados)
  const combinedProducts = useMemo(() => {
    const seenIds = new Set<string | number>();
    const result: FilteredProduct[] = [];

    // Primero los productos manuales (IDs / SKUs) para respetar el orden destacado
    for (const p of manualProducts) {
      const key = p.databaseId || p.id;
      if (key && !seenIds.has(key)) {
        seenIds.add(key);
        result.push(p);
      }
    }

    // Luego sumamos los productos de la categoría si los hay
    for (const p of categoryProducts) {
      const key = p.databaseId || p.id;
      if (key && !seenIds.has(key)) {
        seenIds.add(key);
        result.push(p);
      }
    }

    // Limitar al máximo solicitado si está definido
    return limit ? result.slice(0, limit) : result;
  }, [manualProducts, categoryProducts, limit]);

  // Si no hay categoría/etiqueta, el loading y error dependen únicamente de los manuales
  const loading = hasCategoryOrTag
    ? catLoading || manualLoading
    : manualLoading;

  const error = catError || manualError;

  return {
    products: combinedProducts,
    loading,
    error,
  };
}
