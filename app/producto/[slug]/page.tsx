import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./ProductPageClient";
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { generateSeoMetadata, getCanonicalUrl } from "@/lib/seo";
import { getProductBreadcrumbChain } from "@/lib/slugMap";
import { handleVerifiedRedirect } from "@/lib/redirects";
import { extractFirstPrice, fetchProductForSSR } from "@/lib/productSSR";
import { buildProductFaqs } from "@/lib/productContent";
import { resolveProductPricingCategory } from "@/lib/productPricingCategory";
import { getPricingFamilyFromCategory } from "@/data/pricing/category-to-family";
import { getPricingFamilyConfig } from "@/data/pricing/pricing-families";

// ─── Renderizado dinámico con ISR ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const getProductData = cache(fetchProductForSSR);

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasQueryParams = Object.keys(resolvedSearchParams).length > 0;
  const canonicalUrl = getCanonicalUrl(`/producto/${slug}`);

  const result = await getProductData(slug);

  if (result.status === "NOT_FOUND") {
    await handleVerifiedRedirect(`/producto/${slug}`);
    notFound();
  }

  if (result.status === "SERVER_ERROR") {
    return generateSeoMetadata({
      title: `Producto - ${slug.replace(/-/g, " ")}`,
      description: "Producto personalizado para empresas y colectivos.",
      url: canonicalUrl,
      noIndex: hasQueryParams,
    });
  }

  const product = result.product;
  const descriptionSource = product.shortDescription || product.description;
  const cleanDescription = descriptionSource
    ? descriptionSource.replace(/<[^>]*>/g, "").substring(0, 160).trim()
    : `${product.name} personalizado. Precios mayoristas, calidad premium. Presupuesto gratis en 2 horas.`;

  return generateSeoMetadata({
    title: product.name,
    description: cleanDescription,
    url: canonicalUrl,
    image: product.featuredImage?.node?.sourceUrl || product.image?.sourceUrl,
    noIndex: hasQueryParams,
  });
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/producto/${slug}`);

  const result = await getProductData(slug);

  if (result.status === "SERVER_ERROR") {
    console.warn(
      `[ProductoPage] Error temporal al consultar WordPress para "${slug}"; se evita responder con un falso 404.`,
      result.error,
    );
    throw new Error(`Servicio de catálogo temporalmente no disponible: ${result.error}`);
  }

  if (result.status === "NOT_FOUND") {
    await handleVerifiedRedirect(`/producto/${slug}`);
    notFound();
  }

  const product = result.product;
  const mainImage = product.featuredImage?.node?.sourceUrl || product.image?.sourceUrl;
  const galleryImages = product.galleryImages?.nodes
    ?.map((image: { sourceUrl?: string }) => image.sourceUrl)
    .filter(Boolean) || [];
  const images = mainImage ? [mainImage, ...galleryImages] : galleryImages;
  let rawPrice = product.salePrice || product.price || product.regularPrice;

  if (!rawPrice && product.variations?.nodes?.length) {
    const pricedVariation = product.variations.nodes.find(
      (variation: any) => variation.salePrice || variation.price || variation.regularPrice,
    );
    rawPrice = pricedVariation?.salePrice || pricedVariation?.price || pricedVariation?.regularPrice;
  }

  const productData = {
    id: product.databaseId,
    name: product.name,
    description: product.shortDescription || product.description,
    images,
    sku: product.sku || String(product.databaseId || slug),
    price: extractFirstPrice(rawPrice),
    inStock: product.stockStatus === "IN_STOCK" || product.stockStatus === "INSTOCK",
  };

  const categoryChain = getProductBreadcrumbChain({
    productSlug: slug,
    productName: product.name,
    categories: product.productCategories?.nodes,
  });

  const breadcrumbs = [
    { name: "Inicio", item: getCanonicalUrl("/") },
    ...categoryChain.map((cat) => ({
      name: cat.label,
      item: getCanonicalUrl(cat.url)
    })),
    { name: product.name, item: canonicalUrl }
  ];
  const pricingCategory = resolveProductPricingCategory(product.productCategories?.nodes);
  const minimumQuantity = getPricingFamilyConfig(
    getPricingFamilyFromCategory(pricingCategory),
  ).cantidad_minima;
  const faqs = buildProductFaqs(product.name, minimumQuantity);

  return (
    <>
      <SeoSchemas 
        product={productData} 
        productUrl={canonicalUrl}
        breadcrumbs={breadcrumbs}
        faqs={faqs}
      />
      <ProductPageClient slug={slug} initialProduct={product} />
    </>
  );
}
