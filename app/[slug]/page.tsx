import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  wpGraphqlFetch,
  fetchAllTransactionalPages,
  QUERY_SEO_PAGE_COMPLETE,
  TRANSACTIONAL_TEMPLATE_TYPENAME,
  QUERY_INFO_PAGE_COMPLETE,
  INFO_TEMPLATE_TYPENAME,
} from "@/lib/wpGraphql";
import { InfoPageRenderer } from "@/components/InfoPageRenderer";
import TransactionalPageClient from "@/components/TransactionalPageClient";
import InfoPage from "@/screens/InfoPage";
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { generateSeoMetadata, getCanonicalUrl } from "@/lib/seo";
import { handleVerifiedRedirect } from "@/lib/redirects";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamicParams = true;

const KNOWN_INFO_SLUGS = [
  'quienes-somos',
  'plazos-de-entrega',
  'enviar-archivos',
  'formas-de-pago',
  'tarifa-portes',
  'precios',
  'garantia-de-calidad',
  'trabajos-realizados',
  'marcas',
  'condiciones-generales',
  'politica-privacidad',
  'cookies',
  'aviso-legal',
  'preguntas-frecuentes',
  'blog'
];

const KNOWN_TITLES: Record<string, string> = {
  'quienes-somos': '¿Quiénes Somos?',
  'plazos-de-entrega': 'Plazos de Entrega',
  'enviar-archivos': 'Guía para Enviar Archivos',
  'formas-de-pago': 'Formas de Pago Seguras',
  'tarifa-portes': 'Tarifa de Portes',
  'precios': 'Precios y Tarifas',
  'garantia-de-calidad': 'Garantía de Calidad',
  'trabajos-realizados': 'Trabajos Realizados',
  'marcas': 'Nuestras Marcas',
  'condiciones-generales': 'Condiciones Generales de Venta',
  'politica-privacidad': 'Política de Privacidad',
  'cookies': 'Política de Cookies',
  'aviso-legal': 'Aviso Legal',
  'preguntas-frecuentes': 'Preguntas Frecuentes (FAQ)',
  'blog': 'Blog de Personalización Textil'
};

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// ─── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasQueryParams = Object.keys(resolvedSearchParams).length > 0;
  const cleanSlug = slug.replace(/^\/|\/$/g, "");

  if (KNOWN_INFO_SLUGS.includes(cleanSlug)) {
    return generateSeoMetadata({
      title: KNOWN_TITLES[cleanSlug] || cleanSlug,
      description: `Información sobre ${KNOWN_TITLES[cleanSlug] || cleanSlug} en IMPACTO33. Especialistas en regalos publicitarios y ropa personalizada.`,
      url: getCanonicalUrl(`/${cleanSlug}`),
      noIndex: hasQueryParams,
    });
  }

  try {
    const allPages = await fetchAllTransactionalPages().catch(() => []);

    const pageInfo = allPages.find((p) => {
      const normalizedUri = p.uri.replace(/^\/|\/$/g, "");
      return normalizedUri === cleanSlug;
    });

    let page: any = null;

    if (pageInfo?.databaseId) {
      const pageData = await wpGraphqlFetch<{ page: any }>(
        QUERY_SEO_PAGE_COMPLETE,
        { id: pageInfo.databaseId }
      ).catch(() => null);
      page = pageData?.page;
    }

    if (!page) {
      const directData = await wpGraphqlFetch<{ page: any }>(
        `query GetPageByUri($uri: ID!) {
          page(id: $uri, idType: URI) {
            databaseId
            id
            title
            slug
            uri
          }
        }`,
        { uri: `/${cleanSlug}/` }
      ).catch(() => null);

      if (directData?.page?.databaseId) {
        const pageData = await wpGraphqlFetch<{ page: any }>(
          QUERY_SEO_PAGE_COMPLETE,
          { id: directData.page.databaseId }
        ).catch(() => null);
        page = pageData?.page || directData.page;
      }
    }

    if (!page) {
      return { title: "Página no encontrada" };
    }

    const metaTitle =
      page.seoMeta?.openGraph?.title || page.title;
    const metaDescription =
      page.seoMeta?.metaDescription ||
      page.heroPageSeo?.intro ||
      "";
    const canonicalUrl =
      page.seoMeta?.canonicalUrl ||
      getCanonicalUrl(`/${cleanSlug}`);
    const ogImage =
      page.seoMeta?.openGraph?.image?.node?.sourceUrl;

    const robotsIndex =
      page.seoMeta?.indexConfig?.index !== false && !hasQueryParams;

    return generateSeoMetadata({
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      image: ogImage,
      type: "website",
      noIndex: !robotsIndex
    });
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return generateSeoMetadata({ title: "IMPACTO33", description: "" });
  }
}

