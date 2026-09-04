import { gql } from '@apollo/client';

/**
 * Query completa para obtener todos los datos de una página transaccional
 * Incluye hero, SEO meta, y todos los bloques dinámicos
 */
export const GET_SEO_PAGE_COMPLETE = gql`
  query GetSeoPageComplete($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      title
      slug
      uri
      
      # Parent (para detectar si es página hija y obtener hermanas)
      parent {
        node {
          ... on Page {
            id
            uri
          }
        }
      }
      
      # ========================================
      # HERO SECTION
      # ========================================
      heroPageSeo {
        tituloPrincipal
        intro
      }
      
      # ========================================
      # SEO META CONFIGURATION
      # ========================================
      seoMeta {
        metaDescription
        canonicalUrl
        schemaType
        
        # Open Graph
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
        
        # Breadcrumbs Config
        breadcrumbsConfig {
          show
          customPath {
            label
            url
          }
        }
        
        # Index Config
        indexConfig {
          index
          follow
        }
      }
      
      # ========================================
      # PAGE BLOCKS - SISTEMA FLEXIBLE
      # ========================================
      pageBlocks {
        pageBlocks {
          blockType

          # 🎬 VIDEO PROMOCIONAL
          videoTitulo
          videoDescripcion
          videoUrl
          videoCtaTexto
          videoCtaUrl
          
          # ⭐ 4 COLUMNAS CON ICONOS
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
          
          # 🖼️ GALERÍA DE TRABAJOS
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
          
          # 📝 BLOQUE HTML/TEXTO
          htmlTitulo
          htmlContenido
          
          # 🔥 PRODUCTOS MÁS VENDIDOS
          productosVendidosTitulo
          productosVendidosLimite
          productosVendidosOrdenar
          
          # ⭐ PRODUCTOS DESTACADOS
          productosDestacadosTitulo
          productosDestacadosProductos {
            edges {
              node {
                id
              }
            }
          }
          productosDestacadosBadges {
            productoId
            badge
          }
          
          # 🎯 PRODUCTOS DINÁMICOS (por categoría, IDs o SKUs)
          productosDinamicosTitulo
          productosDinamicosCategoria
          productosDinamicosEtiqueta
          productosDinamicosSkus
          productosDinamicosIds
          productosDinamicosMaximo
          productosDinamicosOrdenar
          
          # 📂 SUBCATEGORÍAS GRID
          subcategoriasTitulo
          subcategoriasParent
          subcategoriasLayout
          subcategoriasMostrarContador
          
          # ❓ FAQ - PREGUNTAS FRECUENTES
          faqTitulo
          faqItems {
            pregunta
            respuesta
          }
          
          # 💼 CASOS DE USO
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
          
          # 🛠️ USOS COMUNES
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
          
          # 🔗 INTERLINKING / ENLACES INTERNOS
          interlinkingTitulo
          interlinkingItems {
            texto
            url
            descripcion
          }
          
          # 📰 SLIDER DE BLOG
          blogsliderTitulo
          blogsliderPosts {
            nodes {
              ... on Post {
                id
                databaseId
                title
                excerpt
                uri
                date
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
                author {
                  node {
                    name
                  }
                }
              }
            }
          }
          blogsliderCategoria {
            edges {
              node {
                id
              }
            }
          }
          
          # 🎯 CTA SECUNDARIO
          ctasecundarioTitulo
          ctasecundarioDescripcion
          ctasecundarioTexto
          ctasecundarioUrl
          
          # 💬 TESTIMONIOS / RESEÑAS
          testimoniosTitulo
          testimoniosItems {
            nombre
            empresa
            testimonio
            rating
            foto {
              node {
                sourceUrl
                altText
              }
            }
            verificado
          }
          
          # ✅ TRUST BADGES (Envío, Garantía...)
          trustbadgesItems {
            icono {
              node {
                sourceUrl
                altText
              }
            }
            texto
          }
          
          # 📊 STATS / NÚMEROS IMPACTANTES
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
          
          # ⚖️ TABLA COMPARATIVA
          comparativaTitulo
          comparativaProductos {
            nombre
            destacado
            precio
            url
          }
          comparativaCaracteristicas {
            nombre
            valores
          }
          
          # 📋 PROCESO PASO A PASO
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
          
          # ⏰ URGENCIA / ESCASEZ
          urgenciaTipo
          urgenciaMensaje
          urgenciaFechaLimite
          urgenciaStockCantidad
          urgenciaCtaTexto
          urgenciaCtaUrl
          
          # ✨ BENEFICIOS VS CARACTERÍSTICAS
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
          
          # 🏆 POR QUÉ ELEGIRNOS
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
          
          # 🛡️ GARANTÍA DESTACADA
          garantiaTitulo
          garantiaDescripcion
          garantiaDuracion
          garantiaIcono {
            node {
              sourceUrl
              altText
            }
          }
          
          # 👥 PRUEBA SOCIAL
          socialproofTipo
          socialproofTitulo
          socialproofLogos {
            nodes {
              sourceUrl
              altText
            }
          }

          # 🍱 HUB DE CARDS (Categoría / Provincia / Sector)
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
 * Variables para la query
 */
export interface GetSeoPageCompleteVariables {
  id: number; // databaseId
}

/**
 * Tipos para los bloques
 */
export interface PageBlock {
  blockType: string;
  
  // Video
  videoTitulo?: string | null;
  videoDescripcion?: string | null;
  videoUrl?: string | null;
  videoCtaTexto?: string | null;
  videoCtaUrl?: string | null;
  
  // Iconos
  iconosTitulo?: string | null;
  iconosColumnas?: Array<{
    icono?: { node: { sourceUrl: string; altText: string } } | null;
    titulo?: string | null;
    descripcion?: string | null;
  }> | null;
  
  // Galería
  galeriaTitulo?: string | null;
  galeriaDescripcion?: string | null;
  galeriaImagenes?: {
    nodes: Array<{
      sourceUrl: string;
      altText: string;
      mediaDetails: { width: number; height: number };
    }>;
  } | null;
  
  // HTML
  htmlTitulo?: string | null;
  htmlContenido?: string | null;
  
  // Productos Vendidos
  productosVendidosTitulo?: string | null;
  productosVendidosLimite?: number | null;
  productosVendidosOrdenar?: string | null;
  
  // Productos Destacados
  productosDestacadosTitulo?: string | null;
  productosDestacadosProductos?: {
    edges: Array<{ node: { id: string } }>;
  } | null;
  productosDestacadosBadges?: Array<{
    productoId?: string | null;
    badge?: string | null;
  }> | null;
  
  // Productos Dinámicos
  productosDinamicosTitulo?: string | null;
  productosDinamicosCategoria?: string | null;
  productosDinamicosEtiqueta?: string | null;
  productosDinamicosSkus?: string | null;
  productosDinamicosIds?: string | null;
  productosDinamicosMaximo?: number | null;
  productosDinamicosOrdenar?: string | null;
  
  // Subcategorías
  subcategoriasTitulo?: string | null;
  subcategoriasParent?: string | null;
  subcategoriasLayout?: string | null;
  subcategoriasMostrarContador?: boolean | null;
  
  // FAQ
  faqTitulo?: string | null;
  faqItems?: Array<{
    pregunta?: string | null;
    respuesta?: string | null;
  }> | null;
  
  // Casos de Uso
  casosusoTitulo?: string | null;
  casosusoItems?: Array<{
    titulo?: string | null;
    descripcion?: string | null;
    imagen?: { node: { sourceUrl: string; altText: string } } | null;
  }> | null;
  
  // Usos Comunes
  usoscomunesTitulo?: string | null;
  usoscomunesItems?: Array<{
    nombre?: string | null;
    descripcion?: string | null;
    imagen?: { node: { sourceUrl: string; altText: string } } | null;
  }> | null;
  
  // Interlinking
  interlinkingTitulo?: string | null;
  interlinkingItems?: Array<{
    texto?: string | null;
    url?: string | null;
    descripcion?: string | null;
  }> | null;
  
  // Blog Slider
  blogsliderTitulo?: string | null;
  blogsliderPosts?: {
    nodes: Array<{
      id: string;
      databaseId: number;
      title: string;
      excerpt: string;
      uri: string;
      date: string;
      featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
      author: { node: { name: string } };
    }>;
  } | null;
  blogsliderCategoria?: {
    edges: Array<{ node: { id: string } }>;
  } | null;
  
  // CTA Secundario
  ctasecundarioTitulo?: string | null;
  ctasecundarioDescripcion?: string | null;
  ctasecundarioTexto?: string | null;
  ctasecundarioUrl?: string | null;
  
  // Testimonios
  testimoniosTitulo?: string | null;
  testimoniosItems?: Array<{
    nombre?: string | null;
    empresa?: string | null;
    testimonio?: string | null;
    rating?: number | null;
    foto?: { node: { sourceUrl: string; altText: string } } | null;
    verificado?: boolean | null;
  }> | null;
  
  // Trust Badges
  trustbadgesItems?: Array<{
    icono?: { node: { sourceUrl: string; altText: string } } | null;
    texto?: string | null;
  }> | null;
  
  // Stats
  statsTitulo?: string | null;
  statsItems?: Array<{
    numero?: string | null;
    sufijo?: string | null;
    descripcion?: string | null;
    icono?: { node: { sourceUrl: string; altText: string } } | null;
  }> | null;
  
  // Comparativa
  comparativaTitulo?: string | null;
  comparativaProductos?: Array<{
    nombre?: string | null;
    destacado?: boolean | null;
    precio?: string | null;
    url?: string | null;
  }> | null;
  comparativaCaracteristicas?: Array<{
    nombre?: string | null;
    valores?: string[] | null;
  }> | null;
  
  // Proceso
  procesoTitulo?: string | null;
  procesoPasos?: Array<{
    titulo?: string | null;
    descripcion?: string | null;
    icono?: { node: { sourceUrl: string; altText: string } } | null;
  }> | null;
  
  // Urgencia
  urgenciaTipo?: string | null;
  urgenciaMensaje?: string | null;
  urgenciaFechaLimite?: string | null;
  urgenciaStockCantidad?: number | null;
  urgenciaCtaTexto?: string | null;
  urgenciaCtaUrl?: string | null;
  
  // Beneficios
  beneficiosTitulo?: string | null;
  beneficiosItems?: Array<{
    beneficio?: string | null;
    comoLoLogramos?: string | null;
    icono?: { node: { sourceUrl: string; altText: string } } | null;
  }> | null;
  
  // Ventajas
  ventajasTitulo?: string | null;
  ventajasItems?: Array<{
    icono?: { node: { sourceUrl: string; altText: string } } | null;
    texto?: string | null;
  }> | null;
  
  // Garantía
  garantiaTitulo?: string | null;
  garantiaDescripcion?: string | null;
  garantiaDuracion?: string | null;
  garantiaIcono?: { node: { sourceUrl: string; altText: string } } | null;
  
  // Social Proof
  socialproofTipo?: string | null;
  socialproofTitulo?: string | null;
  socialproofLogos?: {
    nodes: Array<{ sourceUrl: string; altText: string }>;
  } | null;

  // Hubs de Cards
  hubTitulo?: string | null;
  hubSubtitulo?: string | null;
  hubColumnas?: string[] | string | number | null;
  hubVista?: string[] | string | null;
  hubItems?: HubItem[] | null;
}

export interface HubItem {
  texto?: string | null;
  descripcion?: string | null;
  etiqueta?: string | null;
  etiquetaImagen?: string | null;
  destacado?: boolean | null;
  slugCategoria?: string | null;
  urlOverride?: string | null;
  imagenOverride?: {
    node?: {
      sourceUrl: string;
      altText?: string;
      mediaDetails?: {
        width?: number | null;
        height?: number | null;
      } | null;
    };
  } | null;
}

/**
 * Tipo de respuesta completa
 */
export interface GetSeoPageCompleteResponse {
  page: {
    id: string;
    databaseId: number;
    title: string;
    slug: string;
    uri: string;
    parent?: {
      node: {
        id: string;
        uri: string;
      };
    } | null;
    heroPageSeo: {
      tituloPrincipal: string | null;
      intro: string | null;
    } | null;
    seoMeta: {
      metaDescription: string | null;
      canonicalUrl: string | null;
      schemaType: string | null;
      openGraph: {
        title: string | null;
        description: string | null;
        image: {
          node: {
            sourceUrl: string;
            altText: string;
            mediaDetails: { width: number; height: number };
          };
        } | null;
      } | null;
      breadcrumbsConfig: {
        show: boolean | null;
        customPath: Array<{
          label: string | null;
          url: string | null;
        }> | null;
      } | null;
      indexConfig: {
        index: boolean | null;
        follow: boolean | null;
      } | null;
    } | null;
    pageBlocks: {
      pageBlocks: PageBlock[];
    } | null;
  };
}
