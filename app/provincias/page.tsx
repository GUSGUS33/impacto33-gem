import type { Metadata } from "next";
import ProvinciasHubPage from "@/screens/ProvinciasHubPage";
import { SeoSchemas } from "@/components/seo/SeoSchemas";
import { generateSeoMetadata, getCanonicalUrl } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = generateSeoMetadata({
  title: "Imprenta y Ropa Personalizada por Provincias en España | IMPACTO33",
  description: "Encuentra servicios de impresión textil, serigrafía, ropa personalizada y merchandising promocional con envío rápido a todas las provincias de la Península Ibérica.",
  url: getCanonicalUrl("/provincias"),
  type: "website",
});

export default function ProvinciasPage() {
  const canonicalUrl = getCanonicalUrl("/provincias");
  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com" },
    { name: "Provincias", item: canonicalUrl },
  ];

  return (
    <>
      <SeoSchemas breadcrumbs={breadcrumbs} />
      <ProvinciasHubPage />
    </>
  );
}
