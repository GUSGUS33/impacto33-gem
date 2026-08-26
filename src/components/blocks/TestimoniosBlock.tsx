import { Star, CheckCircle2 } from "lucide-react";
import { PageBlock } from "@/queries/seoPageComplete";

interface TestimoniosBlockProps {
  data: PageBlock;
}

/**
 * Bloque de testimonios para páginas transaccionales
 * 
 * Muestra testimonios de clientes con nombre, empresa, rating (estrellas),
 * texto del testimonio y badge de verificación.
 * 
 * Prioridad: MEDIA (social proof + conversión)
 */
export function TestimoniosBlock({ data }: TestimoniosBlockProps) {
  const {
    testimoniosTitulo = "Lo que dicen nuestros clientes",
    testimoniosItems = [],
  } = data;

  // Si no hay título o items, no renderizar nada
  if (!testimoniosTitulo || !testimoniosItems || testimoniosItems.length === 0) {
    return null;
  }

  return (
    <div className="container py-12 md:py-16">
      {/* Título del bloque */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 md:mb-12 text-center">
        {testimoniosTitulo}
      </h2>

      {/* Grid de testimonios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {testimoniosItems.map((testimonio: any, index: number) => {
          const {
            nombre,
            empresa,
            testimonio: texto,
            rating = 5,
            foto,
            verificado = false,
          } = testimonio;

          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {/* Header: Foto + Nombre + Empresa */}
              <div className="flex items-start gap-4 mb-4">
                {/* Foto del cliente (si existe) */}
                {foto?.sourceUrl ? (
                  <img
                    src={foto.sourceUrl}
                    alt={foto.altText || nombre}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-lg">
                      {nombre?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}

                {/* Nombre y empresa */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {nombre || "Cliente"}
                    </h3>
                    {verificado && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" aria-label="Verificado" />
                    )}
                  </div>
                  {empresa && (
                    <p className="text-xs text-slate-500 truncate">{empresa}</p>
                  )}
                </div>
              </div>

              {/* Rating (estrellas) */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Texto del testimonio */}
              <p className="text-slate-700 text-sm leading-relaxed flex-grow">
                "{texto || "Excelente servicio y calidad de productos."}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
