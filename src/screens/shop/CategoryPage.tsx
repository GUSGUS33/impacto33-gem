"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";
import seoSitemap from "@/data/seo-sitemap.json";
import dynamicBlocks from "@/data/dynamic-blocks.json";
import { DynamicProductBlock } from "@/components/DynamicProductBlock";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, HelpCircle, Truck, ShieldCheck, Palette } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function CategoryPage() {
  const params = useParams();
  
  if (!params) return <NotFound />;

  // Construir la URL actual para buscar en el sitemap
  const currentUrl = params.subcategory 
    ? `/${params.category}/${params.subcategory}/` 
    : `/${params.category}/`;

  // Buscar datos de la página en el sitemap
  const pageData = seoSitemap.find(page => page.url === currentUrl);

  // Si no encontramos datos en el sitemap, mostramos 404 (o podríamos mostrar una genérica)
  if (!pageData) return <NotFound />;

  // Buscar configuración del bloque dinámico
  const dynamicBlockConfig = dynamicBlocks.find(block => block.url === currentUrl);

  // Datos simulados para secciones que vendrían de un CMS o JSON más completo en el futuro
  const heroIntro = `Encuentra la mejor selección de ${pageData.search_intent} para tu empresa. Personalización de alta calidad, precios competitivos y plazos de entrega garantizados.`;
  
  return (
    <>
      

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="container mx-auto px-4 text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700">Inicio</Link>
          <ChevronRight size={12} />
          {pageData.parent_slug ? (
            <>
              <Link href={`/${pageData.parent_slug}/`} className="hover:text-blue-700 capitalize">
                {pageData.parent_slug.replace(/-/g, " ")}
              </Link>
              <ChevronRight size={12} />
            </>
          ) : null}
          <span className="font-bold text-slate-900 capitalize">{pageData.search_intent}</span>
        </div>
      </div>

      {/* 1. Hero Título (H1) */}
      <section className="pt-12 pb-6">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight capitalize">
            {pageData.search_intent}
          </h1>
          
          {/* 2. Hero Intro */}
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {heroIntro}
          </p>
        </div>
      </section>

      {/* 3. Hub Subcategorías (Interlinking) */}
      {pageData.children && pageData.children.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {pageData.children.map((child: any) => (
                <Link key={child.url} href={child.url}>
                  <Button variant="outline" className="rounded-full border-slate-200 hover:border-blue-700 hover:text-blue-700">
                    {child.anchor}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Bloque Dinámico de Productos */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Catálogo Destacado</h2>
            <span className="text-sm text-slate-500 hidden sm:inline">Mostrando selección destacada</span>
          </div>
          
          {dynamicBlockConfig ? (
            <DynamicProductBlock 
              categorySlug={dynamicBlockConfig.catalog_category_slug} 
              limit={dynamicBlockConfig.limit} 
              columns={dynamicBlockConfig.columns} 
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-sm border border-dashed border-slate-300">
              <p className="text-slate-500">Configuración de catálogo no encontrada para esta sección.</p>
              <p className="text-xs text-slate-400 mt-2">Esperando dynamic-blocks.json...</p>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link href="/presupuesto-rapido">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                SOLICITAR PRESUPUESTO COMPLETO
              </Button>
            </Link>
            <p className="mt-3 text-sm text-slate-500">Respuesta en menos de 2 horas laborables</p>
          </div>
        </div>
      </section>

      {/* 5. Ventajas Empresa */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">¿Por qué elegir IMPACTO33?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Envíos Rápidos</h3>
              <p className="text-slate-600 text-sm">Plazos de entrega garantizados para que tu campaña llegue a tiempo.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                <Palette size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Personalización Premium</h3>
              <p className="text-slate-600 text-sm">Serigrafía, bordado, láser y sublimación de alta calidad.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Garantía Total</h3>
              <p className="text-slate-600 text-sm">Revisamos cada pedido manualmente para asegurar la perfección.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Casos de Uso (Placeholder estructurado) */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Ideas para tu marca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-8 rounded-sm border border-slate-700">
              <h3 className="font-bold text-xl mb-3 text-blue-300">Merchandising para Eventos</h3>
              <p className="text-slate-300 leading-relaxed">
                Destaca en ferias y congresos con {pageData.search_intent} personalizados. 
                Un regalo útil que mantendrá tu marca visible mucho después del evento.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-sm border border-slate-700">
              <h3 className="font-bold text-xl mb-3 text-blue-300">Regalos Corporativos</h3>
              <p className="text-slate-300 leading-relaxed">
                Fideliza a tus clientes y empleados con detalles de calidad. 
                {pageData.search_intent.charAt(0).toUpperCase() + pageData.search_intent.slice(1)} son perfectos para packs de bienvenida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-10">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-700" />
                ¿Cuál es el pedido mínimo?
              </h3>
              <p className="text-slate-600 pl-7">
                Para la mayoría de nuestros productos, el pedido mínimo es de 10 unidades. 
                Consúltanos para casos especiales.
              </p>
            </div>
            <div className="border-b border-slate-100 pb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-700" />
                ¿Puedo ver una muestra antes de comprar?
              </h3>
              <p className="text-slate-600 pl-7">
                Sí, realizamos bocetos digitales gratuitos y podemos enviar muestras físicas (con coste) para asegurar tu satisfacción.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA Final */}
      <section className="py-20 bg-blue-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-6">¿Necesitas un presupuesto a medida?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cuéntanos qué necesitas y te enviaremos nuestra mejor oferta en tiempo récord.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/presupuesto-rapido">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg w-full sm:w-auto">
                PEDIR PRESUPUESTO AHORA
              </Button>
            </Link>
            <a href={`https://wa.me/${siteConfig.whatsappNumber.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-600 hover:border-blue-600 font-bold px-8 py-6 text-lg w-full sm:w-auto">
                WHATSAPP EMPRESA
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
