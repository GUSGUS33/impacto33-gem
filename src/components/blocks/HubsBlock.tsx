"use client";

import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageBlock, HubItem } from "@/queries/seoPageComplete";
import { GET_CATEGORIES_FOR_HUB } from "@/queries/hubCategories";
import { useQuery } from "@apollo/client";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Sparkles, FolderOpen, ArrowRight } from "lucide-react";

interface HubsBlockProps {
  data: PageBlock;
}

interface ProductCategoryNode {
  id: string;
  name: string;
  slug: string;
  uri: string;
  image?: {
    sourceUrl: string;
    altText?: string;
    mediaDetails?: {
      width?: number | null;
      height?: number | null;
    } | null;
  } | null;
}

interface CategoriesQueryData {
  productCategories?: {
    nodes: ProductCategoryNode[];
  };
}

/**
 * Calcula la proporción CSS (ej. "4 / 5", "1 / 1", "4 / 3", "16 / 10")
 * según el ancho y alto de la imagen para que se adapte perfectamente:
 * - Vertical (moda/textil/sudaderas): 4/5, 3/4 o 2/3
 * - Cuadrada: 1/1 completa
 * - Horizontal/panorámica: 4/3 o 16/10
 */
function getAspectRatioFromDimensions(width?: number | null, height?: number | null): string | null {
  if (!width || !height || height === 0) return null;
  const ratio = width / height;
  if (ratio <= 0.88) {
    // Vertical / Retrato (típico en moda / sudaderas / catálogo)
    if (Math.abs(ratio - 0.8) <= 0.06) return "4 / 5";
    if (Math.abs(ratio - 0.75) <= 0.05) return "3 / 4";
    if (Math.abs(ratio - 0.667) <= 0.05) return "2 / 3";
    return `${width} / ${height}`;
  }
  if (ratio <= 1.15) {
    // Cuadrada completa (1:1)
    return "1 / 1";
  }
  if (ratio <= 1.45) {
    // Horizontal clásica (4:3)
    return "4 / 3";
  }
  if (ratio <= 1.7) {
    // Panorámica (16:10)
    return "16 / 10";
  }
  return "16 / 9";
}

interface HubCardProps {
  item: HubItem;
  index: number;
  category?: ProductCategoryNode;
  fallbackAspectRatio: string;
  onAspectDetected?: (aspectRatio: string) => void;
}

