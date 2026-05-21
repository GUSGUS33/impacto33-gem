import React from "react";
import Image from "next/image";

export function EstadisticasBlock({ data }: { data: any }) {
  if (!data?.stats || data.stats.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-blue-600 text-white relative overflow-hidden">
      {/* Decorative background elements can go here if needed */}
      <div className="container mx-auto px-4 relative z-10">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight drop-shadow-md">
            {data.titulo}
          </h2>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 md:divide-x md:divide-blue-400">
          {data.stats.map((stat: any, index: number) => (
            <div key={index} className="flex flex-col items-center text-center px-4">
              {stat.icono?.node?.sourceUrl && (
                <div className="mb-6 relative w-12 h-12 opacity-90 drop-shadow-md">
                  <Image
                    src={stat.icono.node.sourceUrl}
                    alt={stat.icono.node.altText || "Icono estadística"}
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
              )}
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-baseline drop-shadow-lg">
                {stat.numero}
                {stat.sufijo && <span className="text-2xl md:text-3xl ml-1 text-blue-200">{stat.sufijo}</span>}
              </div>
              <div className="text-sm md:text-base font-medium text-blue-100 uppercase tracking-wide">
                {stat.descripcion}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
