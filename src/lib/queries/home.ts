export const QUERY_GET_HOME_PAGE = `
  query GetHomePage {
    page(id: "/", idType: URI) {
      id
      title
      bloquesHome {
        homeblocks {
          __typename
          ... on BloquesHomeHomeblocksHeroSliderLayout {
            slides {
              imagenFondo { node { sourceUrl altText } }
              badge
              titulo
              subtitulo
              ctaTexto
              ctaUrl
            }
          }
          ... on BloquesHomeHomeblocksGridCategoriasLayout {
            titulo
            subtitulo
            columnas
            categorias {
              slugCategoria
              labelPersonalizado
              imagenOverride { node { sourceUrl altText } }
            }
          }
          ... on BloquesHomeHomeblocksProductosDestacadosLayout {
            titulo
            subtitulo
            modo
            slugCategoria
            productIds
            cantidad
            mostrarPrecio
            layoutProductos
          }
          ... on BloquesHomeHomeblocksBannerTextoImagenLayout {
            imagen { node { sourceUrl altText } }
            badge
            titulo
            subtitulo
            ctaTexto
            ctaUrl
            posicionTexto
            colorFondo
          }
          ... on BloquesHomeHomeblocksBannerDobleLayout {
            titulo
            banners {
              imagen { node { sourceUrl altText } }
              badge
              titulo
              subtitulo
              ctaTexto
              ctaUrl
            }
          }
          ... on BloquesHomeHomeblocksTabsProductosLayout {
            titulo
            tabs {
              label
              slugCategoria
              cantidad
            }
          }
          ... on BloquesHomeHomeblocksResenasLayout {
            titulo
            tipo
            elfsightId
          }
          ... on BloquesHomeHomeblocksCtaFinalLayout {
            titulo
            subtitulo
            textoBoton
            urlBoton
            colorFondo
          }
          ... on BloquesHomeHomeblocksNewsletterLayout {
            titulo
            subtitulo
            placeholderEmail
            textoBoton
            imagen { node { sourceUrl altText } }
          }
        }
      }
    }
  }
`;

export type HomeBlockType = 
  | 'BloquesHomeHomeblocksHeroSliderLayout'
  | 'BloquesHomeHomeblocksGridCategoriasLayout'
  | 'BloquesHomeHomeblocksProductosDestacadosLayout'
  | 'BloquesHomeHomeblocksBannerTextoImagenLayout'
  | 'BloquesHomeHomeblocksBannerDobleLayout'
  | 'BloquesHomeHomeblocksTabsProductosLayout'
  | 'BloquesHomeHomeblocksResenasLayout'
  | 'BloquesHomeHomeblocksCtaFinalLayout'
  | 'BloquesHomeHomeblocksNewsletterLayout';

export interface HomeBlock {
  __typename: HomeBlockType;
  [key: string]: any;
}

export const first = (v?: string[] | string | null) =>
  Array.isArray(v) ? v[0] ?? null : v ?? null;
