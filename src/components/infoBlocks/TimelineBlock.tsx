import React from "react";
import Image from "next/image";

export function TimelineBlock({ data }: { data: any }) {
  if (!data?.hitos || data.hitos.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-20 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        
        <div className="relative border-l-2 border-slate-100 ml-4 md:mx-auto md:w-full space-y-16">
          {data.hitos.map((hito: any, index: number) => {
            const hasImage = !!hito.imagen?.node?.sourceUrl;
            
            return (
              <div key={index} className="relative pl-8 md:pl-0">
                {/* Timeline dot */}
                <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white mt-1.5 md:mt-0 shadow-sm" />
                
                <div className={`md:flex items-center justify-between w-full ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  {/* Empty spacer for alternating sides on desktop */}
                  <div className="hidden md:block w-[45%]" />
                  
                  {/* Content card */}
                  <div className="w-full md:w-[45%]">
                    <div className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
                        {hito.anio}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{hito.titulo}</h3>
                      {hito.descripcion && (
                        <div className="prose prose-slate max-w-none text-slate-600 mb-4" dangerouslySetInnerHTML={{ __html: hito.descripcion }} />
                      )}
                      {hasImage && (
                        <div className="relative w-full h-48 mt-6 rounded-xl overflow-hidden shadow-sm">
                          <Image
                            src={hito.imagen.node.sourceUrl}
                            alt={hito.imagen.node.altText || hito.titulo}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
