import Link from "next/link";

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
 * Mejora SEO y aparición en rich snippets de Google
 * // TODO: reemplazar shim por next/link nativo
 */
export function BreadcrumbsWithSchema({
  customPath,
  currentPageTitle,
  baseUrl,
  currentUri,
}: BreadcrumbsWithSchemaProps) {
  // SSR-safe: usar baseUrl prop o fallback constante
  const origin = baseUrl || "https://impacto33.com";
  const currentHref = currentUri ? origin + currentUri : origin;

  // Generar BreadcrumbList Schema para SEO
  const breadcrumbItems = [
    { name: "Inicio", url: origin + "/" },
    ...(customPath
      ?.filter((item) => item.label.toLowerCase() !== "inicio")
      .map((item) => ({
        name: item.label,
        url: item.url ? origin + item.url : undefined,
      })) || []),
    { name: currentPageTitle, url: currentHref },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className="bg-slate-50 py-4">
      {/* BreadcrumbList Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4">
        <nav className="flex items-center space-x-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600">
            Inicio
          </Link>
          {customPath
            ?.filter((item) => item.label.toLowerCase() !== "inicio")
            .map((item, index) => (
              <span key={index} className="flex items-center space-x-2">
                <span>/</span>
                {item.url ? (
                  <Link href={item.url} className="hover:text-blue-600">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          <span>/</span>
          <span className="text-slate-900 font-medium">{currentPageTitle}</span>
        </nav>
      </div>
    </div>
  );
}

