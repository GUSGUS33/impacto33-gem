import type { Metadata } from 'next';
import ServicePageClient from '@/screens/ServicePage';
import { SeoSchemas } from '@/components/seo/SeoSchemas';
import { generateSeoMetadata, getCanonicalUrl } from '@/lib/seo';

// ─── Renderizado con ISR (1 hora) ───────────────────────────────────────────
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { slug: 'serigrafia' },
    { slug: 'bordado' },
    { slug: 'sublimacion' },
    { slug: 'impresion-digital' },
    { slug: 'vinilo' },
  ];
}

// Extract the services data map to get metadata dynamically.
// We import it here or define a simple map for SEO purposes.
const seoData: Record<string, { title: string; metaTitle: string; metaDescription: string; image: string }> = {
  "serigrafia": {
    title: "Serigrafía Textil",
    metaTitle: "Serigrafía Textil para Grandes Cantidades | IMPACTO33",
    metaDescription: "Serigrafía textil profesional en España para pedidos desde 500 unidades. Ideal para empresas que buscan personalización de calidad a gran escala. Pide presupuesto.",
    image: "https://impacto33.com/images/servicio-estampar-ropa-serigrafia-textil.jpg",
  },
  "bordado": {
    title: "Bordado Textil",
    metaTitle: "Bordado Textil Profesional | Calidad Premium IMPACTO33",
    metaDescription: "Bordado textil profesional en España. Acabado premium y elegante para uniformes corporativos, gorras y prendas de alta gama. Máxima durabilidad. Pide presupuesto.",
    image: "https://impacto33.com/images/servicio-bordados.jpg",
  },
  "sublimacion": {
    title: "Servicio de Sublimación",
    metaTitle: "Sublimación Textil y Tazas | IMPACTO33",
    metaDescription: "Sublimación a todo color sobre prendas poliéster y artículos publicitarios. Sin sentir al tacto, colores vibrantes y máxima resistencia.",
    image: "https://impacto33.com/images/servicio-estampar-ropa-serigrafia-textil.jpg",
  },
  "impresion-digital": {
    title: "Impresión Digital Textil (DTF)",
    metaTitle: "Impresión Digital Textil y DTF | IMPACTO33",
    metaDescription: "Impresión digital textil directa y DTF para diseños a todo color, degradados y fotografías sobre cualquier tipo de tejido.",
    image: "https://impacto33.com/images/servicio-estampar-ropa-serigrafia-textil.jpg",
  },
  "vinilo": {
    title: "Servicio de Vinilo Textil",
    metaTitle: "Vinilo Textil de Corte e Impreso | IMPACTO33",
    metaDescription: "Marcado con vinilo textil de alta resistencia para números, nombres, equipaciones deportivas y diseños de tiradas cortas.",
    image: "https://impacto33.com/images/servicio-estampar-ropa-serigrafia-textil.jpg",
  }
};

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = seoData[slug];
  const canonicalUrl = getCanonicalUrl(`/servicios/${slug}`);

  if (!data) {
    return generateSeoMetadata({
      title: "Servicio no encontrado",
      description: "El servicio que buscas no existe.",
      url: canonicalUrl,
      noIndex: true
    });
  }

  return generateSeoMetadata({
    title: data.metaTitle.replace(" | IMPACTO33", ""),
    description: data.metaDescription,
    url: canonicalUrl,
    image: data.image,
    type: "website"
  });
}

export default async function Page({ params }: ServicePageProps) {
  const { slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/servicios/${slug}`);
  const data = seoData[slug];

  const breadcrumbs = [
    { name: "Inicio", item: "https://impacto33.com" },
    { name: "Servicios", item: "https://impacto33.com/#servicios" },
    { name: data?.title || slug.replace(/-/g, ' '), item: canonicalUrl }
  ];

  return (
    <>
      <SeoSchemas breadcrumbs={breadcrumbs} />
      <ServicePageClient serverSlug={slug} />
    </>
  );
}