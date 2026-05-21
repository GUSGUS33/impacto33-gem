import Script from "next/script";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";

interface SeoSchemasProps {
  product?: any;
  productUrl?: string;
  breadcrumbs?: { name: string, item: string }[];
}

export function SeoSchemas({ product, productUrl, breadcrumbs }: SeoSchemasProps) {
  const productSchema = product && productUrl ? generateProductSchema(product, productUrl) : null;
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;

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
    </>
  );
}
