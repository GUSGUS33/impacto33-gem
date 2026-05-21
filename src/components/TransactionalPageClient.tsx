"use client";

/**
 * Client Component wrapper para TransactionalPage.
 * Recibe los datos pre-fetched del Server Component y renderiza
 * los bloques interactivos (BlockRenderer, HeroWithSubcategories, etc.)
 *
 * TODO: En una fase posterior, migrar bloques individuales que no necesiten
 * interactividad a Server Components para reducir el bundle JS del cliente.
 */

import { useCallback } from "react";
import Link from "next/link";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BreadcrumbsWithSchema } from "@/components/BreadcrumbsWithSchema";
import { useChildPages } from "@/hooks/useChildPages";
import { usePrefetch } from "@/hooks/usePrefetch";
import type { PageBlock } from "@/queries/seoPageComplete";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface PageData {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  parent?: {
    node: {
      id: string;
      uri: string;
    };
  } | null;
  heroPageSeo: {
    tituloPrincipal: string | null;
    intro: string | null;
  } | null;
  seoMeta: {
    metaDescription: string | null;
    canonicalUrl: string | null;
    schemaType: string | null;
    openGraph: {
      title: string | null;
      description: string | null;
      image: {
        node: {
          sourceUrl: string;
          altText: string;
          mediaDetails: { width: number; height: number };
        };
      } | null;
    } | null;
    breadcrumbsConfig: {
      show: boolean | null;
      customPath: Array<{
        label: string | null;
        url: string | null;
      }> | null;
    } | null;
    indexConfig: {
      index: boolean | null;
      follow: boolean | null;
    } | null;
  } | null;
  pageBlocks: {
    pageBlocks: PageBlock[];
  } | null;
}

interface TransactionalPageClientProps {
  page: PageData;
  blocks: PageBlock[];
}

// ─── Componente principal ───────────────────────────────────────────────────

export default function TransactionalPageClient({
  page,
  blocks,
}: TransactionalPageClientProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section fusionado con subcategorías */}
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
          customPath={
            page.seoMeta.breadcrumbsConfig.customPath?.map((item) => ({
              label: item.label ?? "",
              url: item.url ?? undefined,
            })) ?? undefined
          }
          currentPageTitle={page.title}
          currentUri={page.uri}
          baseUrl="https://impacto33.com"
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
  );
}

// ─── HeroWithSubcategories ─────────────────────────────────────────────────

interface HeroWithSubcategoriesProps {
  title: string | null;
  description: string | null;
  pageUri: string;
  parentUri?: string | null;
}

function HeroWithSubcategories({
  title,
  description,
  pageUri,
  parentUri,
}: HeroWithSubcategoriesProps) {
  const uriToFetch = parentUri || pageUri;
  const { childPages, loading } = useChildPages(uriToFetch);
  const prefetchPage = usePrefetch();

  // Filtrar la página actual de las hermanas
  const pagesToShow = parentUri
    ? childPages.filter((p) => p.uri !== pageUri)
    : childPages;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="bg-slate-900 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Lado izquierdo: Título y descripción */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Lado derecho: Slider de subcategorías/hermanas o Skeleton */}
          <div className="lg:w-1/2 w-full">
            {loading ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map((skeleton) => (
                    <div key={skeleton} className="flex-[0_0_160px] md:flex-[0_0_200px]">
                      <div className="bg-slate-800 rounded-2xl w-full aspect-[4/5] animate-pulse border border-slate-700">
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (!pagesToShow || pagesToShow.length === 0) ? (
              // Si no hay subcategorías, se puede dejar un espacio vacío o mostrar algo alternativo
              <div className="flex justify-center items-center h-full"></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {parentUri ? "Categorías relacionadas" : "Subcategorías"}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={scrollPrev}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-4">
                    {pagesToShow.map((childPage) => {
                      const normalizedUri =
                        childPage.uri.endsWith("/") && childPage.uri.length > 1
                          ? childPage.uri.slice(0, -1)
                          : childPage.uri;
                      return (
                        <div
                          key={childPage.id}
                          className="flex-[0_0_160px] md:flex-[0_0_200px]"
                        >
                          <Link
                            href={normalizedUri}
                            onMouseEnter={() => prefetchPage(childPage.uri)}
                            className="block"
                          >
                            <div className="relative flex flex-col justify-end w-full aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-slate-700/50 group-hover:border-blue-500 group">
                              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                {childPage.featuredImage?.node?.sourceUrl ? (
                                  <img
                                    src={childPage.featuredImage.node.sourceUrl}
                                    alt={
                                      childPage.featuredImage.node.altText ||
                                      childPage.title
                                    }
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Package className="w-12 h-12 text-slate-600 mb-8" />
                                )}
                              </div>
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              <div className="relative z-10 w-full p-4 md:p-5 transform group-hover:-translate-y-2 transition-transform duration-500">
                                <span className="block font-bold text-white text-base md:text-lg text-center leading-tight drop-shadow-md">
                                  {childPage.title}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
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
