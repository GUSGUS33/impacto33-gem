import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  wpGraphqlFetch,
  fetchAllTransactionalPages,
  QUERY_SEO_PAGE_COMPLETE,
  TRANSACTIONAL_TEMPLATE_TYPENAME,
  type TransactionalPageListItem,
} from "@/lib/wpGraphql";
import TransactionalPageClient from "@/components/TransactionalPageClient";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamic = "force-dynamic";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string; child: string }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findPageByUri(
  pages: TransactionalPageListItem[],
  uri: string
) {
  const normalizedUri = uri.replace(/^\/|\/$/g, "");
  return pages.find((p) => {
    const pageUri = p.uri.replace(/^\/|\/$/g, "");
    return (
      pageUri === normalizedUri &&
      p.template?.__typename === TRANSACTIONAL_TEMPLATE_TYPENAME
    );
  });
}

// ─── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, child } = await params;
  const fullUri = `${slug}/${child}`;

  try {
    const allPages = await fetchAllTransactionalPages();
    const pageInfo = findPageByUri(allPages, fullUri);

    if (!pageInfo) {
      return { title: "Página no encontrada" };
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
      `https://impacto33.com${page.uri}`;
    const ogImage =
      page.seoMeta?.openGraph?.image?.node?.sourceUrl;

    const robotsIndex =
      page.seoMeta?.indexConfig?.index !== false;
    const robotsFollow =
      page.seoMeta?.indexConfig?.follow !== false;

    return {
      title: metaTitle,
      description: metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: robotsIndex,
        follow: robotsFollow,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        type: "website",
        ...(ogImage && { images: [{ url: ogImage }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return { title: "IMPACTO33" };
  }
}

// ─── Page Component (Server Component) ──────────────────────────────────────

export default async function TransactionalChildPage({
  params,
}: PageProps) {
  const { slug, child } = await params;
  const fullUri = `${slug}/${child}`;

  // 1. Encontrar la página (con paginación completa)
  const allPages = await fetchAllTransactionalPages();
  const pageInfo = findPageByUri(allPages, fullUri);

  if (!pageInfo) {
    notFound();
  }

  // 2. Obtener datos completos
  const pageData = await wpGraphqlFetch<{ page: any }>(
    QUERY_SEO_PAGE_COMPLETE,
    { id: pageInfo.databaseId }
  );

  const page = pageData.page;
  if (!page) {
    notFound();
  }

  // 3. Filtrar bloques con contenido
  const blocks = (page.pageBlocks?.pageBlocks || []).filter(
    (block: any) => hasBlockContent(block)
  );

  // 4. Renderizar
  return <TransactionalPageClient page={page} blocks={blocks} />;
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
