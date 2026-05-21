import { gql } from "@apollo/client";

export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    productCategories(first: 100) {
      nodes {
        id
        name
        slug
        count
        parentId
        children {
          nodes {
            id
            name
            slug
            count
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory(
    $categorySlug: String!, 
    $first: Int!, 
    $after: String,
    $minPrice: Float,
    $maxPrice: Float
  ) {
    products(
      where: { 
        category: $categorySlug,
        minPrice: $minPrice,
        maxPrice: $maxPrice
      }, 
      first: $first, 
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($first: Int!) {
    products(where: { featured: true }, first: $first) {
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
  }
`;
