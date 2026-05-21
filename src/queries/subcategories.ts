import { gql } from "@apollo/client";

/**
 * Query para obtener subcategorías (categorías hijas) de WooCommerce
 * dado el slug o ID de una categoría padre
 */
export const GET_SUBCATEGORIES = gql`
  query GetSubcategories($parentSlug: String, $parentId: ID) {
    productCategories(
      where: { 
        parent: $parentId
        slug: $parentSlug
        hideEmpty: true
      }
      first: 100
    ) {
      nodes {
        id
        databaseId
        name
        slug
        uri
        description
        count
        image {
          id
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

/**
 * Query alternativa: obtener subcategorías por slug del padre
 * (más común en el uso de páginas transaccionales)
 * 
 * Enfoque: Usar productCategory.children que es más directo y compatible
 */
export const GET_SUBCATEGORIES_BY_PARENT_SLUG = gql`
  query GetSubcategoriesByParentSlug($parentSlug: String!) {
    productCategory(id: $parentSlug, idType: SLUG) {
      id
      databaseId
      name
      slug
      children(first: 100, where: { hideEmpty: true }) {
        nodes {
          id
          databaseId
          name
          slug
          uri
          description
          count
          image {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;
