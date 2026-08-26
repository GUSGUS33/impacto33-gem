"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useMainMenu } from "@/hooks/useMainMenu";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ChevronDown } from "lucide-react";

export interface MenuItem {
  title: string;
  href: string;
  items?: { label: string; href: string; image?: { src: string; altText: string } | null }[];
}

export interface MegaMenuSection {
  title: string;
  href?: string;
  columns: MenuItem[];
  image?: { src: string; alt: string };
}

/**
 * Determina el número de columnas del grid según la sección.
 * Se basa en el número real de columnas que devuelve WordPress.
 */
function getGridCols(columnCount: number): string {
  if (columnCount <= 2) return "grid-cols-2";
  if (columnCount === 3) return "grid-cols-3";
  if (columnCount === 4) return "grid-cols-4";
  if (columnCount === 5) return "grid-cols-5";
  if (columnCount === 6) return "grid-cols-6";
  if (columnCount >= 7) return "grid-cols-7";
  return "grid-cols-4";
}

/**
 * Detecta si una sección es "Servicios" por su key o URI.
 * Servicios tiene un renderizado especial con imágenes.
 */
function isServiciosSection(key: string): boolean {
  return key === "servicios" || key === "servicios-de-personalizacion-para-empresas";
}

/**
 * Genera el slug para la imagen de un servicio a partir de su URI.
 */
function getServiceImageSlug(uri: string): string {
  const parts = uri.replace(/^\/|\/$/g, "").split("/");
  const lastPart = parts[parts.length - 1] || "";
  
  const imageMap: Record<string, string> = {
    "impresion-dtf": "transfer-dtf",
    "dtf": "transfer-dtf",
    "serigrafia": "serigrafia",
    "bordado": "bordado",
    "sublimacion": "sublimacion",
    "impresion-digital": "impresion-digital",
  };
  
  return imageMap[lastPart] || lastPart;
}

/**
 * Descripciones cortas para los servicios.
 */
const serviceDescriptions: Record<string, string> = {
  "impresion-dtf": "Estampación textil digital de alta calidad para cualquier tejido.",
  "serigrafia": "La serigrafía es una técnica de impresión ideal para grandes tiradas.",
  "bordado": "Acabado premium y duradero para ropa corporativa y uniformes.",
  "sublimacion": "Ideal para ropa deportiva y técnica con diseños a todo color.",
  "impresion-digital": "Impresión a todo color sin límites de colores ni degradados.",
};

