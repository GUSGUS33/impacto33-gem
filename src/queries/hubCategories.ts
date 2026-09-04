import { gql } from "@apollo/client";

/**
 * Query para resolver datos de categorías WooCommerce (imagen y URI)
 * para los items del bloque Hub que tienen slugCategoria configurado
 */
export const GET_CATEGORIES_FOR_HUB = gql`
  query GetCategoriesForHub($slugs: [String]!) {
    productCategories(where: { slug: $slugs }, first: 100) {
      nodes {
        id
        name
        slug
        uri
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;
