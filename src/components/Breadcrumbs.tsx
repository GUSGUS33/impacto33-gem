import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generar JSON-LD para BreadcrumbList
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://impacto33.com/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        ...(item.href ? { "item": `https://impacto33.com${item.href}` } : {})
      }))
    ]
  };

  return (
    <>
      

      <nav aria-label="Breadcrumb" className="py-2 text-sm text-slate-300">
        <ol className="flex items-center flex-wrap gap-2">
          <li className="flex items-center hover:text-white transition-colors">
            <Link href="/" className="flex items-center" aria-label="Ir al inicio">
              <Home size={16} />
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-slate-400" />
              {item.href ? (
                <Link href={item.href} className="hover:text-white transition-colors font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white font-semibold" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
