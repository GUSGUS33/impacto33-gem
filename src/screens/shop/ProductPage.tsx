"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { siteConfig } from "@/config/siteConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronRight, ShieldCheck, Truck, Mail, Phone } from "lucide-react";
import NotFound from "@/pages/NotFound";
import { GET_FULL_VARIABLE_PRODUCT } from "@/lib/queries";
import ProductPricingFlow from "@/components/pricing/ProductPricingFlow";
import { getProductBreadcrumbChain } from "@/lib/slugMap";
import { formatPrice } from "@/lib/utils";

export default function ProductPage({ serverSlug }: { serverSlug?: string }) {
  const params = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const slug = serverSlug || (params?.slug as string);

  const { data, loading, error } = useQuery(GET_FULL_VARIABLE_PRODUCT, {
    variables: { slug },
    skip: !slug
  });

  if (!slug) return <NotFound />;

  if (loading) {
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

  if (error || !data?.product) {
    // Si falla la carga o no existe, mostramos un estado de error amigable o 404
    return <NotFound />;
  }

  const product = data.product;
  const mainImage = product.featuredImage?.node?.sourceUrl || product.image?.sourceUrl;
  const gallery = product.galleryImages?.nodes || [];
  const currentImage = activeImage || mainImage;
  
  // Precio display
  const rawPrice = product.salePrice || product.price || product.regularPrice;
  const formattedPrice = formatPrice(rawPrice);
  const displayPrice = formattedPrice ? (formattedPrice.toLowerCase().includes('desde') ? formattedPrice : `Desde ${formattedPrice}`) : "Consultar Precio";

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

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Columna Izquierda: Galería */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative group shadow-sm">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-2xl font-bold text-blue-700">
                {displayPrice}
              </div>
              {product.stockStatus === 'IN_STOCK' && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} /> DISPONIBLE
                </span>
              )}
            </div>

            <div className="prose prose-slate prose-sm mb-8 text-slate-600" dangerouslySetInnerHTML={{ __html: product.shortDescription || '' }} />

            {/* Product Pricing Flow Integrado */}
            <div className="mt-8">
              <ProductPricingFlow 
                product={product}
                onColorChange={(colorName, colorImage) => setActiveImage(colorImage || mainImage)}
              />
            </div>

            {/* Ventajas Rápidas */}
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-8">
              <div className="flex items-start gap-2">
                <Truck size={18} className="text-blue-700 mt-0.5" />
                <span>Envío rápido a toda la península</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={18} className="text-blue-700 mt-0.5" />
                <span>Garantía de calidad 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción Larga / Tabs */}
        <div className="mt-16 border-t border-slate-100 pt-12">
          <h2 className="text-2xl font-bold mb-6">Descripción Detallada</h2>
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '<p>Sin descripción detallada disponible.</p>' }} />
        </div>
      </div>
    </>
  );
}
