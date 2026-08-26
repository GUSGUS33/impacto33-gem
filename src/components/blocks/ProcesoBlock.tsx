import { PageBlock } from '@/queries/seoPageComplete';
import { Package } from 'lucide-react';
import Image from 'next/image';

interface ProcesoStep {
  titulo: string;
  descripcion: string;
  icono?: { node: { sourceUrl: string; altText: string } } | null;
}

export function ProcesoBlock({ data }: { data: PageBlock }) {
  const titulo = data.procesoTitulo;
  const pasos: ProcesoStep[] = (data.procesoPasos || []) as ProcesoStep[];

  // Si no hay pasos, no renderizar el bloque
  if (!pasos || pasos.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {titulo && (
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-10 text-center">
          {titulo}
        </h2>
      )}

      <div className="space-y-8 md:space-y-12">
        {pasos.map((paso, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-8 items-center`}
            >
              {/* Imagen del paso con placeholder */}
              <div className="w-full md:w-1/2 relative">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden group">
                  {paso.icono?.node?.sourceUrl ? (
                    <Image 
                      src={paso.icono.node.sourceUrl} 
                      alt={paso.icono.node.altText || paso.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}
                  
                  {/* Número del paso en esquina */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
              </div>

              {/* Contenido del paso */}
              <div className="w-full md:w-1/2 space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {paso.titulo}
                </h3>
                
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                  {paso.descripcion}
                </p>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}
