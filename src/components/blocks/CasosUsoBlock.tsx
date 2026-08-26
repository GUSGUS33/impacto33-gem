import React from 'react';
import { PageBlock } from '@/queries/seoPageComplete';
import { Briefcase } from 'lucide-react';
import Image from 'next/image';

interface CasoUsoItem {
  titulo: string;
  descripcion: string;
  imagen?: { node: { sourceUrl: string; altText: string } } | null;
}

export const CasosUsoBlock = React.memo(function CasosUsoBlock({ data }: { data: PageBlock }) {
  const titulo = data.casosusoTitulo;
  const items: CasoUsoItem[] = (data.casosusoItems || []) as CasoUsoItem[];

  // Si no hay items, no renderizar el bloque
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {titulo && (
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-10 text-center">
          {titulo}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {items.map((item, index) => (
          <div 
            key={index}
            className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all duration-300"
          >
            {/* Imagen del caso de uso con placeholder */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              {item.imagen?.node?.sourceUrl ? (
                <Image 
                  src={item.imagen.node.sourceUrl} 
                  alt={item.imagen.node.altText || item.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Contenido del caso de uso */}
            <div className="p-5 space-y-2">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.titulo}
              </h3>
              
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {item.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
