import Link from "next/link";
import { sanitizeBreadcrumbUrl, transactionalTitles } from "@/lib/slugMap";

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbsWithSchemaProps {
  customPath?: BreadcrumbItem[];
  currentPageTitle: string;
  /** Base URL for schema generation (SSR-safe). Defaults to https://impacto33.com */
  baseUrl?: string;
  /** Current page URI for schema (SSR-safe). E.g. /camisetas-personalizadas/ */
  currentUri?: string;
}

/**
 * Componente de Breadcrumbs con BreadcrumbList Schema (JSON-LD)
 * Garantiza que todos los enlaces apunten SIEMPRE a URLs transaccionales limpias
 * y NUNCA a taxonomías nativas de WooCommerce (/categoria-producto/, etc.)
 */
export function BreadcrumbsWithSchema({
  customPath,
  currentPageTitle,
  baseUrl,
  currentUri,
}: BreadcrumbsWithSchemaProps) {
  const origin = baseUrl || "https://impacto33.com";
  const cleanCurrentUri = sanitizeBreadcrumbUrl(currentUri || "");
  const currentHref = cleanCurrentUri !== "/" ? origin + cleanCurrentUri : origin;

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
      // Es una subpágina transaccional (ej: /camisetas-personalizadas/camisetas-manga-larga/)
      const parentSlug = segments[0];
      const parentUrl = `/${parentSlug}/`;
      const parentTitle = transactionalTitles[parentUrl] || parentSlug.replace(/-/g, " ");
      resolvedPath = [
        {
          label: parentTitle,
          url: parentUrl,
        },
      ];
    }
  }

  // Generar BreadcrumbList Schema para SEO
  const breadcrumbItems = [
    { name: "Inicio", url: origin + "/" },
    ...resolvedPath.map((item) => ({
      name: item.label,
      url: item.url ? origin + item.url : undefined,
    })),
    { name: currentPageTitle, url: currentHref },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };

  return (
    <div className="bg-slate-50 py-4 border-b border-slate-200">
      {/* BreadcrumbList Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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

