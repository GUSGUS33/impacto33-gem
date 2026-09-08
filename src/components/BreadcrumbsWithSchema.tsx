import Link from "next/link";
import { sanitizeBreadcrumbUrl, transactionalTitles } from "@/lib/slugMap";

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbsWithSchemaProps {
  customPath?: BreadcrumbItem[];
  currentPageTitle: string;
  /** @deprecated Conservado para compatibilidad; el schema se genera en SeoSchemas. */
  baseUrl?: string;
  /** URI actual usada para construir las migas visuales. */
  currentUri?: string;
}

/**
 * Breadcrumbs visuales. El BreadcrumbList canónico se emite desde SeoSchemas
 * en el componente de servidor para evitar duplicados.
 */
export function BreadcrumbsWithSchema({
  customPath,
  currentPageTitle,
  currentUri,
}: BreadcrumbsWithSchemaProps) {
  const cleanCurrentUri = sanitizeBreadcrumbUrl(currentUri || "");

  // Si no hay customPath pero la URL tiene jerarquía (/madre/hija/)
  let resolvedPath: BreadcrumbItem[] = [];
  if (customPath && customPath.length > 0) {
    resolvedPath = customPath
      .filter((item) => item.label.toLowerCase() !== "inicio")
      .map((item) => {
        const cleanUrl = item.url ? sanitizeBreadcrumbUrl(item.url) : undefined;
        return {
          label: item.label,
          url: cleanUrl,
        };
      });
  } else if (cleanCurrentUri && cleanCurrentUri !== "/") {
    const segments = cleanCurrentUri.split("/").filter(Boolean);
    if (segments.length > 1) {
      // Es una subpágina transaccional (ej: /camisetas-personalizadas/camisetas-manga-larga)
      const parentSlug = segments[0];
      const parentUrl = `/${parentSlug}`;
      const parentTitle = transactionalTitles[parentUrl] || transactionalTitles[`${parentUrl}/`] || parentSlug.replace(/-/g, " ");
      resolvedPath = [
        {
          label: parentTitle,
          url: parentUrl,
        },
      ];
    }
  }

  return (
    <div className="bg-slate-50 py-4 border-b border-slate-200">
      <div className="container mx-auto px-4">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-slate-600 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          {resolvedPath.map((item, index) => (
            <span key={index} className="flex items-center space-x-2">
              <span className="text-slate-300">/</span>
              {item.url ? (
                <Link href={item.url} className="hover:text-blue-600 transition-colors capitalize">
                  {item.label}
                </Link>
              ) : (
                <span className="capitalize">{item.label}</span>
              )}
            </span>
          ))}
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium capitalize">{currentPageTitle}</span>
        </nav>
      </div>
    </div>
  );
}
