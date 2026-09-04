/**
 * Helper para hacer fetch directo a WordPress GraphQL desde Server Components.
 * NO usa Apollo Client (que es client-side). Usa fetch nativo de Node.js.
 *
 * En Server Components de Next.js, fetch() tiene soporte nativo para:
 * - Deduplicación automática de requests
 * - Revalidación con ISR (next: { revalidate })
 * - Caching en el Data Cache de Next.js
 */

const WP_GRAPHQL_URL =
  process.env.VITE_WP_GRAPHQL_URL || "https://creativu.es/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Ejecuta una query GraphQL contra WordPress.
 * Usa fetch nativo con revalidación ISR de Next.js.
 *
 * @param query - Query GraphQL como string
 * @param variables - Variables de la query
 * @param revalidate - Segundos para ISR (default: 3600 = 1 hora)
 */
export async function wpGraphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate: number = 3600,
  attempt: number = 1
): Promise<T> {
  try {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Origin: "https://creativu.es",
        Referer: "https://creativu.es/",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });

    if (!res.ok) {
      if (res.status >= 500 && attempt < 2) {
        console.warn(`[wpGraphqlFetch] Status ${res.status}, retrying...`);
        await new Promise((r) => setTimeout(r, 600));
        return wpGraphqlFetch<T>(query, variables, revalidate, attempt + 1);
      }
      throw new Error(
        `WordPress GraphQL error: ${res.status} ${res.statusText}`
      );
    }

    const json: GraphQLResponse<T> = await res.json();

    if (json.errors?.length) {
      console.error("[wpGraphqlFetch] GraphQL errors:", json.errors);
      throw new Error(json.errors[0].message);
    }

    return json.data;
  } catch (err: any) {
    if (attempt < 2) {
      console.warn(`[wpGraphqlFetch] Catch error (${err?.message}), retrying...`);
      await new Promise((r) => setTimeout(r, 600));
      return wpGraphqlFetch<T>(query, variables, revalidate, attempt + 1);
    }
    throw err;
  }
}

// ─── Queries reutilizables ──────────────────────────────────────────────────

/**
 * Query para obtener el listado de todas las páginas transaccionales.
 * Usada en generateStaticParams() para generar rutas estáticas.
 */
export const QUERY_ALL_TRANSACTIONAL_PAGES = `
  query GetAllTransactionalPages($after: String) {
    pages(
      where: { status: PUBLISH, hasPassword: false }
      first: 100
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        databaseId
        title
        slug
        uri
        template {
          templateName
          __typename
        }
        heroPageSeo {
          tituloPrincipal
          intro
        }
        seoMeta {
          metaDescription
        }
      }
    }
  }
`;

/**
 * Fetches ALL transactional pages with automatic pagination.
 * WordPress GraphQL limits to 100 per request, so we paginate.
 */
export async function fetchAllTransactionalPages(): Promise<TransactionalPageListItem[]> {
  let allNodes: TransactionalPageListItem[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    type PaginatedPagesResponse = {
      pages: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: TransactionalPageListItem[];
      };
    };
    
    try {
      const data: PaginatedPagesResponse = await wpGraphqlFetch<PaginatedPagesResponse>(
        QUERY_ALL_TRANSACTIONAL_PAGES,
        after ? { after } : {}
      );

      allNodes = allNodes.concat(data.pages.nodes);
      hasNextPage = data.pages.pageInfo.hasNextPage;
      after = data.pages.pageInfo.endCursor ?? null;
    } catch (error) {
      console.error("Error fetching transactional pages:", error);
      hasNextPage = false;
    }
  }

  return allNodes;
}

/**
 * Query completa para obtener todos los datos de una página transaccional.
 * Incluye hero, SEO meta, y todos los bloques dinámicos.
 */
