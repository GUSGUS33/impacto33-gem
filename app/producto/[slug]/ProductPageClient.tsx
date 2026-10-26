"use client";

import ProductPage from "@/screens/shop/ProductPage";
import type { PricingData } from '@/types/pricing';
import { useEffect } from 'react';
import { useQuoteProduct } from '@/contexts/QuoteProductContext';

interface ProductPageClientProps {
  slug: string;
  initialProduct: any;
  initialPricingData?: PricingData;
}

/**
 * Client wrapper for the product page.
 * Mantiene en la hidratación los datos que ya se renderizaron en el servidor.
 */
export function ProductPageClient({ slug, initialProduct, initialPricingData }: ProductPageClientProps) {
  const { setProduct } = useQuoteProduct();
  const name = initialProduct?.name;
  useEffect(() => {
    if (!name) return;
    setProduct({ name, path: `/producto/${slug}` });
    return () => setProduct(null);
  }, [slug, name, setProduct]);
  return <ProductPage serverSlug={slug} initialProduct={initialProduct} initialPricingData={initialPricingData} />;
}
