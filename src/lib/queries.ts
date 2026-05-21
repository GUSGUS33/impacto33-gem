import { gql } from '@apollo/client';

export const GET_FULL_VARIABLE_PRODUCT = gql`
  query GetFullVariableProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ... on VariableProduct {
        id
        name
        slug
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        stockQuantity
        shortDescription
        description
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        attributes {
          nodes {
            id
            name
            options
          }
        }
        variations(first: 200) {
          nodes {
            id
            price
            stockStatus
            stockQuantity
            attributes {
              nodes {
                name
                value
              }
            }
            image {
              sourceUrl
            }
          }
        }
        related(first: 4) {
          nodes {
            id
            name
            slug
            ... on VariableProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;


export const GET_PRODUCTS_BY_SLUGS = gql`
  query GetProductsBySlugs($slugs: [String!]!) {
    products(where: { slugIn: $slugs }, first: 100) {
      nodes {
        id
        name
        slug
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          onSale
          stockStatus
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          onSale
          stockStatus
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
          onSale
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on GroupProduct {
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [Int]!) {
    products(where: { include: $ids }, first: 100) {
      nodes {
        id
        name
        slug
        ... on VariableProduct {
          id
          name
          slug
          price
          regularPrice
          salePrice
          onSale
          stockStatus
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on SimpleProduct {
          id
          name
          slug
          price
          regularPrice
          salePrice
          onSale
          stockStatus
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on ExternalProduct {
          id
          name
          slug
          price
          regularPrice
          salePrice
          onSale
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on GroupProduct {
          id
          name
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;
