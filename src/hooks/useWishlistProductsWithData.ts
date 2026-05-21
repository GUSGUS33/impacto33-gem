import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_IDS } from '@/lib/queries';
import { getWishlistForCurrentUser } from '@/services/wishlistService';
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
  addedAt: string;
}

/**
 * Hook que obtiene los favoritos del usuario con datos reales de WooCommerce
 * @param limit - Número máximo de productos a obtener (default: 8)
 * @returns { products, loading, error }
 */
export function useWishlistProductsWithData(limit: number = 8) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistMetadata, setWishlistMetadata] = useState<Map<number, string>>(new Map());
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // Paso 1: Obtener IDs de favoritos desde Supabase
  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    setIsLoadingWishlist(true);
    getWishlistForCurrentUser(limit)
      .then((wishlistProducts) => {
        // Eliminar duplicados y extraer IDs únicos
        const uniqueIds = Array.from(
          new Map(
            wishlistProducts.map((p) => [p.productId, p.createdAt])
          ).entries()
        ).map(([id]) => id);

        // Guardar metadata de fecha de adición
        const metadata = new Map<number, string>();
        wishlistProducts.forEach((p) => {
          metadata.set(p.productId, p.createdAt || '');
        });

        setWishlistIds(uniqueIds);
        setWishlistMetadata(metadata);
        setIsLoadingWishlist(false);
      })
      .catch((err) => {
        console.error('[useWishlistProductsWithData] Error obteniendo wishlist:', err);
        setWishlistIds([]);
        setIsLoadingWishlist(false);
      });
  }, [user, limit]);

  // Paso 2: Obtener datos de productos desde GraphQL usando IDs
  const {
    data: graphqlData,
    loading: isLoadingGraphQL,
    error: graphqlError,
  } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: wishlistIds },
    skip: wishlistIds.length === 0, // No hacer query si no hay IDs
  });

  // Paso 3: Combinar datos y mantener orden original
  const products: ProductWithMetadata[] = [];
  if (graphqlData?.products?.nodes) {
    // Mantener el orden original de wishlist (más recientes primero)
    wishlistIds.forEach((id) => {
      const product = graphqlData.products.nodes.find(
        (p: ProductNode) => {
          // Extraer el ID numérico del formato GraphQL (gid://shopify/Product/123)
          const productIdMatch = p.id.match(/\/(\d+)$/);
          const numericId = productIdMatch ? parseInt(productIdMatch[1], 10) : null;
          return numericId === id;
        }
      );
      if (product) {
        products.push({
          ...product,
          addedAt: wishlistMetadata.get(id) || '',
        });
      }
    });
  }

  return {
    products,
    loading: isLoadingWishlist || isLoadingGraphQL,
    error: graphqlError,
    isEmpty: !isLoadingWishlist && !isLoadingGraphQL && products.length === 0,
  };
}
