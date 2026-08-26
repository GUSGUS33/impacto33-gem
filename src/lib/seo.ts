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
    "@type": "LocalBusiness",
    "name": "IMPACTO33",
    "legalName": "IMPACTO33 S.L.",
    "alternateName": "Impacto 33 Artículos Promocionales",
    "url": "https://impacto33.com",
    "logo": "https://impacto33.com/images/logo-impacto33.png",
    "image": "https://impacto33.com/images/logo-impacto33.png",
    "description": "Empresa especializada en personalización textil, artículos promocionales y regalos publicitarios para empresas. Serigrafía, bordado, DTF y sublimación.",
    "telephone": "+34690906027",
    "email": "info@impacto33.com",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer, PayPal, Bizum",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES",
      "addressLocality": "Valencia",
      "addressRegion": "Valencia",
      "postalCode": "46001",
      "streetAddress": "Valencia, España"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 39.4699,
      "longitude": -0.3763
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+34690906027",
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "ES",
        "availableLanguage": ["Spanish", "English"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/impacto33",
      "https://www.instagram.com/impacto33",
      "https://twitter.com/impacto33"
    ]
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124",
      "bestRating": "5",
      "worstRating": "1"
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
        "name": "IMPACTO33",
        "url": "https://impacto33.com"
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

export function getCanonicalUrl(route: string, params: Record<string, string> = {}) {
  // Función para normalizar y evitar duplicados de URL por parámetros UTM o de filtro
  const baseUrl = "https://impacto33.com";
  // Evitar trailing slashes si la ruta es base
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `${baseUrl}${cleanRoute}`;
}
