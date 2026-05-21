import React from "react";
import Image from "next/image";

export function TextoConImagenBlock({ data }: { data: any }) {
  if (!data?.texto && !data?.imagen) return null;

  const image = data.imagen?.node;
  const imageLeft = data.posicionImagen === "izquierda";

  return (
    <section className="w-full py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center lg:items-start`}>
          
          {image && (
            <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white">
              <Image
                src={image.sourceUrl}
                alt={image.altText || data.titulo || "Imagen de sección"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          <div className={`w-full ${image ? "lg:w-1/2" : "max-w-4xl mx-auto"} flex flex-col justify-center`}>
            {data.titulo && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                {data.titulo}
              </h2>
            )}
            {data.texto && (
              <div 
                className="prose prose-slate prose-lg max-w-none text-slate-600"
                dangerouslySetInnerHTML={{ __html: data.texto }}
              />
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
