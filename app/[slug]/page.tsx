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
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { generateSeoMetadata, getCanonicalUrl } from "@/lib/seo";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamic = "force-dynamic";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const allPages = await fetchAllTransactionalPages();

    const pageInfo = allPages.find((p) => {
      const normalizedUri = p.uri.replace(/^\/|\/$/g, "");
      return normalizedUri === slug;
    });

    if (!pageInfo) {
      return { title: (['quienes-somos', 'plazos-de-entrega', 'enviar-archivos', 'formas-de-pago', 'tarifa-portes', 'precios', 'garantia-de-calidad', 'trabajos-realizados', 'marcas', 'condiciones-generales', 'politica-privacidad', 'cookies', 'aviso-legal', 'preguntas-frecuentes', 'blog'].includes(slug)) ? (slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' |') : "Página no encontrada" };
    }

    const pageData = await wpGraphqlFetch<{ page: any }>(
      QUERY_SEO_PAGE_COMPLETE,
      { id: pageInfo.databaseId }
    );

    const page = pageData.page;
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
      getCanonicalUrl(`/${slug}`);
    const ogImage =
      page.seoMeta?.openGraph?.image?.node?.sourceUrl;

    const robotsIndex =
      page.seoMeta?.indexConfig?.index !== false;
    const robotsFollow =
      page.seoMeta?.indexConfig?.follow !== false;

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

  // 1. Intentar cargar como página informacional
  const infoData = await wpGraphqlFetch<{ page: any }>(
    QUERY_INFO_PAGE_COMPLETE,
    { uri: `/${slug}/` }
  ).catch(() => null);

  if (infoData?.page?.template?.__typename === INFO_TEMPLATE_TYPENAME) {
    const infoBlocks = infoData.page.bloquesInformacionales?.infoBlocks || [];
    return <InfoPageRenderer page={infoData.page} blocks={infoBlocks} />;
  }

  // 2. Si no es informacional, verificar si existe en WordPress
  const allPages = await fetchAllTransactionalPages();
  const pageInfo = allPages.find((p) => {
    const normalizedUri = p.uri.replace(/^\/|\/$/g, "");
    return normalizedUri === slug;
  });

  if (!pageInfo) {
    notFound();
  }

  // 3. Obtener datos completos de la página transaccional
  const pageData = await wpGraphqlFetch<{ page: any }>(
    QUERY_SEO_PAGE_COMPLETE,
    { id: pageInfo.databaseId }
  ).catch(error => {
    console.error("Error al obtener datos completos:", error);
    return null;
  });

  const page = pageData?.page;
  if (!page) {
    notFound();
  }

  // 4. Filtrar bloques con contenido
  const blocks = (page.pageBlocks?.pageBlocks || []).filter(
    (block: any) => hasBlockContent(block)
  );

  const canonicalUrl = getCanonicalUrl(`/${slug}`);
  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com" },
    { name: page.title || slug.replace(/-/g, ' '), item: canonicalUrl }
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
