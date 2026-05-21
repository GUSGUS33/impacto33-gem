import { PageBlock } from '@/queries/seoPageComplete';
import { TrendingUp } from 'lucide-react';

interface StatItem {
  numero: string;
  sufijo?: string;
  descripcion: string;
  icono?: { node: { sourceUrl: string; altText: string } } | null;
}

export function StatsBlock({ data }: { data: PageBlock }) {
  const titulo = data.statsTitulo;
  const items: StatItem[] = (data.statsItems || []) as StatItem[];

  // Si no hay items, no renderizar el bloque
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {titulo && (
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 md:mb-12 text-center">
          {titulo}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {items.map((item, index) => (
          <div 
            key={index}
            className="text-center space-y-3 p-6 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
          >
            {/* Icono opcional */}
            {item.icono?.node?.sourceUrl && (
              <div className="flex justify-center mb-3">
                <img 
                  src={item.icono.node.sourceUrl} 
                  alt={item.icono.node.altText || item.descripcion}
                  loading="lazy"
                  className="w-12 h-12 object-contain"
                />
              </div>
            )}

            {/* Número grande con sufijo */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-blue-600">
                {item.numero}
              </span>
              {item.sufijo && (
                <span className="text-2xl md:text-3xl font-bold text-blue-600">
                  {item.sufijo}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="text-sm md:text-base text-slate-600 font-medium leading-tight">
              {item.descripcion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
