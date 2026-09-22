"use client";

import ProductPage from "@/screens/shop/ProductPage";

interface ProductPageClientProps {
  slug: string;
  initialProduct: any;
}

/**
 * Client wrapper for the product page.
 * Mantiene en la hidratación los datos que ya se renderizaron en el servidor.
 */
export function ProductPageClient({ slug, initialProduct }: ProductPageClientProps) {
  return <ProductPage serverSlug={slug} initialProduct={initialProduct} />;
}