const HubCard = React.memo(function HubCard({
  item,
  index,
  category,
  fallbackAspectRatio,
  onAspectDetected,
}: HubCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  // Resolución de URL
  let url = item.urlOverride?.trim() || "";
  if (!url && category?.uri) {
    url = category.uri;
  } else if (!url && item.slugCategoria) {
    url = `/categoria-producto/${item.slugCategoria}/`;
  }
  if (!url) url = "#";

  // Si es URL absoluta hacia impacto33.com, convertir a ruta relativa interna
  if (url.startsWith("https://impacto33.com") || url.startsWith("http://impacto33.com")) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      // Ignorar si falla parseo
    }
  } else if (url !== "#" && !url.startsWith("http") && !url.startsWith("/")) {
    url = `/${url}`;
  }

  // Resolución de imagen
  const imageUrl = item.imagenOverride?.node?.sourceUrl || category?.image?.sourceUrl || null;
  const imageAlt = item.imagenOverride?.node?.altText || category?.image?.altText || item.texto || "Imagen hub";

  // Dimensiones conocidas por GraphQL
  const knownWidth = item.imagenOverride?.node?.mediaDetails?.width || category?.image?.mediaDetails?.width;
  const knownHeight = item.imagenOverride?.node?.mediaDetails?.height || category?.image?.mediaDetails?.height;

  // Aspect ratio calculado estáticamente o detectado en cliente
  const staticRatio = useMemo(() => {
    return getAspectRatioFromDimensions(knownWidth, knownHeight);
  }, [knownWidth, knownHeight]);

  const [detectedRatio, setDetectedRatio] = useState<string | null>(staticRatio);

  // Manejador al cargar o comprobar imagen en caché
  const handleImageDimensions = useCallback(
    (nw: number, nh: number) => {
      const r = getAspectRatioFromDimensions(nw, nh);
      if (r) {
        setDetectedRatio(r);
        if (onAspectDetected) {
          onAspectDetected(r);
        }
      }
    },
    [onAspectDetected]
  );

  useEffect(() => {
    if (staticRatio) {
      setDetectedRatio(staticRatio);
      if (onAspectDetected) {
        onAspectDetected(staticRatio);
      }
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth) {
      handleImageDimensions(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    }
  }, [staticRatio, imageUrl, handleImageDimensions, onAspectDetected]);

  // Proporción final para el contenedor de la imagen
  const activeAspectRatio = detectedRatio || staticRatio || fallbackAspectRatio || "4 / 5";

  // Título y estado destacado
  const cardTitle = item.texto || category?.name || "Ver más";
  const isDestacado = !!item.destacado;

  return (
    <Link
      href={url}
      className={`group flex flex-col h-full bg-white rounded-xl overflow-hidden transition-all duration-300 ${
        isDestacado
          ? "border-2 border-blue-500 shadow-lg ring-2 ring-blue-500/20 hover:border-blue-600 hover:shadow-xl"
          : "border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md"
      }`}
    >
      {/* Contenedor de imagen adaptativo a vertical o cuadrada */}
      <div
        className="relative w-full bg-slate-100 overflow-hidden"
        style={{ aspectRatio: activeAspectRatio }}
      >
        {imageUrl ? (
          <img
            ref={imgRef}
            src={imageUrl}
            alt={imageAlt}
            loading={index < 4 ? "eager" : "lazy"}
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                handleImageDimensions(naturalWidth, naturalHeight);
              }
            }}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <FolderOpen className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}

        {/* Gradiente sutil inferior SOLO si existe etiqueta sobre la imagen para legibilidad */}
        {item.etiquetaImagen && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
        )}

        {/* Caption sobre la imagen (etiquetaImagen) */}
        {item.etiquetaImagen && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-950/70 text-white backdrop-blur-xs border border-white/10 shadow-xs">
              {item.etiquetaImagen}
            </span>
          </div>
        )}

        {/* Badge de destacado en la imagen */}
        {isDestacado && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              Destacado
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la card */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Etiqueta / badge superior */}
          {item.etiqueta && (
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 mb-1.5 block">
              {item.etiqueta}
            </span>
          )}

          {/* Texto ancla (título) */}
          <h3 className="font-bold text-slate-900 text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {cardTitle}
          </h3>

          {/* Mini descripción */}
          {item.descripcion && (
            <p className="mt-1.5 text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {item.descripcion}
            </p>
          )}
        </div>

        {/* Flecha indicadora en el footer */}
        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
          <span>Explorar</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
});

