"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePrefetch } from "@/hooks/usePrefetch";
export interface ColorOption {
  color: string;
  imageUrl: string | null;
}

export interface SubcategoryLink {
  name: string;
  url: string;
}

interface ProductFiltersProps {
  // Navegación de categorías
  parentCategoryName?: string;
  parentCategoryUrl?: string;
  subcategories?: SubcategoryLink[];
  currentCategoryUrl?: string;
  
  // Filtro de color
  availableColors?: ColorOption[]; // Opcional para evitar errores durante carga
  onColorChange: (colors: string[]) => void;
  selectedColors: string[];
  onClearFilters: () => void;
}

/**
 * Componente de filtros de productos (navegación de categorías + color)
 * 
 * Sidebar izquierda con:
 * 1. Navegación de categoría madre y subcategorías hijas
 * 2. Filtro de color con círculos (zoom al centro de imagen)
 */
export function ProductFilters({
  parentCategoryName,
  parentCategoryUrl,
  subcategories = [],
  currentCategoryUrl,
  availableColors = [], // Default a array vacío
  onColorChange,
  selectedColors,
  onClearFilters,
}: ProductFiltersProps) {
  const prefetchPage = usePrefetch();
  // Manejar selección de color
  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    
    onColorChange(newColors);
  };

  const hasActiveFilters = selectedColors.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 sticky top-4 space-y-8">
      {/* Navegación de Categorías */}
      {parentCategoryName && (
        <div>
          <h3 className="font-bold text-lg text-slate-900 mb-4">Categorías</h3>
          
          {/* Categoría Madre */}
          {parentCategoryUrl && (
            <Link 
              href={parentCategoryUrl} 
              onMouseEnter={() => prefetchPage(parentCategoryUrl)}
              className={`
                block px-3 py-2 rounded-sm text-sm font-medium transition-colors mb-2
                ${currentCategoryUrl === parentCategoryUrl
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              {parentCategoryName}
            </Link>
          )}

          {/* Subcategorías Hijas */}
          {subcategories.length > 0 && (
            <div className="ml-3 space-y-1 border-l-2 border-slate-200 pl-3">
              {subcategories.map((subcat) => (
                <Link 
                  key={subcat.url} 
                  href={subcat.url} 
                  onMouseEnter={() => prefetchPage(subcat.url)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors
                    ${currentCategoryUrl === subcat.url
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <span>{subcat.name}</span>
                  {currentCategoryUrl === subcat.url && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 
      ============================================
      FILTRO DE COLOR - TEMPORALMENTE DESHABILITADO
      ============================================
      
      MOTIVO: Las imágenes de variaciones son 1000x1000px, demasiado pesadas.
      
      PENDIENTE: 
      1. Crear plugin de thumbnails en WordPress headless
      2. Generar thumbnails optimizados (ej: 100x100px) para círculos de color
      3. Modificar query GraphQL para obtener thumbnail en lugar de imagen completa
      4. Descomentar esta sección para reactivar el filtro
      
      CÓMO REACTIVAR:
      - Cambiar "false &&" por "" en la línea de abajo
      - Asegurarse de que availableColors contenga URLs de thumbnails
      - Verificar que los thumbnails sean <100KB cada uno
      */}
      {false && availableColors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm text-slate-900">Color</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-slate-500 hover:text-slate-900 h-auto py-1"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {availableColors.map((colorOption) => {
              const isSelected = selectedColors.includes(colorOption.color);
              
              return (
                <button
                  key={colorOption.color}
                  onClick={() => handleColorToggle(colorOption.color)}
                  className={`
                    relative w-12 h-12 rounded-full border-2 transition-all overflow-hidden bg-slate-100
                    ${isSelected 
                      ? "border-blue-600 ring-2 ring-blue-200 scale-110" 
                      : "border-slate-300 hover:border-slate-400 hover:scale-110"
                    }
                  `}
                  title={colorOption.color}
                  aria-label={`Filtrar por color ${colorOption.color}`}
                >
                  {/* Imagen con zoom 200% centrada para mostrar solo el color (centro del producto) */}
                  {colorOption.imageUrl ? (
                    <img
                      src={colorOption.imageUrl}
                      alt={colorOption.color}
                      className="absolute w-[200%] h-[200%] object-cover"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        objectPosition: 'center center',
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                      {colorOption.color.substring(0, 2)}
                    </div>
                  )}

                  {/* Checkmark cuando está seleccionado */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white drop-shadow-lg"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Etiquetas de colores seleccionados */}
          {selectedColors.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedColors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {color}
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="hover:bg-blue-100 rounded-full p-0.5"
                    aria-label={`Quitar filtro ${color}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {/* FIN FILTRO DE COLOR DESHABILITADO */}
    </div>
  );
}
