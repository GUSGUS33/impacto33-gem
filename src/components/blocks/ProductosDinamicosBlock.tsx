"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductFilters, ColorOption, SubcategoryLink } from "@/components/ProductFilters";
import { useFilteredProducts, FilteredProduct, ProductVariation } from "@/hooks/useFilteredProducts";
import { PageBlock } from "@/queries/seoPageComplete";
import { useChildPages } from "@/hooks/useChildPages";

interface ProductosDinamicosBlockProps {
  data: PageBlock;
  pageUri?: string; // URI de la página actual
  pageTitle?: string; // Título de la página actual (categoría madre o hija)
  parentUri?: string | null; // URI del padre (si es página hija)
}

/**
 * Bloque de productos dinámicos para páginas transaccionales
 * 
 * Muestra productos filtrados por categoría y/o etiqueta con límite y ordenamiento.
 * Incluye navegación de categorías y filtro de color en sidebar izquierda.
 * Para productos variables, muestra la variación específica con su imagen por color.
 * 
 * Lógica de navegación:
 * - Página madre (sin padre): muestra hijas
 * - Página hija (con padre): muestra hermanas
 * 
 * Prioridad: ALTA (conversión directa)
 */
export const ProductosDinamicosBlock = React.memo(function ProductosDinamicosBlock({ data, pageUri, pageTitle, parentUri }: ProductosDinamicosBlockProps) {
  const location = usePathname() || "";
  
  // Si tiene padre, obtener hermanas. Si no, obtener hijas
  const uriToFetch = parentUri || pageUri || "";
  const { childPages } = useChildPages(uriToFetch);
  
  // Filtrar página actual si estamos mostrando hermanas
  const pagesToShow = parentUri 
    ? childPages.filter(page => page.uri !== pageUri) // Excluir página actual de hermanas
    : childPages; // Mostrar todas las hijas
  
  const {
    productosDinamicosTitulo = "Productos destacados",
    productosDinamicosCategoria,
    productosDinamicosEtiqueta,
    productosDinamicosMaximo = 12,
    productosDinamicosOrdenar = "DATE",
  } = data;

  // Si no hay categoría de WooCommerce configurada, marcar como no configurado
  // El slug de la URI de la página NO coincide con los slugs de WooCommerce
  const categorySlugToUse = productosDinamicosCategoria || null;
  const isMissingCategoryConfig = !productosDinamicosCategoria;

  // Estados de filtros
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Preparar datos de navegación de categorías (hijas o hermanas)
  const subcategories: SubcategoryLink[] = pagesToShow.map(child => ({
    name: child.title,
    url: child.uri,
  }));

  // Normalizar orderBy: puede venir como array o string desde WordPress
  let orderByRaw = "DATE";
  if (Array.isArray(productosDinamicosOrdenar) && productosDinamicosOrdenar.length > 0) {
    orderByRaw = String(productosDinamicosOrdenar[0]).toLowerCase();
  } else if (typeof productosDinamicosOrdenar === "string") {
    orderByRaw = productosDinamicosOrdenar.toLowerCase();
  }

  // Mapear valores de WordPress a enum ProductsOrderByEnum de WPGraphQL
  const orderByMap: Record<string, string> = {
    "popularity": "TOTAL_SALES",
    "rating": "RATING",
    "price": "PRICE",
    "date": "DATE",
    "title": "NAME",
    "name": "NAME",
  };

  const orderBy = orderByMap[orderByRaw] || "DATE";

  const { products, loading, error } = useFilteredProducts({
    categorySlug: categorySlugToUse,
    tagSlug: productosDinamicosEtiqueta,
    limit: productosDinamicosMaximo ?? undefined,
    orderBy: orderBy as any,
  });

  // Extraer colores únicos con sus imágenes de todas las variaciones
  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, string | null>();
    
    products.forEach((product) => {
      if (product.type === "VARIABLE" && product.variations?.nodes) {
        product.variations.nodes.forEach((variation) => {
          const colorAttr = variation.attributes.nodes.find(
            (attr) => attr.name.toLowerCase().includes("color") || attr.name.toLowerCase() === "pa_color"
          );
          if (colorAttr?.value) {
            // Solo agregar si no existe o si esta variación tiene imagen y la anterior no
            if (!colorsMap.has(colorAttr.value) || 
                (variation.image?.sourceUrl && !colorsMap.get(colorAttr.value))) {
              colorsMap.set(colorAttr.value, variation.image?.sourceUrl || null);
            }
          }
        });
      }
    });

    // Convertir Map a array de ColorOption y ordenar
    return Array.from(colorsMap.entries())
      .map(([color, imageUrl]): ColorOption => ({ color, imageUrl }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [products]);

  // Función auxiliar para obtener el color de una variación
  const getVariationColor = (variation: ProductVariation): string | null => {
    const colorAttr = variation.attributes.nodes.find(
      (attr) => attr.name.toLowerCase().includes("color") || attr.name.toLowerCase() === "pa_color"
    );
    return colorAttr?.value || null;
  };

  // Filtrar productos según filtros activos
  const filteredProducts = useMemo(() => {
    return products
      .map((product) => {
        // Si es producto variable y hay filtros de color
        if (product.type === "VARIABLE" && selectedColors.length > 0 && product.variations?.nodes) {
          // Buscar variación que coincida con alguno de los colores seleccionados
          const matchingVariation = product.variations.nodes.find((variation) => {
            const varColor = getVariationColor(variation);
            return varColor && selectedColors.includes(varColor);
          });

          if (!matchingVariation) {
            return null; // No hay variación con el color seleccionado
          }

          // Retornar producto con la variación específica
          return {
            ...product,
            selectedVariation: matchingVariation,
          };
        }

        // Producto simple o sin filtro de color
        return {
          ...product,
          selectedVariation: null,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [products, selectedColors]);

  // Handlers de filtros
  const handleColorChange = (colors: string[]) => {
    setSelectedColors(colors);
  };

  const handleClearFilters = () => {
    setSelectedColors([]);
  };

  // Si no hay título, no renderizar nada
  if (!productosDinamicosTitulo) return null;

  // Si falta la categoría de WooCommerce, mostrar aviso al administrador
  if (isMissingCategoryConfig) {
    return (
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {productosDinamicosTitulo}
        </h2>
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 text-amber-800 p-8 rounded-lg text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <p className="font-bold text-lg">Categoría de productos no configurada</p>
          <p className="text-sm mt-2 max-w-lg mx-auto">
            El campo <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">productosDinamicosCategoria</code> está vacío en WordPress para esta página.
          </p>
          <p className="text-sm mt-1 max-w-lg mx-auto">
            Configura el slug de la categoría de WooCommerce (ej: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">t_shirts</code>) en el bloque de productos dinámicos de esta página.
          </p>
          {pageUri && (
            <p className="text-xs mt-3 text-amber-600">
              Página: <code className="font-mono">{pageUri}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {productosDinamicosTitulo}
        </h2>
        <div className="flex gap-8">
          {/* Skeleton sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Skeleton className="h-96 w-full" />
          </div>
          {/* Skeleton grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    console.error("[ProductosDinamicosBlock] Error loading products:", error);
    return (
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {productosDinamicosTitulo}
        </h2>
        <div className="bg-red-50 border border-red-100 text-red-800 p-8 rounded-sm text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="font-medium">Error cargando productos</p>
          <p className="text-sm opacity-80 mt-1">Por favor, intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  // Sin productos (pero la categoría sí está configurada)
  if (!products || products.length === 0) {
    return (
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {productosDinamicosTitulo}
        </h2>
        <div className="bg-slate-50 border border-dashed border-slate-300 text-slate-600 p-8 rounded-lg text-center">
          <p className="font-medium">No se encontraron productos para la categoría <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-xs">{categorySlugToUse}</code></p>
          <p className="text-sm mt-2 text-slate-500">Verifica que el slug de WooCommerce es correcto en el campo <code className="font-mono text-xs">productosDinamicosCategoria</code>.</p>
        </div>
      </div>
    );
  }

  // Generar Product Schema para cada producto visible
  const productSchemas = filteredProducts.map((product) => {
    const selectedVar = product.selectedVariation;
    const displayImage = selectedVar?.image?.sourceUrl || product.featuredImage?.node?.sourceUrl;
    const displayPrice = selectedVar?.price || product.salePrice || product.price || product.regularPrice;
    
    // Extraer precio numérico (eliminar símbolos de moneda y espacios)
    const priceValue = displayPrice ? parseFloat(displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) : 0;
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": displayImage || '',
      "description": product.name,
      "sku": product.databaseId.toString(),
      "brand": {
        "@type": "Brand",
        "name": "IMPACTO33"
      },
      "offers": {
        "@type": "Offer",
        "url": `${window.location.origin}/producto/${product.slug}`,
        "priceCurrency": "EUR",
        "price": priceValue.toFixed(2),
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      }
    };
  });

  return (
    <div className="container">
      {/* Product Schema (JSON-LD) para cada producto */}
      {productSchemas.map((schema, index) => (
        <script
          key={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      {/* Título del bloque */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 md:mb-12 text-center">
        {productosDinamicosTitulo}
      </h2>

      {/* Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros (solo desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            parentCategoryName={pageTitle}
            parentCategoryUrl={pageUri}
            subcategories={subcategories}
            currentCategoryUrl={location}
            availableColors={availableColors}
            onColorChange={handleColorChange}
            selectedColors={selectedColors}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Grid de productos */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No se encontraron productos</p>
              <p className="text-sm mt-2">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {filteredProducts.map((product) => {
                // Determinar imagen y precio a mostrar
                const selectedVar = product.selectedVariation;
                const displayImage = selectedVar?.image?.sourceUrl || product.featuredImage?.node?.sourceUrl;
                const displayAlt = selectedVar?.image?.altText || product.featuredImage?.node?.altText || product.name;
                const displayPrice = selectedVar?.price || product.salePrice || product.price || product.regularPrice;

                return (
                  <div
                    key={`${product.id}-${selectedVar?.id || "default"}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full"
                  >
                    {/* Imagen del producto - clickeable */}
                    <Link href={`/producto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden block bg-slate-50">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={displayAlt}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                            <span className="text-[10px] md:text-xs uppercase font-bold text-center px-1">Sin imagen</span>
                          </div>
                        )}

                        {/* Botón de favorito */}
                        <div className="absolute top-2 left-2 z-10 opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                          <FavoriteButton
                            productId={product.databaseId}
                            productSlug={product.slug}
                            size="sm"
                            className="bg-white rounded-full p-2 shadow-sm hover:shadow-md"
                          />
                        </div>

                        {/* Badge de color seleccionado */}
                        {selectedVar && (
                          <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700">
                            {getVariationColor(selectedVar)}
                          </div>
                        )}
                    </Link>

                    {/* Información del producto */}
                    <div className="flex-grow flex flex-col p-4 md:p-5">
                      {/* Título clickeable */}
                      <Link href={`/producto/${product.slug}`}>
                        <h3 className="font-bold text-slate-900 text-xs md:text-sm mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between">
                        <div className="text-[10px] md:text-xs text-slate-500">
                          Desde <span className="text-slate-900 font-bold text-sm md:text-base">{formatPrice(displayPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