export const QUERY_SEO_PAGE_COMPLETE = `
  query GetSeoPageComplete($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      title
      slug
      uri
      parent {
        node {
          ... on Page {
            id
            uri
          }
        }
      }
      heroPageSeo {
        tituloPrincipal
        intro
      }
      seoMeta {
        metaDescription
        canonicalUrl
        schemaType
        openGraph {
          title
          description
          image {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
        breadcrumbsConfig {
          show
          customPath {
            label
            url
          }
        }
        indexConfig {
          index
          follow
        }
      }
      pageBlocks {
        pageBlocks {
          blockType
          videoTitulo
          videoDescripcion
          videoUrl
          videoCtaTexto
          videoCtaUrl
          iconosTitulo
          iconosColumnas {
            icono {
              node {
                sourceUrl
                altText
              }
            }
            titulo
            descripcion
          }
          galeriaTitulo
          galeriaDescripcion
          galeriaImagenes {
            nodes {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          htmlTitulo
          htmlContenido
          productosVendidosTitulo
          productosVendidosLimite
          productosVendidosOrdenar
          productosDestacadosTitulo
          productosDestacadosProductos {
            nodes {
              ... on SimpleProduct {
                id
                databaseId
                name
                slug
              }
              ... on VariableProduct {
                id
                databaseId
                name
                slug
              }
            }
          }
          productosDestacadosBadges {
            productoId
            badge
          }
          productosDinamicosTitulo
          productosDinamicosCategoria
          productosDinamicosEtiqueta
          productosDinamicosSkus
          productosDinamicosIds
          productosDinamicosMaximo
          productosDinamicosOrdenar
          subcategoriasTitulo
          subcategoriasParent
          subcategoriasLayout
          subcategoriasMostrarContador
          faqTitulo
          faqItems {
            pregunta
            respuesta
          }
          casosusoTitulo
          casosusoItems {
            titulo
            descripcion
            imagen {
              node {
                sourceUrl
                altText
              }
            }
          }
          usoscomunesTitulo
          usoscomunesItems {
            nombre
            descripcion
            imagen {
              node {
                sourceUrl
                altText
              }
            }
          }
          interlinkingTitulo
          interlinkingItems {
            texto
            url
          }
          blogsliderTitulo
          blogsliderCategoria {
            nodes {
              slug
              name
            }
          }
          blogsliderPosts {
            nodes {
              ... on Post {
                id
                title
                slug
                uri
                excerpt
                date
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
              }
            }
          }
          ctasecundarioTitulo
          ctasecundarioDescripcion
          ctasecundarioTexto
          ctasecundarioUrl
          testimoniosTitulo
          testimoniosItems {
            nombre
            empresa
            testimonio
            rating
            verificado
            foto {
              node {
                sourceUrl
                altText
              }
            }
          }
          trustbadgesItems {
            icono {
              node {
                sourceUrl
                altText
              }
            }
            texto
          }
          statsTitulo
          statsItems {
            numero
            sufijo
            descripcion
            icono {
              node {
                sourceUrl
                altText
              }
            }
          }
          comparativaTitulo
          comparativaCaracteristicas {
            nombre
            valores
          }
          comparativaProductos {
            nombre
            precio
            url
            destacado
          }
          procesoTitulo
          procesoPasos {
            titulo
            descripcion
            icono {
              node {
                sourceUrl
                altText
              }
            }
          }
          urgenciaTipo
          urgenciaMensaje
          urgenciaFechaLimite
          urgenciaStockCantidad
          urgenciaCtaTexto
          urgenciaCtaUrl
          beneficiosTitulo
          beneficiosItems {
            beneficio
            comoLoLogramos
            icono {
              node {
                sourceUrl
                altText
              }
            }
          }
          ventajasTitulo
          ventajasItems {
            icono {
              node {
                sourceUrl
                altText
              }
            }
            texto
          }
          garantiaTitulo
          garantiaDescripcion
          garantiaDuracion
          garantiaIcono {
            node {
              sourceUrl
              altText
            }
          }
          socialproofTipo
          socialproofTitulo
          socialproofLogos {
            nodes {
              sourceUrl
              altText
            }
          }
          hubTitulo
          hubSubtitulo
          hubColumnas
          hubVista
          hubItems {
            texto
            descripcion
            etiqueta
            etiquetaImagen
            destacado
            slugCategoria
            urlOverride
            imagenOverride {
              node {
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
    }
  }
`;

/**
 * Query para obtener el menú principal de WordPress.
 */
export const QUERY_MAIN_MENU = `
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
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query para obtener páginas hijas por URI del padre.
 */
export const QUERY_CHILD_PAGES = `
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

// ─── Tipos ──────────────────────────────────────────────────────────────────

export const TRANSACTIONAL_TEMPLATE_TYPENAME =
  "Template_PlantillaSEOHeadlessMinimal";

export const INFO_TEMPLATE_TYPENAME = "Template_PginaInformacional";

export const QUERY_INFO_PAGE_COMPLETE = `
  query GetInfoPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      template {
        __typename
        templateName
      }
      bloquesInformacionales {
        infoBlocks {
          __typename
          ... on BloquesInformacionalesInfoBlocksHeroInformacionalLayout {
            titulo
            subtitulo
            imagenFondo { node { sourceUrl altText } }
            mostrarBreadcrumb
          }
          ... on BloquesInformacionalesInfoBlocksTextoSimpleLayout {
            titulo
            contenido
          }
          ... on BloquesInformacionalesInfoBlocksTextoConImagenLayout {
            titulo
            texto
            imagen { node { sourceUrl altText } }
            posicionImagen
          }
          ... on BloquesInformacionalesInfoBlocksGaleriaImagenesLayout {
            titulo
            descripcion
            imagenes {
              imagen { node { sourceUrl altText } }
              caption
            }
          }
          ... on BloquesInformacionalesInfoBlocksLogosGridLayout {
            titulo
            logos {
              logo { node { sourceUrl altText } }
              nombre
              enlace
            }
          }
          ... on BloquesInformacionalesInfoBlocksAcordeonLayout {
            titulo
            descripcion
            items {
              pregunta
              respuesta
            }
          }
          ... on BloquesInformacionalesInfoBlocksEstadisticasLayout {
            titulo
            stats {
              numero
              sufijo
              descripcion
              icono { node { sourceUrl altText } }
            }
          }
          ... on BloquesInformacionalesInfoBlocksCtaContactoLayout {
            titulo
            subtitulo
            textoBoton
            tipoAccion
            url
          }
          ... on BloquesInformacionalesInfoBlocksTimelineLayout {
            titulo
            hitos {
              anio
              titulo
              descripcion
              imagen { node { sourceUrl altText } }
            }
          }
          ... on BloquesInformacionalesInfoBlocksEquipoLayout {
            titulo
            miembros {
              nombre
              cargo
              foto { node { sourceUrl altText } }
              bio
            }
          }
          ... on BloquesInformacionalesInfoBlocksProcesoLayout {
            titulo
            pasos {
              titulo
              descripcion
              icono { node { sourceUrl altText } }
            }
          }
          ... on BloquesInformacionalesInfoBlocksVideoLayout {
            titulo
            videoUrl
            descripcion
          }
          ... on BloquesInformacionalesInfoBlocksHtmlLibreLayout {
            titulo
            contenido
          }
        }
      }
    }
  }
`;

export interface TransactionalPageListItem {
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  template: {
    templateName: string;
    __typename: string;
  } | null;
  heroPageSeo: {
    tituloPrincipal: string | null;
    intro: string | null;
  } | null;
  seoMeta: {
    metaDescription: string | null;
  } | null;
}

export interface AllTransactionalPagesResponse {
  pages: {
    nodes: TransactionalPageListItem[];
  };
}
