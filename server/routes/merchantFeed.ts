/**
 * Endpoint para servir el feed XML de Google Merchant Center
 * Genera items individuales por cada variación de producto
 */

import { Router } from 'express';
import { generateMerchantFeedXML } from '../services/merchantFeedService';
import { 
  MERCHANT_FEED_QUERY, 
  PRODUCT_VARIATIONS_QUERY,
  type MerchantProduct, 
  type MerchantFeedResponse,
  type ProductVariationsResponse,
  type ProductVariation
} from '../graphql/merchantFeedQuery';

const router = Router();

// Caché simple en memoria
let cachedFeed: string | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

/**
 * Obtiene todos los productos de WooCommerce via GraphQL
 * Query simplificada SIN variaciones para evitar timeout
 */
async function fetchAllProducts(): Promise<MerchantProduct[]> {
  const allProducts: MerchantProduct[] = [];
  let hasNextPage = true;
  let after: string | null = null;
  const batchSize = 100;
  
  const graphqlEndpoint = process.env.VITE_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
  
  console.log('[Merchant Feed] Starting to fetch products from:', graphqlEndpoint);
  
  while (hasNextPage) {
    try {
      console.log(`[Merchant Feed] Fetching batch: first=${batchSize}, after=${after}`);
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
        
        console.log(`[Merchant Feed] Fetched ${data.data.products.nodes.length} products. Total so far: ${allProducts.length}`);
      } else {
        hasNextPage = false;
      }
      
    } catch (error) {
      console.error('[Merchant Feed] Error fetching products from WooCommerce:', error);
      hasNextPage = false;
    }
  }
  
  console.log(`[Merchant Feed] Total products fetched: ${allProducts.length}`);
  return allProducts;
}

/**
 * Obtiene las variaciones de un producto variable específico
 */
async function fetchProductVariations(productId: string): Promise<ProductVariation[]> {
  const graphqlEndpoint = process.env.VITE_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
  
  try {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PRODUCT_VARIATIONS_QUERY,
        variables: {
          id: productId
        }
      })
    });
    
    if (!response.ok) {
      console.error(`[Merchant Feed] Failed to fetch variations for product ${productId}: ${response.statusText}`);
      return [];
    }
    
    const data: { data: ProductVariationsResponse } = await response.json();
    
    if (data.data?.product?.variations?.nodes) {
      return data.data.product.variations.nodes;
    }
    
    return [];
    
  } catch (error) {
    console.error(`[Merchant Feed] Error fetching variations for product ${productId}:`, error);
    return [];
  }
}

/**
 * Enriquece productos variables con sus variaciones
 * Procesa en batches pequeños para evitar sobrecarga
 */
async function enrichProductsWithVariations(products: MerchantProduct[]): Promise<MerchantProduct[]> {
  const variableProducts = products.filter(p => p.type === 'VARIABLE');
  
  console.log(`[Merchant Feed] Found ${variableProducts.length} variable products. Fetching variations...`);
  
  // Procesar en batches de 10 productos a la vez para no sobrecargar
  const batchSize = 10;
  let processed = 0;
  
  for (let i = 0; i < variableProducts.length; i += batchSize) {
    const batch = variableProducts.slice(i, i + batchSize);
    
    // Fetch variaciones en paralelo para este batch
    const variationsPromises = batch.map(product => 
      fetchProductVariations(product.id)
    );
    
    const variationsResults = await Promise.all(variationsPromises);
    
    // Asignar variaciones a cada producto
    batch.forEach((product, index) => {
      product.variations = {
        nodes: variationsResults[index]
      };
    });
    
    processed += batch.length;
    console.log(`[Merchant Feed] Enriched ${processed}/${variableProducts.length} variable products with variations`);
  }
  
  console.log(`[Merchant Feed] Finished enriching products with variations`);
  return products;
}

/**
 * Endpoint principal: GET /feeds/google.xml
 */
router.get('/google.xml', async (req, res) => {
  try {
    // Verificar caché
    if (cachedFeed && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('[Merchant Feed] Serving from cache');
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.set('X-Cache-Status', 'HIT');
      return res.send(cachedFeed);
    }
    
    console.log('[Merchant Feed] Cache expired or empty, generating new feed...');
    
    // 1. Obtener todos los productos (sin variaciones)
    let products = await fetchAllProducts();
    
    // 2. Enriquecer productos variables con sus variaciones
    // TEMPORALMENTE DESACTIVADO: Causa timeouts con catálogos grandes
    // products = await enrichProductsWithVariations(products);
    console.log('[Merchant Feed] Skipping variations enrichment for basic feed');
    
    // 3. Generar XML
    const feedXML = generateMerchantFeedXML(products);
    
    // 4. Guardar en caché
    cachedFeed = feedXML;
    cacheTimestamp = Date.now();
    
    console.log('[Merchant Feed] Feed generated and cached successfully');
    
    // 5. Enviar respuesta
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('X-Cache-Status', 'MISS');
    res.send(feedXML);
    
  } catch (error) {
    console.error('[Merchant Feed] Error generating feed:', error);
    res.status(500).send('Error generating feed');
  }
});

/**
 * Endpoint para limpiar caché manualmente
 */
router.post('/google.xml/clear-cache', (req, res) => {
  cachedFeed = null;
  cacheTimestamp = null;
  console.log('[Merchant Feed] Cache cleared manually');
  res.json({ success: true, message: 'Cache cleared successfully' });
});

/**
 * Endpoint para ver estadísticas del feed
 */
router.get('/google.xml/stats', async (req, res) => {
  try {
    const products = await fetchAllProducts();
    const simpleProducts = products.filter(p => p.type === 'SIMPLE').length;
    const variableProducts = products.filter(p => p.type === 'VARIABLE').length;
    
    res.json({
      totalProducts: products.length,
      simpleProducts,
      variableProducts,
      totalFeedItems: products.length, // Se actualizará cuando se implementen variaciones
      cacheStatus: (cachedFeed && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) ? 'valid' : 'expired',
      cacheAge: cacheTimestamp ? Math.floor((Date.now() - cacheTimestamp) / 1000) : null,
      cacheExpiry: cacheTimestamp ? Math.floor((CACHE_DURATION - (Date.now() - cacheTimestamp)) / 1000) : null
    });
  } catch (error) {
    console.error('[Merchant Feed] Error getting stats:', error);
    res.status(500).json({ error: 'Error getting stats' });
  }
});

export default router;
