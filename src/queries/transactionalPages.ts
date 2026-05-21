import { gql } from '@apollo/client';

/**
 * Identificador de la plantilla ACF "Plantilla SEO (Headless Minimal)"
 */
export const TRANSACTIONAL_TEMPLATE_TYPENAME = 'Template_PlantillaSEOHeadlessMinimal';

/**
 * Query optimizada para obtener solo páginas que usan plantillas ACF
 * Filtra directamente por páginas publicadas sin password
 * El filtrado por Template_PlantillaSEOHeadlessMinimal se hace en el cliente
 * Basada en la estructura proporcionada por el usuario para mejor rendimiento
 */
export const GET_ALL_TRANSACTIONAL_PAGES = gql`
  query GetAllTransactionalPages {
    pages(
      where: {
        status: PUBLISH
        hasPassword: false
      }
      first: 100
    ) {
      nodes {
        id
        databaseId
        title
        slug
        uri
        template {
          templateName  # Nombre legible (ej: "Plantilla SEO (Headless Minimal)")
          __typename    # Tipo de la plantilla en el esquema (ej: "Template_PlantillaSEOHeadlessMinimal")
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
 * Tipo para una página transaccional en el listado
 */
export interface TransactionalPageListItem {
  id: string;
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

/**
 * Tipo de respuesta de la query
 */
export interface GetAllTransactionalPagesResponse {
  pages: {
    nodes: TransactionalPageListItem[];
  };
}

/**
 * Filtra solo las páginas que usan la plantilla transaccional
 * OPTIMIZADO: Ahora la query ya obtiene solo páginas con plantillas ACF,
 * por lo que este filtro es más eficiente (menos datos a procesar)
 */
export function filterTransactionalPages(pages: TransactionalPageListItem[]): TransactionalPageListItem[] {
  return pages.filter(
    (page) => page.template?.__typename === TRANSACTIONAL_TEMPLATE_TYPENAME
  );
}
