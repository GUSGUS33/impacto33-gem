import React from "react";
import Image from "next/image";

export function ProcesoBlock({ data }: { data: any }) {
  if (!data?.pasos || data.pasos.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-[3.5rem] left-[16.66%] right-[16.66%] h-0.5 bg-slate-100" />
          
          {data.pasos.map((paso: any, index: number) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mb-8 relative z-10 hover:border-blue-50 transition-colors">
                {paso.icono?.node?.sourceUrl ? (
                  <div className="relative w-12 h-12 md:w-14 md:h-14">
                    <Image
                      src={paso.icono.node.sourceUrl}
                      alt={paso.icono.node.altText || paso.titulo}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-3xl font-extrabold text-blue-600">{index + 1}</span>
                )}
                
                {/* Step number badge */}
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {index + 1}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">{paso.titulo}</h3>
              {paso.descripcion && (
                <div 
                  className="text-slate-600 text-base leading-relaxed max-w-xs mx-auto"
                  dangerouslySetInnerHTML={{ __html: paso.descripcion }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
