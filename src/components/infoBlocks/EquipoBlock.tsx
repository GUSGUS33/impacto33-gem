import React from "react";
import Image from "next/image";

export function EquipoBlock({ data }: { data: any }) {
  if (!data?.miembros || data.miembros.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-20 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {data.miembros.map((miembro: any, index: number) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden mb-6 shadow-xl ring-4 ring-white group-hover:ring-blue-100 transition-all duration-300 group-hover:-translate-y-2">
                {miembro.foto?.node?.sourceUrl ? (
                  <Image
                    src={miembro.foto.node.sourceUrl}
                    alt={miembro.foto.node.altText || miembro.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{miembro.nombre}</h3>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">{miembro.cargo}</p>
              {miembro.bio && (
                <p className="text-slate-600 leading-relaxed max-w-sm">
                  {miembro.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
