import { useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTransactionalPages } from '@/hooks/useTransactionalPages';
import { useTransactionalPage } from '@/hooks/useTransactionalPage';
import { PageBlock } from '@/queries/seoPageComplete';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { useChildPages } from '@/hooks/useChildPages';
import { Link } from 'wouter';
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefetch } from "@/hooks/usePrefetch";
import useEmblaCarousel from 'embla-carousel-react';
import { BreadcrumbsWithSchema } from '@/components/BreadcrumbsWithSchema';

/**
 * Página dinámica para renderizar páginas transaccionales desde WordPress
 * Usa la plantilla ACF "Plantilla SEO (Headless Minimal)"
 */
export default function TransactionalPage() {
  const [location] = useLocation();
  const { findPageByUri, loading: loadingList } = useTransactionalPages();

  // Buscar la página por URI
  const pageInfo = findPageByUri(location);
  const { page, blocks, loading: loadingPage, error } = useTransactionalPage(
    pageInfo?.databaseId || null
  );

  // Scroll to top al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Loading state
  if (loadingList || loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  // 404 - Página no encontrada o no es transaccional
  if (!pageInfo || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <p className="text-slate-600 mb-6">Página no encontrada</p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-slate-600 mb-6">
            No se pudo cargar la página. Por favor, intenta de nuevo.
          </p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  // SEO Meta
  const metaTitle = page.seoMeta?.openGraph?.title || page.title;
  const metaDescription =
    page.seoMeta?.metaDescription ||
    page.heroPageSeo?.intro ||
    '';
  const canonicalUrl =
    page.seoMeta?.canonicalUrl ||
    `https://impacto33.com${page.uri}`;
  const ogImage = page.seoMeta?.openGraph?.image?.node?.sourceUrl;

  // Robots meta
  const robotsIndex = page.seoMeta?.indexConfig?.index !== false;
  const robotsFollow = page.seoMeta?.indexConfig?.follow !== false;
  const robotsContent = `${robotsIndex ? 'index' : 'noindex'},${robotsFollow ? 'follow' : 'nofollow'}`;

  return (
    <>
      

      <div className="min-h-screen">
        {/* Hero Section Fusionado con Subcategorías */}
        {page.heroPageSeo && (
          <HeroWithSubcategories
            title={page.heroPageSeo.tituloPrincipal}
            description={page.heroPageSeo.intro}
            pageUri={page.uri}
            parentUri={page.parent?.node?.uri || null}
          />
        )}

        {/* Breadcrumbs (si está configurado) */}
        {page.seoMeta?.breadcrumbsConfig?.show && (
          <BreadcrumbsWithSchema 
            customPath={page.seoMeta.breadcrumbsConfig.customPath?.map(item => ({ label: item.label ?? '', url: item.url ?? undefined })) ?? undefined}
            currentPageTitle={page.title}
          />
        )}

        {/* Bloques Dinámicos */}
        {blocks.map((block, index) => (
          <BlockRenderer 
            key={index} 
            block={block} 
            index={index}
            pageUri={page.uri}
            pageTitle={page.title}
            parentUri={page.parent?.node?.uri || null}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Componente Hero fusionado con slider de subcategorías
 * Fondo oscuro, título/descripción a la izquierda, slider a la derecha
 */
interface HeroWithSubcategoriesProps {
  title: string | null;
  description: string | null;
  pageUri: string;
  parentUri?: string | null; // URI del padre (si es página hija)
}

function HeroWithSubcategories({ title, description, pageUri, parentUri }: HeroWithSubcategoriesProps) {
  // Si tiene padre, mostrar hermanas (siblings). Si no, mostrar hijas (children)
  const uriToFetch = parentUri || pageUri;
  const { childPages, loading } = useChildPages(uriToFetch);
  const prefetchPage = usePrefetch();
  
  // Filtrar la página actual de las hermanas (si estamos mostrando siblings)
  const pagesToShow = parentUri 
    ? childPages.filter(page => page.uri !== pageUri) // Excluir página actual de hermanas
    : childPages; // Mostrar todas las hijas
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Hero fusionado con slider de subcategorías
  return (
    <section className="bg-slate-900 text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Izquierda: Título y descripción */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold mb-4 uppercase tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Derecha: Slider de subcategorías o Estado */}
          <div className="w-full lg:w-2/3 relative">
            {loading ? (
              <div className="flex gap-6 md:gap-8 overflow-hidden items-center">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="flex flex-col items-center min-w-[120px] md:min-w-[140px] animate-pulse">
                    <div className="w-24 h-24 md:w-32 md:h-32 mb-3 rounded-full bg-slate-800"></div>
                    <div className="w-20 h-4 bg-slate-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (!pagesToShow || pagesToShow.length === 0) ? (
               // Si no hay subcategorías, no mostramos el slider
               <div className="flex items-center justify-center p-8 text-slate-500">
                 {/* Espacio reservado o vacío dependiendo del diseño deseado, lo quitaremos si no aplica */}
               </div>
            ) : (
              <>
                {/* Botones de navegación */}
                <button
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 -ml-5"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 -mr-5"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Slider */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-6 md:gap-8">
                    {pagesToShow.map((childPage) => (
                      <Link
                        key={childPage.id}
                        href={childPage.uri}
                        onMouseEnter={() => prefetchPage(childPage.uri)}
                      >
                        <div className="flex flex-col items-center group cursor-pointer min-w-[120px] md:min-w-[140px]">
                          {/* Imagen circular */}
                          <div className="w-24 h-24 md:w-32 md:h-32 mb-3 overflow-hidden rounded-full border-4 border-white group-hover:border-blue-400 transition-all duration-300 bg-slate-800 flex items-center justify-center shadow-lg">
                            {childPage.featuredImage?.node?.sourceUrl ? (
                              <img
                                src={childPage.featuredImage.node.sourceUrl}
                                alt={childPage.featuredImage.node.altText || childPage.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <Package className="w-10 h-10 md:w-12 md:h-12 text-slate-500" />
                            )}
                          </div>

                          {/* Título */}
                          <h3 className="font-bold text-white text-xs md:text-sm text-center group-hover:text-blue-400 transition-colors px-2 leading-tight">
                            {childPage.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
