import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { GET_MAIN_MENU } from "../queries/mainMenu";
import type { MegaMenuSection, MenuItem } from "../components/MegaMenu";
import { normalizeUri } from "@/lib/url";

/**
 * Tipos de la respuesta de WPGraphQL para el menú
 */
interface WPMenuItem {
  id: string;
  label: string;
  uri: string;
  connectedNode?: {
    node?: {
      __typename?: string;
      featuredImage?: {
        node?: {
          sourceUrl?: string;
          altText?: string;
        }
      } | null;
    }
  };
  childItems?: {
    nodes: WPMenuItem[];
  };
}

interface WPMenuResponse {
  menu: {
    menuItems: {
      nodes: WPMenuItem[];
    };
  } | null;
}

/**
 * Limpia un label largo de WordPress SEO para mostrar en el menú.
 * 
 * Estrategia:
 * - Toma solo el texto antes del primer "|"
 * - Elimina espacios extra
 * 
 * Ejemplo:
 *   "Sudaderas con Capucha Personalizadas | Hoodies con Logo desde 7,95€"
 *   → "Sudaderas con Capucha Personalizadas"
 */
function cleanLabel(rawLabel: string | null | undefined): string {
  if (!rawLabel) return "";
  const beforePipe = String(rawLabel).split("|")[0].trim();
  return beforePipe;
}

/**
 * Genera un slug a partir del label de la sección para usar como key.
 * 
 * Ejemplo: "Ropa Personalizada" → "ropa-personalizada"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const SECTION_FALLBACK_HREFS: Record<string, string> = {
  "ropa-personalizada": "/ropa-personalizada",
  "bolsas-y-mochilas": "/bolsas-personalizadas",
  "tazas-y-botellas": "/tazas-personalizadas",
  merchandising: "/regalos-de-empresa",
  servicios: "/servicios",
};

export function resolveSectionHref(
  sectionKey: string,
  href: string | null | undefined
): string {
  const normalizedHref = normalizeUri(href);
  if (normalizedHref !== "#" && normalizedHref !== "/") {
    return normalizedHref;
  }

  return SECTION_FALLBACK_HREFS[sectionKey] ?? `/${sectionKey}`;
}

/**
 * Mapea la respuesta de WPGraphQL a la estructura MegaMenuSection
 * que usa el componente MegaMenu.
 * 
 * Estructura WP:
 *   Nivel 1 (parentId: 0) → Secciones del menú (Ropa, Bolsas, etc.)
 *   Nivel 2 (childItems)   → Columnas del dropdown (Camisetas, Sudaderas, etc.)
 *   Nivel 3 (childItems)   → Items de cada columna (Manga corta, Manga larga, etc.)
 */
function mapWPMenuToSections(
  wpItems: WPMenuItem[]
): Record<string, MegaMenuSection> {
  const sections: Record<string, MegaMenuSection> = {};

  for (const topItem of wpItems) {
    const sectionTitle = cleanLabel(topItem.label);
    const sectionKey = slugify(sectionTitle);

    const columns: MenuItem[] = [];
    const children = topItem.childItems?.nodes || [];

    for (const child of children) {
      const columnTitle = cleanLabel(child.label).toUpperCase();
      const columnHref = normalizeUri(child.uri);

      const subItems: { label: string; href: string; image?: { src: string; altText: string } | null }[] = [];
      const grandchildren = child.childItems?.nodes || [];

      for (const grandchild of grandchildren) {
        let imageData = null;
        const featuredImage = grandchild.connectedNode?.node?.featuredImage?.node;
        if (featuredImage && featuredImage.sourceUrl) {
          imageData = {
            src: featuredImage.sourceUrl,
            altText: featuredImage.altText || cleanLabel(grandchild.label),
          };
        }

        subItems.push({
          label: cleanLabel(grandchild.label),
          href: normalizeUri(grandchild.uri),
          image: imageData,
        });
      }

      columns.push({
        title: columnTitle,
        href: columnHref,
        items: subItems.length > 0 ? subItems : undefined,
      });
    }

    sections[sectionKey] = {
      title: sectionTitle,
      href: resolveSectionHref(sectionKey, topItem.uri),
      columns,
    };
  }

  return sections;
}

import defaultMenuData from "@/data/defaultMenuData.json";

export const FALLBACK_MENU_SECTIONS: Record<string, MegaMenuSection> = defaultMenuData as Record<string, MegaMenuSection>;

const CACHE_KEY = "impacto33_wp_main_menu_v2";

/**
 * Hook para obtener el menú principal de WordPress via WPGraphQL.
 * 
 * Devuelve los datos mapeados a la estructura MegaMenuSection inmediatamente
 * usando los datos precalculados de miniaturas y actualiza en segundo plano.
 */
export function useMainMenu() {
  const { data, loading, error } = useQuery<WPMenuResponse>(GET_MAIN_MENU, {
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
  });

  const menuSections = useMemo(() => {
    if (data?.menu?.menuItems?.nodes && data.menu.menuItems.nodes.length > 0) {
      const parsed = mapWPMenuToSections(data.menu.menuItems.nodes);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        } catch {
          // Ignore localStorage errors
        }
      }
      return parsed;
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached) as Record<string, MegaMenuSection>;
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    return FALLBACK_MENU_SECTIONS;
  }, [data]);

  return {
    menuSections: menuSections || FALLBACK_MENU_SECTIONS,
    loading,
    error,
  };
}

// Exportar utilidades para testing
export { cleanLabel, slugify, normalizeUri, mapWPMenuToSections };
export type { WPMenuItem };