// ─── Page Component (Server Component) ──────────────────────────────────────

export default async function TransactionalSlugPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const cleanSlug = slug.replace(/^\/|\/$/g, "");

  // 1. Si es una de nuestras páginas informacionales conocidas
  if (KNOWN_INFO_SLUGS.includes(cleanSlug)) {
    // Intentar cargar desde WordPress si tiene plantilla de InfoPage
    const infoData = await wpGraphqlFetch<{ page: any }>(
      QUERY_INFO_PAGE_COMPLETE,
      { uri: `/${cleanSlug}/` }
    ).catch(() => null);

    if (infoData?.page?.template?.__typename === INFO_TEMPLATE_TYPENAME) {
      const infoBlocks = infoData.page.bloquesInformacionales?.infoBlocks || [];
      return <InfoPageRenderer page={infoData.page} blocks={infoBlocks} />;
    }

    // Fallback garantizado a nuestro componente InfoPage local
    const canonicalUrl = getCanonicalUrl(`/${cleanSlug}`);
    const breadcrumbs = [
      { name: "Inicio", item: "https://impacto33.com" },
      { name: KNOWN_TITLES[cleanSlug] || cleanSlug, item: canonicalUrl }
    ];
    return (
      <>
        <SeoSchemas breadcrumbs={breadcrumbs} />
        <InfoPage />
      </>
    );
  }

  // 2. Si es de WordPress (páginas transaccionales)
  const allPages = await fetchAllTransactionalPages().catch(() => []);
  const pageInfo = allPages.find((p) => {
    const normalizedUri = p.uri.replace(/^\/|\/$/g, "");
    return normalizedUri === cleanSlug;
  });

  let page: any = null;

  if (pageInfo?.databaseId) {
    const pageData = await wpGraphqlFetch<{ page: any }>(
      QUERY_SEO_PAGE_COMPLETE,
      { id: pageInfo.databaseId }
    ).catch(error => {
      console.error("Error al obtener datos completos:", error);
      return null;
    });
    page = pageData?.page;
  }

  // Fallback: consulta directa por URI a WPGraphQL si no se encontró en allPages
  if (!page) {
    const directData = await wpGraphqlFetch<{ page: any }>(
      `query GetPageByUri($uri: ID!) {
        page(id: $uri, idType: URI) {
          databaseId
          id
          title
          slug
          uri
        }
      }`,
      { uri: `/${cleanSlug}/` }
    ).catch(() => null);

    if (directData?.page?.databaseId) {
      const pageData = await wpGraphqlFetch<{ page: any }>(
        QUERY_SEO_PAGE_COMPLETE,
        { id: directData.page.databaseId }
      ).catch(() => null);
      page = pageData?.page || directData.page;
    }
  }

  if (!page) {
    // Si la página no existe, verificar si tiene redirección 301 oficial en WordPress
    await handleVerifiedRedirect(`/${cleanSlug}`);
    notFound();
  }

  // 4. Filtrar bloques con contenido
  const blocks = (page.pageBlocks?.pageBlocks || []).filter(
    (block: any) => hasBlockContent(block)
  );

  const canonicalUrl = getCanonicalUrl(`/${cleanSlug}`);
  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com" },
    { name: page.title || cleanSlug.replace(/-/g, ' '), item: canonicalUrl }
  ];

  // 5. Renderizar el Client Component con los datos pre-fetched
  return (
    <>
      <SeoSchemas breadcrumbs={breadcrumbs} />
      <TransactionalPageClient page={page} blocks={blocks} />
    </>
  );
}

// ─── Utilidad ───────────────────────────────────────────────────────────────

function hasBlockContent(block: any): boolean {
  const { blockType, ...fields } = block;
  for (const value of Object.values(fields)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) return true;
      } else if (typeof value === "object") {
        if (Object.keys(value as object).length > 0) return true;
      } else if (typeof value === "string") {
        if ((value as string).trim() !== "") return true;
      } else {
        return true;
      }
    }
  }
  return false;
}
