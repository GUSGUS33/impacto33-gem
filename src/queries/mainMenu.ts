import { gql } from "@apollo/client";

/**
 * Query para obtener el menú principal de WordPress via WPGraphQL
 * 
 * Usa parentId: 0 para obtener solo items de nivel superior,
 * evitando el límite de 100 items de WPGraphQL.
 * Los hijos se obtienen anidados via childItems.
 * 
 * Estructura esperada:
 * - Nivel 1: Agrupadores visuales (Ropa Personalizada, Bolsas y Mochilas, etc.)
 * - Nivel 2: Categorías/columnas del dropdown (Camisetas, Sudaderas, etc.)
 * - Nivel 3: Sub-items de cada columna (Manga corta, Manga larga, etc.)
 */
export const GET_MAIN_MENU = gql`
  query GetMainMenu {
    menu(id: "menu-principal", idType: SLUG) {
      menuItems(first: 100, where: { parentId: 0 }) {
        nodes {
          id
          label
          uri
          childItems(first: 100) {
            nodes {
              id
              label
              uri
              childItems(first: 100) {
                nodes {
                  id
                  label
                  uri
                  connectedNode {
                    node {
                      ... on Page {
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
          }
        }
      }
    }
  }
`;
