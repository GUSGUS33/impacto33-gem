/**
 * Router tRPC para Google Merchant Center Feed
 * Endpoint: GET /feeds/google.xml
 */

import { publicProcedure, router } from './_core/trpc';
import { MERCHANT_FEED_QUERY, type MerchantFeedResponse, type MerchantProduct } from './graphql/merchantFeedQuery';
import { generateMerchantFeedXML } from './services/merchantFeedService';

// Caché simple en memoria (15 minutos)
let feedCache: {
  xml: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

/**
 * Obtiene todos los productos desde WooCommerce GraphQL con paginación
 */
async function fetchAllProducts(): Promise<MerchantProduct[]> {
  const allProducts: MerchantProduct[] = [];
  let hasNextPage = true;
  let after: string | null = null;
  const batchSize = 100; // Obtener 100 productos por request
  
  const graphqlEndpoint = process.env.VITE_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
  
  while (hasNextPage) {
    try {
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: MERCHANT_FEED_QUERY,
          variables: {
            first: batchSize,
            after: after
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }
      
      const data: { data: MerchantFeedResponse } = await response.json();
      
      if (data.data?.products?.nodes) {
        allProducts.push(...data.data.products.nodes);
        
        hasNextPage = data.data.products.pageInfo.hasNextPage;
        after = data.data.products.pageInfo.endCursor;
      } else {
        hasNextPage = false;
      }
      
    } catch (error) {
      console.error('Error fetching products from WooCommerce:', error);
      hasNextPage = false;
    }
  }
  
  return allProducts;
}

/**
 * Verifica si el caché es válido
 */
function isCacheValid(): boolean {
  if (!feedCache) return false;
  
  const now = Date.now();
  const cacheAge = now - feedCache.timestamp;
  
  return cacheAge < CACHE_DURATION;
}

/**
 * Router del feed de Google Merchant
 */
export const merchantFeedRouter = router({
  /**
   * Endpoint principal: GET /api/trpc/merchantFeed.getXML
   * Retorna el feed XML completo con todos los productos
   */
  getXML: publicProcedure.query(async () => {
    try {
      // Verificar caché
      if (isCacheValid() && feedCache) {
        console.log('[Merchant Feed] Serving from cache');
        return {
          xml: feedCache.xml,
          cached: true,
          productCount: (feedCache.xml.match(/<item>/g) || []).length
        };
      }
      
      console.log('[Merchant Feed] Generating fresh feed...');
      
      // Obtener todos los productos con paginación
      const products = await fetchAllProducts();
      
      console.log(`[Merchant Feed] Fetched ${products.length} products from WooCommerce`);
      
      // Generar XML
      const xml = generateMerchantFeedXML(products);
      
      // Actualizar caché
      feedCache = {
        xml,
        timestamp: Date.now()
      };
      
      const itemCount = (xml.match(/<item>/g) || []).length;
      
      console.log(`[Merchant Feed] Generated feed with ${itemCount} items`);
      
      return {
        xml,
        cached: false,
        productCount: itemCount
      };
      
    } catch (error) {
      console.error('[Merchant Feed] Error generating feed:', error);
      throw new Error('Failed to generate merchant feed');
    }
  }),
  
  /**
   * Endpoint auxiliar para limpiar caché manualmente
   */
  clearCache: publicProcedure.mutation(() => {
    feedCache = null;
    return { success: true, message: 'Cache cleared successfully' };
  }),
  
  /**
   * Endpoint auxiliar para obtener estadísticas del feed
   */
  getStats: publicProcedure.query(async () => {
    const products = await fetchAllProducts();
    
    const simpleProducts = products.filter(p => p.type === 'SIMPLE').length;
    const variableProducts = products.filter(p => p.type === 'VARIABLE').length;
    const totalItems = products.length;
    
    return {
      totalProducts: products.length,
      simpleProducts,
      variableProducts,
      totalFeedItems: totalItems,
      cacheStatus: isCacheValid() ? 'valid' : 'expired',
      cacheAge: feedCache ? Math.floor((Date.now() - feedCache.timestamp) / 1000) : null
    };
  })
});