export const HubsBlock = React.memo(function HubsBlock({ data }: HubsBlockProps) {
  const {
    hubTitulo,
    hubSubtitulo,
    hubColumnas,
    hubVista,
    hubItems = [],
  } = data;

  const items = useMemo(() => (hubItems || []) as HubItem[], [hubItems]);

  // Identificar slugs de categorías que necesitamos resolver
  const slugsToFetch = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.slugCategoria && item.slugCategoria.trim()) {
        set.add(item.slugCategoria.trim());
      }
    });
    return Array.from(set);
  }, [items]);

  // Consulta de categorías si hay slugs
  const { data: catData } = useQuery<CategoriesQueryData>(GET_CATEGORIES_FOR_HUB, {
    variables: { slugs: slugsToFetch },
    skip: slugsToFetch.length === 0,
  });

  // Mapa de categorías por slug
  const categoriesMap = useMemo(() => {
    const map = new Map<string, ProductCategoryNode>();
    if (catData?.productCategories?.nodes) {
      catData.productCategories.nodes.forEach((cat) => {
        if (cat.slug) {
          map.set(cat.slug.toLowerCase(), cat);
        }
      });
    }
    return map;
  }, [catData]);

  // Proporción por defecto para el bloque (calculada a partir de los datos GraphQL de los items)
  const defaultBlockRatio = useMemo(() => {
    for (const item of items) {
      const w = item.imagenOverride?.node?.mediaDetails?.width;
      const h = item.imagenOverride?.node?.mediaDetails?.height;
      const aspect = getAspectRatioFromDimensions(w, h);
      if (aspect) return aspect;

      const slug = item.slugCategoria?.trim().toLowerCase();
      if (slug && categoriesMap.has(slug)) {
        const cat = categoriesMap.get(slug);
        const cw = cat?.image?.mediaDetails?.width;
        const ch = cat?.image?.mediaDetails?.height;
        const catAspect = getAspectRatioFromDimensions(cw, ch);
        if (catAspect) return catAspect;
      }
    }
    // Si no hay información previa, por defecto 4 / 5 (vertical textil/ropa)
    return "4 / 5";
  }, [items, categoriesMap]);

  const [activeBlockRatio, setActiveBlockRatio] = useState<string>(defaultBlockRatio);

  useEffect(() => {
    setActiveBlockRatio(defaultBlockRatio);
  }, [defaultBlockRatio]);

  const handleAspectDetected = useCallback((aspectRatio: string) => {
    setActiveBlockRatio((prev) => (prev === "4 / 5" ? aspectRatio : prev));
  }, []);

  // Determinar vista: "carousel" vs "grid"
  const isCarousel = useMemo(() => {
    if (!hubVista) return false;
    const vistaVal = Array.isArray(hubVista) ? hubVista[0] : hubVista;
    return typeof vistaVal === "string" && vistaVal.toLowerCase().includes("carousel");
  }, [hubVista]);

  // Determinar columnas para modo grid (default: 4)
  const columnsClass = useMemo(() => {
    if (!hubColumnas) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    const colVal = Array.isArray(hubColumnas) ? hubColumnas[0] : hubColumnas;
    const colStr = String(colVal).trim();

    switch (colStr) {
      case "2":
        return "grid-cols-1 sm:grid-cols-2";
      case "3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "4":
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  }, [hubColumnas]);

  // Configuración de Embla Carousel
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

  // Si no hay items, no renderizar nada
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Encabezado del bloque */}
      {(hubTitulo || hubSubtitulo) && (
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          {hubTitulo && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {hubTitulo}
            </h2>
          )}
          {hubSubtitulo && (
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              {hubSubtitulo}
            </p>
          )}
        </div>
      )}

      {/* Vista Carousel con peek / swipe */}
      {isCarousel ? (
        <div className="relative">
          {/* Controles de navegación */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center transition-all shadow-md border border-slate-200 -ml-4 hidden sm:flex cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center transition-all shadow-md border border-slate-200 -mr-4 hidden sm:flex cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Embla slider container */}
          <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6 py-2">
              {items.map((item, idx) => {
                const slug = item.slugCategoria?.trim().toLowerCase();
                const cat = slug ? categoriesMap.get(slug) : undefined;
                return (
                  <div
                    key={idx}
                    className="flex-none w-[260px] sm:w-[280px] md:w-[320px]"
                  >
                    <HubCard
                      item={item}
                      index={idx}
                      category={cat}
                      fallbackAspectRatio={activeBlockRatio}
                      onAspectDetected={handleAspectDetected}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Vista Grid */
        <div className={`grid ${columnsClass} gap-5 md:gap-6`}>
          {items.map((item, idx) => {
            const slug = item.slugCategoria?.trim().toLowerCase();
            const cat = slug ? categoriesMap.get(slug) : undefined;
            return (
              <HubCard
                key={idx}
                item={item}
                index={idx}
                category={cat}
                fallbackAspectRatio={activeBlockRatio}
                onAspectDetected={handleAspectDetected}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
