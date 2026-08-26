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
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { getCanonicalUrl } from "@/lib/seo";
import { transactionalTitles } from "@/lib/slugMap";
import { handleVerifiedRedirect } from "@/lib/redirects";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamicParams = true;

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string; child: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findPageByUri(
  pages: TransactionalPageListItem[],
  uri: string
) {
  const normalizedUri = uri.replace(/^\/|\/$/g, "");
  return pages.find((p) => {
    const pageUri = p.uri.replace(/^\/|\/$/g, "");
    return pageUri === normalizedUri;
  });
}

async function fetchPageByUriOrId(fullUri: string) {
  const allPages = await fetchAllTransactionalPages().catch(() => []);
  const pageInfo = findPageByUri(allPages, fullUri);

  if (pageInfo?.databaseId) {
    const pageData = await wpGraphqlFetch<{ page: any }>(
      QUERY_SEO_PAGE_COMPLETE,
      { id: pageInfo.databaseId }
    ).catch(() => null);
    if (pageData?.page) return pageData.page;
  }

  // Fallback: consulta directa por URI a WPGraphQL
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
    { uri: `/${fullUri}/` }
  ).catch(() => null);

  if (directData?.page?.databaseId) {
    const pageData = await wpGraphqlFetch<{ page: any }>(
      QUERY_SEO_PAGE_COMPLETE,
      { id: directData.page.databaseId }
    ).catch(() => null);
    return pageData?.page || directData.page;
  }

  return null;
}

// ─── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug, child } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasQueryParams = Object.keys(resolvedSearchParams).length > 0;
  const fullUri = `${slug}/${child}`;

  try {
    const page = await fetchPageByUriOrId(fullUri);

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
      `https://impacto33.com${page.uri || `/${fullUri}/`}`;
    const ogImage =
      page.seoMeta?.openGraph?.image?.node?.sourceUrl;

    const robotsIndex =
      page.seoMeta?.indexConfig?.index !== false && !hasQueryParams;
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

  const page = await fetchPageByUriOrId(fullUri);

  if (!page) {
    // Si la subcategoría no existe, verificar si tiene redirección 301 oficial en WordPress
    await handleVerifiedRedirect(`/${fullUri}`);
    notFound();
  }

  // 3. Filtrar bloques con contenido
  const blocks = (page.pageBlocks?.pageBlocks || []).filter(
    (block: any) => hasBlockContent(block)
  );

  // 4. Breadcrumbs canónicos transaccionales
  const parentUrl = getCanonicalUrl(`/${slug}`);
  const parentTitle = transactionalTitles[`/${slug}/`] || slug.replace(/-/g, " ");
  const childCanonicalUrl = getCanonicalUrl(`/${slug}/${child}`);
  const childTitle = page.title || child.replace(/-/g, " ");

  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com" },
    { name: parentTitle, item: parentUrl },
    { name: childTitle, item: childCanonicalUrl },
  ];

  // 5. Renderizar
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
