import React from "react";
import Image from "next/image";

export function LogosGridBlock({ data }: { data: any }) {
  if (!data?.logos || data.logos.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4">
        {data.titulo && (
          <h3 className="text-xl md:text-2xl font-semibold text-slate-500 mb-10 text-center uppercase tracking-wider">
            {data.titulo}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {data.logos.map((logoObj: any, index: number) => {
            const imageNode = logoObj.logo?.node;
            if (!imageNode?.sourceUrl) return null;
            
            const Tag = logoObj.enlace ? "a" : "div";
            const tagProps = logoObj.enlace ? { href: logoObj.enlace, target: "_blank", rel: "noopener noreferrer" } : {};

            return (
              <Tag key={index} {...tagProps} className="relative w-24 h-12 md:w-32 md:h-16 flex items-center justify-center transition-transform hover:scale-110">
                <Image
                  src={imageNode.sourceUrl}
                  alt={imageNode.altText || logoObj.nombre || `Logo ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 96px, 128px"
                />
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}
