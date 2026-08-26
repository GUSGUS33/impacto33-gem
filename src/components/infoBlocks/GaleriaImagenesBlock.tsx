import React from "react";
import Image from "next/image";

export function GaleriaImagenesBlock({ data }: { data: any }) {
  if (!data?.imagenes || data.imagenes.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        {data.descripcion && (
          <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center mb-12">
            {data.descripcion}
          </p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {data.imagenes.map((imgObj: any, index: number) => {
            const imageNode = imgObj.imagen?.node;
            if (!imageNode?.sourceUrl) return null;
            return (
              <figure key={index} className="relative group overflow-hidden rounded-xl shadow-md aspect-square bg-slate-100">
                <Image
                  src={imageNode.sourceUrl}
                  alt={imageNode.altText || imgObj.caption || `Galería imagen ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {imgObj.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium truncate mt-4">{imgObj.caption}</p>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
