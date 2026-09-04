import { gql } from "@apollo/client";

/**
 * Query LIGERA para listados de productos por categoría.
 * NO incluye variaciones para evitar timeouts en el servidor WordPress.
 * Las variaciones se cargan solo en la página de detalle del producto (GetFullVariableProduct).
 */
export const GET_FILTERED_PRODUCTS = gql`
  query GetFilteredProducts(
    $categorySlug: String
    $tagSlug: String
    $first: Int = 20
    $orderby: ProductsOrderByEnum = DATE
    $order: OrderEnum = DESC
  ) {
    products(
      where: {
        status: "publish"
        category: $categorySlug
        tag: $tagSlug
        orderby: [{ field: $orderby, order: $order }]
      }
      first: $first
    ) {
      nodes {
        ... on SimpleProduct {
          id
          databaseId
          name
          slug
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
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
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
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

export const GET_PRODUCTS_BY_INCLUDE_IDS = gql`
  query GetProductsByIncludeIds($ids: [Int]!) {
    products(where: { include: $ids, status: "publish" }, first: 100) {
      nodes {
        ... on SimpleProduct {
          id
          databaseId
          name
          slug
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
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
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
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

export const GET_PRODUCT_BY_SKU = gql`
  query GetProductBySku($sku: String!) {
    products(where: { sku: $sku, status: "publish" }, first: 1) {
      nodes {
        ... on SimpleProduct {
          id
          databaseId
          name
          slug
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
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
          type
          onSale
          price
          regularPrice
          salePrice
          featuredImage {
            node {
              sourceUrl
              altText
            }
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
