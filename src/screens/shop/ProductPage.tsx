"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import NotFound from "@/screens/NotFound";
import { GET_FULL_VARIABLE_PRODUCT } from "@/lib/queries";
import ProductPricingFlow from "@/components/pricing/ProductPricingFlow";
import ProductEditorialContent from "@/components/ProductEditorialContent";
import { getProductBreadcrumbChain } from "@/lib/slugMap";
import { formatPrice } from "@/lib/utils";
import { getUniqueProductSummary } from "@/lib/productContent";
import { resolveProductPricingCategory } from "@/lib/productPricingCategory";
import {
  getAvailablePrintingMethods,
  loadPricingDataFromFamily,
} from "@/services/pricingService";

interface ProductPageProps {
  serverSlug?: string;
  initialProduct?: any;
}

export default function ProductPage({ serverSlug, initialProduct }: ProductPageProps) {
  const params = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const slug = serverSlug || (params?.slug as string);

  const { data, loading, error } = useQuery(GET_FULL_VARIABLE_PRODUCT, {
    variables: { slug },
    skip: !slug || Boolean(initialProduct),
  });

  if (!slug) return <NotFound />;

  const product = initialProduct || data?.product;

  if (loading && !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full rounded-sm" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product && error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">No se pudo cargar el producto</h2>
          <p className="text-sm text-slate-600 mb-6">
            Ha ocurrido un problema temporal al consultar los datos del producto.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-blue-700 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  const mainImage = product.featuredImage?.node?.sourceUrl || product.image?.sourceUrl;
  const gallery = product.galleryImages?.nodes || [];
  const currentImage = activeImage || mainImage;
  
  // Precio display
  const rawPrice = product.salePrice || product.price || product.regularPrice;
  const formattedPrice = formatPrice(rawPrice);
  const isVariable = product.__typename === "VariableProduct" || Boolean(product.variations?.nodes?.length);
  const displayPrice = formattedPrice
    ? (isVariable && !formattedPrice.toLowerCase().includes("desde")
      ? `Desde ${formattedPrice}`
      : formattedPrice)
    : "Consultar Precio";
  const uniqueSummary = getUniqueProductSummary(
    product.shortDescription,
    product.description,
  );
  const pricingCategory = resolveProductPricingCategory(product.productCategories?.nodes);
  const availablePrintingMethods = getAvailablePrintingMethods(pricingCategory);
  const minimumQuantity = loadPricingDataFromFamily(pricingCategory).cantidad_minima;

  // Cadena de categorías/subcategorías para breadcrumbs transaccionales
  const categoryChain = getProductBreadcrumbChain({
    productSlug: product.slug || slug,
    productName: product.name,
    categories: product.productCategories?.nodes,
  });

  return (
    <>
      

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="container mx-auto px-4 text-xs text-slate-500 flex items-center flex-wrap gap-2">
          <Link href="/" className="hover:text-blue-700">Inicio</Link>
          {categoryChain.map((item, idx) => (
            <React.Fragment key={item.url + idx}>
              <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />
              <Link href={item.url} className="hover:text-blue-700 font-medium text-slate-700">
                {item.label}
              </Link>
            </React.Fragment>
          ))}
          <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />
          <span className="font-bold text-slate-900 truncate max-w-[300px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-12">
          
          {/* Columna Izquierda: Galería */}
          <div className="order-2 space-y-4 lg:order-1">
            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative group shadow-sm sm:aspect-[4/5]">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-bold">
                  SIN IMAGEN
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {gallery.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Imagen principal como primera miniatura */}
                {mainImage && (
                  <button 
                    onClick={() => setActiveImage(mainImage)}
                    className={`w-20 h-20 border rounded-sm overflow-hidden flex-shrink-0 ${activeImage === mainImage || (!activeImage && currentImage === mainImage) ? 'border-blue-700 ring-1 ring-blue-700' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <img src={mainImage} alt="Principal" className="w-full h-full object-cover" />
                  </button>
                )}
                {/* Resto de galería */}
                {gallery.map((img: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.sourceUrl)}
                    className={`w-20 h-20 border rounded-sm overflow-hidden flex-shrink-0 ${activeImage === img.sourceUrl ? 'border-blue-700 ring-1 ring-blue-700' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <img src={img.sourceUrl} alt={img.altText || `Galería ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Info Producto */}
          <div className="contents lg:order-2 lg:block">
            <div className="order-1 lg:order-none">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{product.name}</h1>
            
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="text-2xl font-bold text-blue-700">
                  {displayPrice}
                </div>
                {product.stockStatus === 'IN_STOCK' && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Check size={12} /> DISPONIBLE
                  </span>
                )}
                {product.sku && (
                  <span className="text-xs font-medium text-slate-500">Ref. {product.sku}</span>
                )}
              </div>

              {uniqueSummary && (
                <div
                  data-product-summary
                  className="prose prose-slate prose-sm mb-2 line-clamp-3 max-w-2xl text-slate-600"
                  dangerouslySetInnerHTML={{ __html: uniqueSummary }}
                />
              )}
            </div>

            {/* Product Pricing Flow Integrado */}
            <div id="configurar-producto" data-product-pricing className="order-3 scroll-mt-28 lg:order-none lg:mt-6">
              <ProductPricingFlow 
                product={product}
                onColorChange={(colorName, colorImage) => setActiveImage(colorImage || mainImage)}
              />
            </div>

            {/* Ventajas Rápidas */}
            <div className="order-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:order-none lg:mt-8">
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                <Truck size={18} className="text-blue-700 mt-0.5" />
                <span>Opciones de producción adaptadas a tu fecha</span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                <ShieldCheck size={18} className="text-blue-700 mt-0.5" />
                <span>Revisión del pedido antes de producir</span>
              </div>
            </div>
          </div>
        </div>

        <ProductEditorialContent
          product={product}
          minimumQuantity={minimumQuantity}
          availablePrintingMethods={availablePrintingMethods}
        />
      </div>
    </>
  );
}
