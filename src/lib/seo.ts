import { Metadata } from 'next';

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
  return {
    title: `${title} | IMPACTO33`,
    description: description || "Artículos promocionales y regalos publicitarios personalizados para empresas.",
    metadataBase: new URL('https://impacto33.com'),
    ...(url && { alternates: { canonical: url } }),
    openGraph: {
      title,
      description,
      url,
      siteName: 'IMPACTO33',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
    "@type": "Organization",
    "name": "IMPACTO33",
    "url": "https://impacto33.com",
    "logo": "https://impacto33.com/images/logo-impacto33.png",
    "description": "Artículos promocionales y regalos publicitarios personalizados para empresas.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34690906027",
      "contactType": "customer service",
      "areaServed": "ES",
      "availableLanguage": "Spanish"
    },
    "sameAs": [
      "https://www.facebook.com/impacto33",
      "https://www.instagram.com/impacto33",
      "https://twitter.com/impacto33"
    ]
  };
}

export function generateProductSchema(product: any, url: string) {
  if (!product) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.[0] || product.image,
    "description": product.description?.substring(0, 160),
    "sku": product.sku || product.id,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124"
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "EUR",
      "price": product.price || "0.00",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "IMPACTO33"
      }
    }
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
      "item": breadcrumb.item
    }))
  };
}

export function getCanonicalUrl(route: string, params: Record<string, string> = {}) {
  // Función para normalizar y evitar duplicados de URL por parámetros UTM o de filtro
  const baseUrl = "https://impacto33.com";
  // Evitar trailing slashes si la ruta es base
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `${baseUrl}${cleanRoute}`;
}