export function MegaMenu() {
  const { menuSections, error } = useMainMenu();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveKey(key);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveKey(null);
    }, 150);
  };

  const closeMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveKey(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (error && !menuSections) {
    console.warn("MegaMenu Error, falling back to static links:", error.message);
    return (
      <nav className="hidden xl:flex items-center gap-2.5 2xl:gap-7 font-bold text-xs 2xl:text-[13px] uppercase tracking-wider text-slate-800 h-full whitespace-nowrap shrink-0">
        <Link href="/ropa-personalizada/" className="py-4 hover:text-blue-500 transition-colors whitespace-nowrap">
          Ropa Personalizada
        </Link>
        <Link href="/bolsas-personalizadas/" className="py-4 hover:text-blue-500 transition-colors whitespace-nowrap">
          Bolsas y Mochilas
        </Link>
        <Link href="/tazas-personalizadas/" className="py-4 hover:text-blue-500 transition-colors whitespace-nowrap">
          Tazas y Botellas
        </Link>
        <Link href="/merchandising-eventos/" className="py-4 hover:text-blue-500 transition-colors whitespace-nowrap">
          Merchandising
        </Link>
        <Link href="/servicios/" className="py-4 hover:text-blue-500 transition-colors whitespace-nowrap">
          Servicios
        </Link>
      </nav>
    );
  }

  const sectionsToRender = menuSections || {};
  const currentSection = activeKey ? sectionsToRender[activeKey] : null;

  return (
    <div
      className="h-full flex items-center"
      onMouseLeave={handleMouseLeave}
    >
      {/* Barra de Categorías Principales */}
      <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-5 font-bold text-xs 2xl:text-[13px] uppercase tracking-wider text-slate-800 h-full whitespace-nowrap shrink-0">
        {Object.entries(sectionsToRender).map(([key, section]) => {
          const isActive = activeKey === key;
          return (
            <div
              key={key}
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter(key)}
            >
              <Link
                href={section.href || "#"}
                onClick={closeMenu}
                className={`flex items-center gap-1.5 px-2.5 py-3 rounded-md transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? "text-blue-600 bg-blue-50/70"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    isActive ? "rotate-180 text-blue-600" : "text-slate-400"
                  }`}
                />
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Panel Desplegable Único (Anclado exactamente bajo el header completo) */}
      {currentSection && currentSection.columns && currentSection.columns.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl border-t border-slate-100 z-50 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
          onMouseEnter={() => handleMouseEnter(activeKey!)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Barra de acento decorativa superior */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 w-full" />

          <div className="container mx-auto px-6 py-8 flex gap-8">
            {/* Columnas de Subcategorías */}
            <div className={`flex-1 grid ${getGridCols(currentSection.columns.length)} gap-8`}>
              {currentSection.columns.map((col, idx) => (
                <div key={idx} className="min-w-0">
                  {!isServiciosSection(activeKey!) && (
                    <>
                      <Link
                        href={col.href}
                        onClick={closeMenu}
                        className="block font-bold text-slate-900 mb-4 hover:text-blue-600 text-xs tracking-wide transition-colors border-b border-slate-100 pb-2"
                      >
                        {col.title}
                      </Link>
                      {col.items && (
                        <ul className="space-y-2">
                          {col.items.map((item, i) => (
                            <li key={i}>
                              <Link
                                href={item.href}
                                onClick={closeMenu}
                                className="group/item flex items-center gap-3 text-slate-600 hover:text-blue-600 text-[11px] capitalize font-medium py-1 px-1.5 rounded hover:bg-slate-50 transition-all"
                              >
                                {item.image ? (
                                  <div className="relative w-7 h-7 xl:w-8 xl:h-8 flex-shrink-0 overflow-hidden rounded-full shadow-xs bg-slate-100 group-hover/item:ring-2 group-hover/item:ring-blue-500 transition-all">
                                    <OptimizedImage
                                      src={item.image.src}
                                      alt={item.image.altText || item.label}
                                      fill
                                      containerClassName="w-full h-full"
                                      className="object-cover"
                                      sizes="32px"
                                      loading="eager"
                                      unoptimized={true}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 min-w-7 min-h-7 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 text-slate-400 font-bold text-[10px] group-hover/item:bg-blue-50 group-hover/item:text-blue-600 transition-all">
                                    {item.label.substring(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <span className="leading-tight truncate">{item.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}

                  {/* Renderizado especial para Servicios */}
                  {isServiciosSection(activeKey!) && (
                    <div className="mt-0">
                      <Link
                        href={col.href}
                        onClick={closeMenu}
                        className="block mb-3 overflow-hidden rounded-lg group/srv shadow-xs border border-slate-100"
                      >
                        <OptimizedImage
                          src={`/images/services/${getServiceImageSlug(col.href)}.jpg`}
                          alt={col.title}
                          width={300}
                          height={200}
                          className="w-full h-32 object-cover group-hover/srv:scale-105 transition-transform duration-500"
                          loading="eager"
                        />
                      </Link>
                      <Link
                        href={col.href}
                        onClick={closeMenu}
                        className="block font-bold text-slate-900 mb-1.5 hover:text-blue-600 text-sm transition-colors"
                      >
                        {col.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 normal-case font-normal leading-relaxed">
                        {serviceDescriptions[col.href.replace(/^\/servicios\//, "").replace(/\/$/, "")] || ""}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Imagen Destacada Opcional (Lado Derecho) */}
            {currentSection.image && (
              <div className="w-64 flex-shrink-0 border-l border-slate-100 pl-8">
                <OptimizedImage
                  src={currentSection.image.src}
                  alt={currentSection.image.alt}
                  width={256}
                  height={256}
                  className="w-full h-auto rounded-lg shadow-sm"
                  loading="eager"
                />
                <p className="mt-2 text-center text-blue-600 font-semibold text-xs">
                  {currentSection.image.alt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
