/**
 * Endpoint de debugging para probar GraphQL
 */

import { Router, Request, Response } from 'express';

const router = Router();

router.get('/test-graphql', async (req: Request, res: Response) => {
  try {
    const graphqlEndpoint = process.env.VITE_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
    
    const query = `
      query {
        products(first: 5, where: { status: "publish" }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            databaseId
            name
            slug
            description
            type
            image {
              sourceUrl
            }
            ... on SimpleProduct {
              price
              regularPrice
              stockStatus
            }
          }
        }
      }
    `;
    
    console.log('[Debug] Fetching from:', graphqlEndpoint);
    console.log('[Debug] Query:', query);
    
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    console.log('[Debug] Response status:', response.status);
    console.log('[Debug] Response ok:', response.ok);
    
    const data = await response.json();
    
    console.log('[Debug] Response data:', JSON.stringify(data, null, 2));
    
    res.json({
      endpoint: graphqlEndpoint,
      status: response.status,
      ok: response.ok,
      data
    });
    
  } catch (error: any) {
    console.error('[Debug] Error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
