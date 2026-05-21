"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DynamicProductBlock } from "@/components/DynamicProductBlock";
import { RelatedCategories } from "@/components/RelatedCategories";
import { ProductFilters } from "@/components/ProductFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ChevronRight, Home } from "lucide-react";
import { SeoContentBlock } from "@/components/SeoContentBlock";
import { SeoCategoryData, SeoDataMap } from "@shared/types";
// import seoDataRaw from "@/data/seo-data.json";
import dynamicBlocks from "@/data/dynamic-blocks.json";

// Cast imported JSON to typed map
// const seoData = seoDataRaw as SeoDataMap;
import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useParams();
  
  // Determine current slug from URL params
  // Route: /:category, /:category/:subcategory, or /:category/:subcategory/:child
  // We need to match the slug key in seo-data.json
  // Priority: child > subcategory > category
  const categorySlug = params?.child || params?.subcategory || params?.category;
  
  // Find category data
  const [categoryData, setCategoryData] = useState<SeoCategoryData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    async function loadCategoryData() {
      if (!categorySlug) return;
      
      setLoading(true);
      try {
        // Intentar cargar el JSON específico de la categoría
        const categoryJson = await import(`../data/categories/${categorySlug}.json`);
        setCategoryData(categoryJson.default as SeoCategoryData);
      } catch (error) {
        console.error(`Error loading category data for ${categorySlug}:`, error);
        setCategoryData(undefined);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Categoría no encontrada</h1>
        <p className="text-slate-500 mb-8">Lo sentimos, no hemos podido encontrar la categoría que buscas.</p>
        <Link href="/">
          <span className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors cursor-pointer">
            Volver al inicio
          </span>
        </Link>
      </div>
    );
  }

  // Find dynamic block configuration for products
  // Normalize URLs by removing trailing slashes for comparison
  const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;
  const currentUrl = normalizeUrl(categoryData.url);
  
  const blockConfig = dynamicBlocks.find(block => normalizeUrl(block.url) === currentUrl);
  const catalogSlug = blockConfig ? blockConfig.catalog_category_slug : categoryData.slug;



  return (
    <>
      

      <div className="bg-white min-h-screen">
        {/* Breadcrumbs */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-slate-500">
                    <Link href="/">
                <span className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                  <Home size={14} className="mr-1" />
                  Inicio
                </span>
              </Link>
              <ChevronRight size={14} className="mx-2 text-slate-300" />
              {/* Breadcrumb logic for 3 levels */}
              {/* If we have a child param, we might need to reconstruct the path manually or rely on parent_slug from JSON */}
              {/* Ideally, the JSON should contain the full hierarchy or we infer it from URL params */}
              
              {params?.category && params?.subcategory && params?.child && (
                <>
                  <Link href={`/${params.category}`}>
                    <span className="hover:text-blue-600 transition-colors capitalize cursor-pointer">
                      {(params.category as string).replace(/-/g, ' ')}
                    </span>
                  </Link>
                  <ChevronRight size={14} className="mx-2 text-slate-300" />
                  <Link href={`/${params.category}/${params.subcategory}`}>
                    <span className="hover:text-blue-600 transition-colors capitalize cursor-pointer">
                      {(params.subcategory as string).replace(/-/g, ' ')}
                    </span>
                  </Link>
                  <ChevronRight size={14} className="mx-2 text-slate-300" />
                </>
              )}

              {params?.category && params?.subcategory && !params?.child && (
                 <>
                  <Link href={`/${params.category}`}>
                    <span className="hover:text-blue-600 transition-colors capitalize cursor-pointer">
                      {(params.category as string).replace(/-/g, ' ')}
                    </span>
                  </Link>
                  <ChevronRight size={14} className="mx-2 text-slate-300" />
                </>
              )}
              <span className="font-semibold text-slate-900 capitalize">
                {categoryData.slug.replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Hero Title & 2. Intro (Rendered by SeoContentBlock) */}
        {/* 3. Hub Subcategorías (Rendered by SeoContentBlock) */}
        {/* 5. Ventajas Empresa (Rendered by SeoContentBlock) */}
        {/* 6. Casos de Uso (Rendered by SeoContentBlock) */}
        {/* 7. FAQ (Rendered by SeoContentBlock) */}
        {/* 8. Texto Final & 9. CTA (Rendered by SeoContentBlock) */}
        
        {/* We need to interleave the Product Block (4) inside the flow */}
        {/* Since SeoContentBlock is monolithic, we might need to split it or pass the product block as children/prop */}
        {/* For now, let's render SeoContentBlock but inject the product block in the middle if we refactor SeoContentBlock */}
        {/* OR: We can render the top part, then products, then bottom part. */}
        
        {/* Let's modify SeoContentBlock to accept children for the product grid position */}
        
        <div className="space-y-16 py-12">
          
          {/* Blocks 1, 2, 3 */}
          <section className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-[32px] font-bold text-[#48475c] mb-6 font-['Montserrat'] leading-tight first-letter:uppercase lowercase">
              {categoryData.hero_tituloPrincipal}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {categoryData.hero_intro}
            </p>
          </section>

          {/* Interlinking Contextual (Madre/Hijas) */}
          <RelatedCategories currentUrl={currentUrl} />

          {/* Subcategorías Visuales (Nuevo JSON) */}
          {categoryData.subcategories && categoryData.subcategories.length > 0 && (
            <section className="container mx-auto px-4 mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">{categoryData.hub_subcategorias_texto || "Explora nuestras categorías"}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categoryData.subcategories.map((sub, idx) => (
                  <Link key={idx} href={sub.url}>
                    <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-all cursor-pointer h-full group">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 mb-2 text-sm">{sub.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{sub.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 4. Dynamic Products Block with Sidebar */}
          <section className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <ProductFilters 
                    onColorChange={(colors) => setFilters((prev: any) => ({ ...prev, colors }))}
                    selectedColors={filters?.colors || []}
                    onClearFilters={() => setFilters({})}
                  />
                </div>
              </aside>

              {/* Mobile Filter Trigger */}
              <div className="lg:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Filter size={16} />
                      Filtrar Productos
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <div className="py-4">
                      <ProductFilters 
                        onColorChange={(colors) => setFilters((prev: any) => ({ ...prev, colors }))}
                        selectedColors={filters?.colors || []}
                        onClearFilters={() => setFilters({})}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <DynamicProductBlock 
                  categorySlug={catalogSlug} 
                  limit={blockConfig?.limit || 24} 
                  columns={3} // Reducimos columnas a 3 para acomodar el sidebar
                  filters={{
                    minPrice: filters.price?.[0],
                    maxPrice: filters.price?.[1],
                    attributes: filters.attributes
                  }}
                />
              </div>
            </div>
          </section>

          {/* Remaining Blocks handled by SeoContentBlock (partial render or full if we didn't split manually above) */}
          {/* To avoid duplication, we should use the components from SeoContentBlock or refactor it to be more granular. */}
          {/* For this iteration, I will render the rest of the content using the SeoContentBlock component but I'll modify it to optionally skip the header parts if already rendered. */}
          {/* Actually, let's just use the SeoContentBlock for the bottom half to keep it clean. */}
          
          <SeoContentBlock data={categoryData} />

          {/* Featured Review (Nuevo JSON) */}
          {categoryData.featured_review && (
            <section className="container mx-auto px-4 mb-16">
              <div className="bg-blue-50 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="flex justify-center mb-6">
                  {[...Array(categoryData.featured_review.rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-medium text-slate-800 mb-6 italic">
                  "{categoryData.featured_review.text}"
                </blockquote>
                <div className="text-slate-600">
                  <span className="font-bold text-slate-900">{categoryData.featured_review.author}</span>
                  <span className="mx-2">•</span>
                  <span>{categoryData.featured_review.company}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
