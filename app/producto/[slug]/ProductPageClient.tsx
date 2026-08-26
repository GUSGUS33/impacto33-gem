"use client";

import ProductPage from "@/pages/shop/ProductPage";

interface ProductPageClientProps {
  slug: string;
}

/**
 * Client wrapper for the product page.
 * The actual ProductPage component uses useRoute from wouter (shimmed to Next.js)
 * to extract the slug from the URL, so we just need to render it.
 */
export function ProductPageClient({ slug }: ProductPageClientProps) {
  return <ProductPage serverSlug={slug} />;
}
