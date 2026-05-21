import { gql } from "@apollo/client";

/**
 * Query para obtener páginas hijas de WordPress por URI del padre
 * 
 * Uso: Para mostrar subcategorías transaccionales (páginas hijas) en SubcategoriasBlock
 * 
 * Ejemplo:
 * - Padre: /camisetas-personalizadas/
 * - Hijas: /camisetas-personalizadas/ecologicas/, /camisetas-personalizadas/premium/, etc.
 */
export const GET_CHILD_PAGES_BY_PARENT_URI = gql`
  query GetChildPagesByParentURI($parentUri: ID!) {
    page(id: $parentUri, idType: URI) {
      id
      databaseId
      title
      uri
      children(first: 100) {
        nodes {
          ... on Page {
            id
            databaseId
            title
            uri
            slug
            featuredImage {
              node {
                id
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            template {
              templateName
              __typename
            }
          }
        }
      }
    }
  }
`;
