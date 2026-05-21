"use client";

import Link from "next/link";
import { useChildPages } from "@/hooks/useChildPages";
import { Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { PageBlock } from "@/queries/seoPageComplete";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';

interface SubcategoriasBlockProps {
  data: PageBlock;
}

/**
 * Bloque de subcategorías fusionado con hero
 * 
 * Diseño compacto: título/descripción a la izquierda + slider de subcategorías a la derecha
 * Fondo oscuro, slider con flechas, círculos con imágenes
 * 
 * Prioridad: ALTA (navegación interna + SEO + hero)
 */
export function SubcategoriasBlock({ data }: SubcategoriasBlockProps) {
  const {
    subcategoriasTitulo = "Explora por categoría",
    subcategoriasParent,
  } = data;

  const { childPages, loading, error } = useChildPages(subcategoriasParent ?? undefined);
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

  // Si no hay título, no renderizar nada
  if (!subcategoriasTitulo) return null;

  // Estado de error
  if (error) {
    console.error("[SubcategoriasBlock] Error loading subcategories:", error);
    return null;
  }

  // Sin páginas hijas (y no está cargando)
  if (!loading && (!childPages || childPages.length === 0)) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Izquierda: Título y subtítulo */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 uppercase tracking-tight">
              {subcategoriasTitulo}
            </h1>
            <p className="text-base md:text-lg text-slate-300 uppercase tracking-wide">
              Selecciona una categoría
            </p>
          </div>

          {/* Derecha: Slider de subcategorías */}
          <div className="w-full lg:w-2/3 relative">
            {loading ? (
              <div className="flex gap-4 md:gap-6 overflow-hidden py-4">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="flex-none w-[160px] md:w-[200px] lg:w-[220px] aspect-[4/5] rounded-2xl bg-slate-800 animate-pulse border border-slate-700"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Botones de navegación */}
                <button
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 -ml-6 shadow-xl border border-white/10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 -mr-6 shadow-xl border border-white/10"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Slider */}
                <div className="overflow-hidden rounded-xl" ref={emblaRef}>
                  <div className="flex gap-4 md:gap-6 py-4 px-2">
                    {childPages.map((childPage) => (
                      <Link
                        key={childPage.id}
                        href={childPage.uri}
                        className="flex-none group"
                      >
                        <div className="relative flex flex-col justify-end w-[160px] md:w-[200px] lg:w-[220px] aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-slate-700/50 group-hover:border-blue-500">
                          {/* Image */}
                          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                            {childPage.featuredImage?.node?.sourceUrl ? (
                              <img
                                src={childPage.featuredImage.node.sourceUrl}
                                alt={childPage.featuredImage.node.altText || childPage.title}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <Package className="w-12 h-12 text-slate-600 mb-8" />
                            )}
                          </div>
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Title */}
                          <div className="relative z-10 w-full p-5 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <h3 className="font-bold text-white text-base md:text-lg text-center leading-tight drop-shadow-md">
                              {childPage.title}
                            </h3>
                          </div>
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
    </div>
  );
}
