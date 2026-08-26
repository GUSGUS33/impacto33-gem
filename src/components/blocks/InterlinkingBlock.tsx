import { PageBlock } from '@/queries/seoPageComplete';
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

interface InterlinkingItem {
  texto: string;
  url: string;
  descripcion?: string;
}

export function InterlinkingBlock({ data }: { data: PageBlock }) {
  const titulo = data.interlinkingTitulo;
  const enlaces: InterlinkingItem[] = (data.interlinkingItems || []) as InterlinkingItem[];

  // Si no hay enlaces, no renderizar el bloque
  if (!enlaces || enlaces.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {titulo && (
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 text-center">
          {titulo}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {enlaces.map((enlace, index) => (
          <Link key={index} href={enlace.url}>
            <div className="group relative bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col">
              {/* Flecha en esquina superior derecha */}
              <ArrowRight className="absolute top-4 right-4 w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              
              {/* Título del enlace en negrita */}
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 pr-8">
                {enlace.texto}
              </h3>

              {/* Descripción opcional */}
              {enlace.descripcion && (
                <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                  {enlace.descripcion}
                </p>
              )}


            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
