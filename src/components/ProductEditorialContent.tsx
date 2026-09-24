import Link from "next/link";
import { ChevronRight, Clock3, Palette, Ruler } from "lucide-react";
import type { Product } from "@shared/types";
import type { PrintingMethodId } from "@/types/printing";
import {
  buildProductFaqs,
  getProductAttributeGroups,
} from "@/lib/productContent";

const METHOD_CONTENT: Partial<Record<PrintingMethodId, { title: string; description: string }>> = {
  DTF: {
    title: "Impresión DTF a todo color",
    description: "Adecuada para diseños con varios colores, degradados y detalles finos. La calculadora muestra las zonas compatibles con este producto.",
  },
  SERIGRAFIA_1_COLOR: {
    title: "Serigrafía a un color",
    description: "Una opción eficiente para diseños sencillos y tiradas amplias cuando el producto y la zona seleccionada lo permiten.",
  },
  BORDADO: {
    title: "Bordado textil",
    description: "Acabado resistente y de aspecto profesional, disponible únicamente en productos y zonas compatibles.",
  },
  SIN_IMPRESION: {
    title: "Sin personalización",
    description: "También puedes solicitar el producto sin impresión cuando esta opción aparezca disponible en la calculadora.",
  },
};

interface ProductEditorialContentProps {
  product: Product;
  minimumQuantity: number;
  availablePrintingMethods: PrintingMethodId[];
}

export default function ProductEditorialContent({
  product,
  minimumQuantity,
  availablePrintingMethods,
}: ProductEditorialContentProps) {
  const attributeGroups = getProductAttributeGroups(product.attributes?.nodes);
  const faqs = buildProductFaqs(product.name, minimumQuantity);
  const relatedProducts = product.related?.nodes || [];

  return (
    <div className="mt-12 space-y-14 border-t border-slate-200 pt-10 md:mt-16 md:space-y-16 md:pt-12">
      {product.description && (
        <section data-product-description aria-labelledby="product-features-title">
          <h2 id="product-features-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
            Características principales de {product.name}
          </h2>
          <div
            className="prose prose-slate mt-5 max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {availablePrintingMethods.length > 0 && (
        <section aria-labelledby="product-personalization-title">
          <div className="mb-5 flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-700" aria-hidden="true">
              <Palette size={20} />
            </span>
            <div>
              <h2 id="product-personalization-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
                Opciones de personalización de {product.name}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                La técnica y las zonas disponibles se adaptan al producto. Configura las opciones superiores para obtener una estimación basada en tu selección.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {availablePrintingMethods.map((methodId) => {
              const content = METHOD_CONTENT[methodId];
              if (!content) return null;

              return (
                <article key={methodId} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-bold text-slate-900">{content.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{content.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {attributeGroups.length > 0 && (
        <section aria-labelledby="product-options-title">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-700" aria-hidden="true">
              <Ruler size={20} />
            </span>
            <h2 id="product-options-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
              Tallas, colores y materiales
            </h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attributeGroups.map((attribute) => (
              <div key={attribute.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <dt className="text-sm font-bold text-slate-900">{attribute.label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                  {attribute.values.join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="product-quote-title" className="rounded-2xl bg-slate-900 px-5 py-7 text-white md:px-8 md:py-9">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-blue-200">
              <Clock3 size={20} aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wider">Presupuesto orientativo inmediato</span>
            </div>
            <h2 id="product-quote-title" className="text-2xl font-bold md:text-3xl">
              Plazos, cantidades y presupuesto
            </h2>
            <p className="mt-3 leading-relaxed text-slate-200">
              El pedido mínimo orientativo es de <strong className="text-white">{minimumQuantity} unidades</strong>. Los precios por volumen y las fechas estimadas cambian según la configuración elegida.
            </p>
          </div>
          <a
            href="#configurar-producto"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-center font-bold text-white transition-colors hover:bg-blue-400"
          >
            Configurar producto
          </a>
        </div>
      </section>

      <section aria-labelledby="product-faq-title">
        <h2 id="product-faq-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
          Preguntas frecuentes sobre {product.name}
        </h2>
        <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                <h3 className="text-base font-semibold md:text-lg">{faq.question}</h3>
                <span className="text-xl text-blue-700 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 md:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-products-title">
          <h2 id="related-products-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
            Productos similares y alternativas
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/producto/${relatedProduct.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="aspect-square bg-slate-50 p-3 sm:p-5">
                  <img
                    src={relatedProduct.featuredImage?.node?.sourceUrl || "/placeholder-image.jpg"}
                    alt={relatedProduct.featuredImage?.node?.altText || relatedProduct.name}
                    loading="lazy"
                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-blue-700 sm:text-base">
                    {relatedProduct.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 sm:text-sm">
                    Ver producto <ChevronRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
