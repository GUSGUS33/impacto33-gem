/**
 * Query GraphQL optimizada para Google Merchant Center Feed
 * Query SIMPLE sin variaciones para evitar timeouts del servidor WooCommerce
 */

export const MERCHANT_FEED_QUERY = `
  query GetProductsForMerchant($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on SimpleProduct {
          id
          databaseId
          name
          slug
          description
          shortDescription
          type
          featured
          sku
          status
          image {
            sourceUrl
            altText
          }
          price
          regularPrice
          salePrice
          stockStatus
          stockQuantity
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          id
          databaseId
          name
          slug
          description
          shortDescription
          type
          featured
          sku
          status
          image {
            sourceUrl
            altText
          }
          price
          regularPrice
          salePrice
          stockStatus
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on ExternalProduct {
          id
          databaseId
          name
          slug
          description
          shortDescription
          type
          featured
          sku
          status
          image {
            sourceUrl
            altText
          }
          price
          regularPrice
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on GroupProduct {
          id
          databaseId
          name
          slug
          description
          shortDescription
          type
          featured
          status
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

/**
 * Query para obtener variaciones de un producto específico
 * Se usa en queries separadas para productos variables
 */
export const PRODUCT_VARIATIONS_QUERY = `
  query GetProductVariations($id: ID!) {
    product(id: $id) {
      ... on VariableProduct {
        id
        databaseId
        variations(first: 100) {
          nodes {
            id
            databaseId
            name
            description
            sku
            price
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            image {
              sourceUrl
              altText
            }
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Interface para atributos de variación (color, talla, etc.)
 */
export interface VariationAttribute {
  name: string;  // ej: "pa_color", "pa_talla"
  value: string; // ej: "rojo", "m"
}

/**
 * Interface para variaciones de productos
 */
export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  description?: string;
  sku?: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  stockQuantity?: number;
  image?: {
    sourceUrl: string;
    altText?: string;
  };
  attributes?: {
    nodes: VariationAttribute[];
  };
}

/**
 * Interface TypeScript para el producto del feed
 */
export interface MerchantProduct {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: 'SIMPLE' | 'VARIABLE' | 'GROUPED' | 'EXTERNAL';
  status?: string;
  featured: boolean;
  sku?: string;
  image?: {
    sourceUrl: string;
    altText?: string;
  };
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  stockQuantity?: number;
  productCategories?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  // Variaciones (solo para VariableProduct)
  variations?: {
    nodes: ProductVariation[];
  };
}

export interface MerchantFeedResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: MerchantProduct[];
  };
}

export interface ProductVariationsResponse {
  product: {
    id: string;
    databaseId: number;
    variations: {
      nodes: ProductVariation[];
    };
  };
}
