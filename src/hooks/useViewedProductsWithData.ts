import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_SLUGS } from '@/lib/queries';
import { getViewedProducts } from '@/services/trackingService';
import { useAuth } from '@/context/AuthContext';

interface ProductNode {
  id: string;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  stockStatus: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

interface ProductWithMetadata extends ProductNode {
  viewedAt: string;
}

/**
 * Hook que obtiene los últimos productos visitados del usuario con datos reales de WooCommerce
 * @param limit - Número máximo de productos a obtener (default: 8)
 * @returns { products, loading, error }
 */
export function useViewedProductsWithData(limit: number = 8) {
  const { user } = useAuth();
  const [viewedSlugs, setViewedSlugs] = useState<string[]>([]);
  const [viewedMetadata, setViewedMetadata] = useState<Map<string, string>>(new Map());
  const [isLoadingViewed, setIsLoadingViewed] = useState(false);

  // Paso 1: Obtener slugs de productos visitados desde Supabase
  useEffect(() => {
    if (!user) {
      setViewedSlugs([]);
      return;
    }

    setIsLoadingViewed(true);
    getViewedProducts(limit)
      .then((viewedProducts) => {
        // Eliminar duplicados y extraer slugs únicos
        const uniqueSlugs = Array.from(
          new Map(
            viewedProducts.map((p) => [p.product_slug, p.created_at])
          ).entries()
        ).map(([slug]) => slug);

        // Guardar metadata de fecha de vista
        const metadata = new Map<string, string>();
        viewedProducts.forEach((p) => {
          metadata.set(p.product_slug, p.created_at);
        });

        setViewedSlugs(uniqueSlugs);
        setViewedMetadata(metadata);
        setIsLoadingViewed(false);
      })
      .catch((err) => {
        console.error('[useViewedProductsWithData] Error obteniendo viewed_products:', err);
        setViewedSlugs([]);
        setIsLoadingViewed(false);
      });
  }, [user, limit]);

  // Paso 2: Obtener datos de productos desde GraphQL
  const {
    data: graphqlData,
    loading: isLoadingGraphQL,
    error: graphqlError,
  } = useQuery(GET_PRODUCTS_BY_SLUGS, {
    variables: { slugs: viewedSlugs },
    skip: viewedSlugs.length === 0, // No hacer query si no hay slugs
  });

  // Paso 3: Combinar datos y mantener orden original
  const products: ProductWithMetadata[] = [];
  if (graphqlData?.products?.nodes) {
    // Mantener el orden original de viewed_products
    viewedSlugs.forEach((slug) => {
      const product = graphqlData.products.nodes.find(
        (p: ProductNode) => p.slug === slug
      );
      if (product) {
        products.push({
          ...product,
          viewedAt: viewedMetadata.get(slug) || '',
        });
      }
    });
  }

  return {
    products,
    loading: isLoadingViewed || isLoadingGraphQL,
    error: graphqlError,
    isEmpty: !isLoadingViewed && !isLoadingGraphQL && products.length === 0,
  };
}
