import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./ProductPageClient";
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { generateSeoMetadata, getCanonicalUrl } from "@/lib/seo";
import { getProductBreadcrumbChain } from "@/lib/slugMap";
import { handleVerifiedRedirect } from "@/lib/redirects";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasQueryParams = Object.keys(resolvedSearchParams).length > 0;
  const canonicalUrl = getCanonicalUrl(`/producto/${slug}`);
  
  // Fetch product data from WordPress GraphQL for SEO meta tags
  try {
    const graphqlUrl = process.env.VITE_WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductMeta($slug: ID!) {
            product(id: $slug, idType: SLUG) {
              name
              shortDescription
              image {
                sourceUrl
                altText
              }
            }
          }
        `,
        variables: { slug },
      }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();
    const product = json?.data?.product;

    if (product) {
      const cleanDescription = product.shortDescription
        ? product.shortDescription.replace(/<[^>]*>/g, '').substring(0, 160)
        : `${product.name} personalizado. Precios mayoristas, calidad premium. Presupuesto gratis en 2 horas.`;

      return generateSeoMetadata({
        title: product.name,
        description: cleanDescription,
        url: canonicalUrl,
        image: product.image?.sourceUrl,
        noIndex: hasQueryParams,
      });
    }
  } catch (e) {
    // Fallback metadata if fetch fails
  }

  return generateSeoMetadata({
    title: `Producto - ${slug.replace(/-/g, ' ')}`,
    description: `Producto personalizado ${slug.replace(/-/g, ' ')}. Precios mayoristas. Presupuesto gratis.`,
    url: canonicalUrl,
    noIndex: hasQueryParams,
  });
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/producto/${slug}`);
  
  let productData = null;
  let rawProductCategories = null;
  
  try {
    const graphqlUrl = process.env.VITE_WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 'https://creativu.es/graphql';
    const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetProductSchema($slug: ID!) {
              product(id: $slug, idType: SLUG) {
                id
                databaseId
                name
                shortDescription
                sku
                image {
                  sourceUrl
                }
                productCategories {
                  nodes {
                    id
                    name
                    slug
                  }
                }
                ... on SimpleProduct {
                  price
                  stockStatus
                }
                ... on VariableProduct {
                  price
                  stockStatus
                }
              }
            }
          `,
          variables: { slug },
        }),
        next: { revalidate: 3600 },
      });
  
      const json = await res.json();
      const product = json?.data?.product;
      
      if (product) {
        rawProductCategories = product.productCategories?.nodes || null;
        productData = {
            id: product.databaseId,
            name: product.name,
            description: product.shortDescription,
            images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
            sku: product.sku || String(product.databaseId || slug),
            price: String(product.price || "").replace(/<[^>]*>/g, '').replace(/[^0-9,.]/g, '').split(' ')[0].replace(',', '.') || "0.00",
            inStock: product.stockStatus === 'INSTOCK',
        };
      } else {
        // Si el producto no se encuentra por este slug, verificar si existe redirección 301 oficial en WordPress
        await handleVerifiedRedirect(`/producto/${slug}`);
      }
  } catch (error) {
    console.error("Error fetching product data for schema:", error);
  }

  const categoryChain = getProductBreadcrumbChain({
    productSlug: slug,
    productName: productData?.name,
    categories: rawProductCategories,
  });

  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com/" },
    ...categoryChain.map((cat) => ({
      name: cat.label,
      item: `https://impacto33.com${cat.url.startsWith('/') ? cat.url : '/' + cat.url}`
    })),
    { name: productData?.name || slug.replace(/-/g, ' '), item: canonicalUrl }
  ];

  return (
    <>
      <SeoSchemas 
        product={productData} 
        productUrl={canonicalUrl}
        breadcrumbs={breadcrumbs}
      />
      <ProductPageClient slug={slug} />
    </>
  );
}
