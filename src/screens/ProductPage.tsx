import { useRoute, Link } from 'wouter';
import Image from 'next/image';
import { useProduct } from '../hooks/useProduct';

import { Product } from "@shared/types";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Home, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { trackProductView } from '@/services/trackingService';
import { getProductBreadcrumbChain } from '@/lib/slugMap';

// Pricing Components
import ProductPricingFlow from '@/components/pricing/ProductPricingFlow';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FormattedDescription } from '@/components/FormattedDescription';

export default function ProductPage() {
  const [, params] = useRoute('/producto/:slug');
  const slug = params?.slug;

  const { product, loading, error } = useProduct(slug || '');
  const { user } = useAuth();
  
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColorImage, setSelectedColorImage] = useState<string>('');
  const [modalImage, setModalImage] = useState<string>(''); // Para el modal de imagen ampliada

  // Registrar vista del producto cuando se carga
  useEffect(() => {
    if (product && user) {
      trackProductView({
        productId: parseInt(product.id),
        productSlug: product.slug,
      });
    }
  }, [product?.id, product?.slug, user]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setMainImage(product.featuredImage?.node?.sourceUrl || product.galleryImages?.nodes?.[0]?.sourceUrl || '/placeholder-image.jpg');
    }
  }, [product?.id]);

  // Manejar cambio de color - actualizar imagen principal
  const handleColorChange = (colorName: string, colorImage?: string) => {
    if (colorImage) {
      setSelectedColorImage(colorImage);
    }
  };

  // Manejar solicitud de presupuesto
  const handleRequestQuote = (quoteData: any) => {
    console.log("Solicitud de presupuesto:", quoteData);
    // Aquí redirigiríamos a la página de checkout/presupuesto con los datos
    // El modal se abre internamente en ProductPricingFlow
    // window.location.href = '/presupuesto-rapido';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="mb-8">Lo sentimos, no hemos podido cargar el producto que buscas.</p>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';
  
  // Extraer ID numérico del formato GraphQL de WooCommerce (gid://shopify/Product/123 o similar)
  const extractProductId = (graphqlId: string): number => {
    // Si es un número directo, usarlo
    const directNum = parseInt(graphqlId, 10);
    if (!isNaN(directNum)) return directNum;
    
    // Si es un GraphQL ID, extraer el número del final
    const match = graphqlId.match(/(\d+)$/);
    if (match) return parseInt(match[1], 10);
    
    // Si todo falla, usar el hash del slug como ID
    return Math.abs(product.slug.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  };
  
  const productId = extractProductId(product.id);
  const categoryChain = getProductBreadcrumbChain({
    productSlug: product.slug,
    productName: product.name,
    categories: product.productCategories?.nodes,
  });

  return (
    <>
      

      <div className="bg-white min-h-screen pb-20">
        {/* Breadcrumbs */}
        <div className="bg-slate-50 border-b border-slate-200 mb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-slate-500 flex-wrap gap-y-1">
              <Link href="/">
                <span className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                  <Home size={16} className="mr-1" />
                  Inicio
                </span>
              </Link>
              {categoryChain.map((item, idx) => (
                <React.Fragment key={item.url + idx}>
                  <ChevronRight size={16} className="mx-2 text-slate-300 flex-shrink-0" />
                  <Link href={item.url}>
                    <span className="hover:text-blue-600 transition-colors cursor-pointer font-medium text-slate-700">
                      {item.label}
                    </span>
                  </Link>
                </React.Fragment>
              ))}
              <ChevronRight size={16} className="mx-2 text-slate-300 flex-shrink-0" />
              <span className="font-semibold text-slate-900 truncate max-w-[300px]">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery - Sticky on Desktop */}
            <div className="space-y-4 lg:sticky lg:top-[120px] lg:h-fit">
              {/* Mobile: Imagen principal + miniaturas (diseño original) */}
              <div className="lg:hidden space-y-4">
                <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                  {product.onSale && (
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 z-10">Oferta</Badge>
                  )}
                  <Image 
                    src={selectedColorImage || mainImage || '/placeholder-image.jpg'} 
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
                    onClick={() => setModalImage(selectedColorImage || mainImage || '/placeholder-image.jpg')}
                  />
                </div>
                {product.galleryImages?.nodes && product.galleryImages.nodes.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.galleryImages.nodes.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setMainImage(img.sourceUrl)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${mainImage === img.sourceUrl ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'}`}
                      >
                        <Image src={img.sourceUrl} alt={img.altText || product.name} fill sizes="20vw" loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Grid 2x2 con 4 imágenes grandes + miniaturas debajo */}
              <div className="hidden lg:block space-y-4">
                {(() => {
                  // Preparar array de imágenes: imagen de color seleccionado primero, luego el resto
                  const allImages = product.galleryImages?.nodes || [];
                  let orderedImages = [];

                  // Si hay imagen de color seleccionado, crear objeto temporal y ponerlo primero
                  if (selectedColorImage) {
                    orderedImages.push({
                      sourceUrl: selectedColorImage,
                      altText: `${product.name} - Color seleccionado`
                    });
                    // Agregar el resto de imágenes (excluyendo la del color si ya está en gallery)
                    orderedImages.push(...allImages.filter(img => img.sourceUrl !== selectedColorImage));
                  } else {
                    // Si no hay color seleccionado, usar todas las imágenes de gallery
                    orderedImages = [...allImages];
                  }

                  // Si no hay suficientes imágenes, agregar la featured
                  if (orderedImages.length === 0 && product.featuredImage?.node) {
                    orderedImages = [product.featuredImage.node];
                  }

                  const firstFourImages = orderedImages.slice(0, 4);
                  const remainingImages = orderedImages.slice(4);

                  return (
                    <>
                      {/* Grid 2x2 con las primeras 4 imágenes */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {firstFourImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setModalImage(img.sourceUrl)}
                            className="aspect-[4/5] bg-slate-50 border border-slate-100 shadow-sm overflow-hidden rounded-lg hover:opacity-95 transition-all relative group"
                          >
                            {idx === 0 && product.onSale && (
                              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 z-10">Oferta</Badge>
                            )}
                            <Image
                              src={img.sourceUrl}
                              alt={img.altText || product.name}
                              fill
                              priority={idx === 0}
                              sizes="(max-width: 1280px) 25vw, 20vw"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </button>
                        ))}
                      </div>

                      {/* Miniaturas adicionales si hay más de 4 imágenes */}
                      {remainingImages.length > 0 && (
                        <div className="grid grid-cols-6 gap-2">
                          {remainingImages.map((img, idx) => (
                            <button
                              key={idx + 4}
                              onClick={() => setModalImage(img.sourceUrl)}
                              className="aspect-square rounded-md overflow-hidden hover:opacity-90 transition-all relative"
                            >
                              <Image
                                src={img.sourceUrl}
                                alt={img.altText || product.name}
                                fill
                                sizes="10vw"
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Descripción detallada - Movida aquí desde el lado derecho */}
              <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-900">Descripción detallada</h3>
                {product.description ? (
                  <FormattedDescription html={product.description} />
                ) : (
                  <p className="text-slate-500 italic">No hay descripción disponible para este producto.</p>
                )}
              </div>
            </div>

            {/* Modal para ampliar imagen */}
            {modalImage && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={() => setModalImage('')}
              >
                <button
                  onClick={() => setModalImage('')}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={modalImage}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-[32px] font-bold text-[#48475c] mb-4 font-['Montserrat'] leading-tight first-letter:uppercase lowercase">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const p = formatPrice(product.price);
                      if (!p) return 'Consultar Precio';
                      return p.toLowerCase().includes('desde') ? p : `Desde ${p}`;
                    })()}
                  </div>
                  
                  {isOutOfStock ? (
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-3 py-1">Agotado</Badge>
                  ) : (
                    <span className="text-green-600 flex items-center text-sm font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <Check size={16} className="mr-1" /> Stock disponible
                    </span>
                  )}
                  
                  <div className="ml-auto">
                    <FavoriteButton
                      productId={productId}
                      productSlug={product.slug}
                      size="lg"
                    />
                  </div>
                </div>

                <div 
                  className="prose prose-slate text-slate-600 mb-8"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }} 
                />
              </div>

              {/* --- NEW PRICING FLOW INTEGRATION --- */}
              <ProductPricingFlow 
                product={product}
                onRequestQuote={handleRequestQuote}
                onColorChange={handleColorChange}
              />
              {/* ------------------------------------ */}

              {/* Bloque de Confianza - Minimalista */}
              <div className="mt-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                  <span className="font-semibold text-slate-900">Revisión de diseño gratuita:</span> Verificamos tus archivos antes de imprimir para un resultado perfecto.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🛡️</span>
                    <span className="font-medium">Impresión Garantizada</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🚚</span>
                    <span className="font-medium">Plazos Cumplidos</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">💳</span>
                    <span className="font-medium">Pago Seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {product.related?.nodes && product.related.nodes.length > 0 && (
            <div className="mt-20 border-t border-slate-200 pt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">También te podría interesar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {product.related.nodes.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/producto/${relatedProduct.slug}`}>
                    <div className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="aspect-square bg-slate-50 p-4 relative overflow-hidden">
                        <img 
                          src={relatedProduct.featuredImage?.node?.sourceUrl || '/placeholder-image.jpg'} 
                          alt={relatedProduct.featuredImage?.node?.altText || relatedProduct.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Ver detalles</span>
                          <ChevronRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
