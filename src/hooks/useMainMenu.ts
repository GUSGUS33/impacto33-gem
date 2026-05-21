import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { GET_MAIN_MENU } from "../queries/mainMenu";
import type { MegaMenuSection, MenuItem } from "../components/MegaMenu";

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

/**
 * Normaliza una URI de WordPress:
 * - Asegura que empiece con /
 * - Elimina trailing slash para consistencia (excepto /)
 */
function normalizeUri(uri: string | null | undefined): string {
  if (!uri) return "/";
  // Si es un anchor (#), devolver tal cual
  if (uri === "#" || uri.startsWith("#")) return uri;
  
  // Eliminar dominio si viene completo
  let path = uri;
  try {
    const url = new URL(uri);
    path = url.pathname;
  } catch {
    // Ya es un path relativo
  }
  
  // Asegurar que empiece con /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  // Eliminar trailing slash (excepto para /)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  
  return path;
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
      columns,
    };
  }

  return sections;
}

/**
 * Hook para obtener el menú principal de WordPress via WPGraphQL.
 * 
 * Devuelve los datos mapeados a la estructura MegaMenuSection,
 * con estado de carga y error.
 * 
 * Mientras carga, devuelve null para que el componente muestre
 * un skeleton o los títulos sin dropdown.
 */
export function useMainMenu() {
  const { data, loading, error } = useQuery<WPMenuResponse>(GET_MAIN_MENU, {
    // Cache agresivo: el menú no cambia frecuentemente
    fetchPolicy: "cache-first",
    // No refetch en focus de ventana
    notifyOnNetworkStatusChange: false,
  });

  const menuSections = useMemo(() => {
    if (!data?.menu?.menuItems?.nodes) return null;
    return mapWPMenuToSections(data.menu.menuItems.nodes);
  }, [data]);

  return {
    menuSections,
    loading,
    error,
  };
}

// Exportar utilidades para testing
export { cleanLabel, slugify, normalizeUri, mapWPMenuToSections };
export type { WPMenuItem };
