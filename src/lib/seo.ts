import { Metadata } from 'next';

const SITE_URL = "https://impacto33.com";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export interface ItemListEntry {
  name: string;
  url: string;
  image?: string;
}

export interface ServiceSchemaInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  serviceType?: string;
  areaServed?: string;
}

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function generateSeoMetadata({
  title,
  description,
  url = "https://impacto33.com",
  image = "https://impacto33.com/images/logo-impacto33.png",
  type = "website",
  noIndex = false,
}: SeoProps): Metadata {
  const cleanTitle = title.replace(/(?:\s*\|\s*IMPACTO33\s*)+$/i, '').trim() || title;
  const socialTitle = `${cleanTitle} | IMPACTO33`;
  const canonicalUrl = url ? getCanonicalUrl(url) : undefined;

  return {
    title: cleanTitle,
    description: description || "Artículos promocionales y regalos publicitarios personalizados para empresas.",
    metadataBase: new URL('https://impacto33.com'),
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      siteName: 'IMPACTO33',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORGANIZATION_ID,
    "name": "IMPACTO33",
    "legalName": "IMPACTO33 S.L.",
    "alternateName": "Impacto 33 Artículos Promocionales",
    "url": "https://impacto33.com",
    "logo": "https://impacto33.com/images/logo-impacto33.png",
    "image": "https://impacto33.com/images/logo-impacto33.png",
    "description": "Empresa especializada en personalización textil, artículos promocionales y regalos publicitarios para empresas. Serigrafía, bordado, DTF y sublimación.",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+34690906027",
        "email": "info@impacto33.com",
        "contactType": "customer service",
        "areaServed": "ES",
        "availableLanguage": ["Spanish", "English"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/impacto33",
      "https://www.instagram.com/impacto33",
      "https://twitter.com/impacto33",
      "https://www.linkedin.com/company/impacto33"
    ]
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "name": "IMPACTO33",
    "alternateName": ["Impacto33", "impacto33.com"],
    "url": `${SITE_URL}/`,
    "publisher": {
      "@id": ORGANIZATION_ID,
    },
  };
}

export function generateProductSchema(product: any, url: string) {
  if (!product) return null;

  const brandName = product.brand || product.brandName || "IMPACTO33";
  const mainImage = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : (product.image || "https://impacto33.com/images/logo-impacto33.png");
  
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 300).trim()
    : `${product.name} personalizado para empresas y eventos.`;

  const rawPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price || "0").replace(/[^0-9.]/g, ''));
  const priceValue = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice.toFixed(2) : "0.00";
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": Array.isArray(product.images) && product.images.length > 0 ? product.images : [mainImage],
    "description": cleanDescription,
    "sku": String(product.sku || product.id || ""),
    "mpn": String(product.sku || product.id || ""),
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "EUR",
      "price": priceValue,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        "name": "IMPACTO33",
        "url": SITE_URL
      }
    }
  };
}

export function generateItemListSchema(name: string, items: ItemListEntry[]) {
  const validItems = items.filter((item) => item.name && item.url);
  if (validItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "numberOfItems": validItems.length,
    "itemListElement": validItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": getCanonicalUrl(item.url),
      "name": item.name,
      ...(item.image ? { "image": item.image } : {}),
    })),
  };
}

export function generateServiceSchema(service: ServiceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${getCanonicalUrl(service.url)}#service`,
    "name": service.name,
    "description": service.description,
    "url": getCanonicalUrl(service.url),
    ...(service.image ? { "image": service.image } : {}),
    "serviceType": service.serviceType || service.name,
    "provider": {
      "@id": ORGANIZATION_ID,
    },
    "areaServed": {
      "@type": "Country",
      "name": service.areaServed || "España",
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": getCanonicalUrl(service.url),
      "servicePhone": {
        "@type": "ContactPoint",
        "telephone": "+34690906027",
        "contactType": "sales",
        "availableLanguage": ["Spanish", "English"],
      },
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string, item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": getCanonicalUrl(breadcrumb.item)
    }))
  };
}

export function generateFaqPageSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs
      .filter((f) => f.question && f.answer)
      .map((f) => ({
        "@type": "Question",
        "name": f.question.trim(),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer.replace(/<[^>]*>/g, '').trim(),
        },
      })),
  };
}

export function getCanonicalUrl(routeOrUrl: string): string {
  const baseUrl = SITE_URL;
  if (!routeOrUrl) return baseUrl;

  let path = routeOrUrl;
  try {
    if (/^https?:\/\//i.test(routeOrUrl)) {
      path = new URL(routeOrUrl).pathname;
    }
  } catch {
    // Si no es una URL válida, se normaliza como una ruta interna.
  }

  path = path.split(/[?#]/, 1)[0] || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");

  return path === "/" ? baseUrl : `${baseUrl}${path}`;
}
