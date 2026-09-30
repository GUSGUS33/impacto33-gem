import Script from "next/script";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFaqPageSchema,
  generateItemListSchema,
  type ItemListEntry,
} from "@/lib/seo";

interface SeoSchemasProps {
  product?: any;
  productUrl?: string;
  breadcrumbs?: { name: string, item: string }[];
  faqs?: { question: string; answer: string }[];
  itemList?: { name: string; items: ItemListEntry[] };
  customSchema?: Record<string, any>;
}

export function SeoSchemas({ product, productUrl, breadcrumbs, faqs, itemList, customSchema }: SeoSchemasProps) {
  const productSchema = product && productUrl ? generateProductSchema(product, productUrl) : null;
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? generateBreadcrumbSchema(breadcrumbs) : null;
  const faqSchema = faqs && faqs.length > 0 ? generateFaqPageSchema(faqs) : null;
  const itemListSchema = itemList ? generateItemListSchema(itemList.name, itemList.items) : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema) }}
        />
      )}
    </>
  );
}
