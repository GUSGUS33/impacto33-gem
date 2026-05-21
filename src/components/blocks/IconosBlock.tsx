import { PageBlock } from '@/queries/seoPageComplete';

interface IconosBlockProps {
  data: PageBlock;
}

/**
 * Bloque de 4 columnas con iconos
 * Grid responsive de características/beneficios
 */
export function IconosBlock({ data }: IconosBlockProps) {
  if (!data.iconosColumnas || data.iconosColumnas.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {data.iconosTitulo && (
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          {data.iconosTitulo}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.iconosColumnas.map((columna, index) => {
          if (!columna.titulo) return null;

          return (
            <div key={index} className="text-center">
              {columna.icono?.node && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={columna.icono.node.sourceUrl}
                    alt={columna.icono.node.altText || columna.titulo}
                    loading="lazy"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {columna.titulo}
              </h3>
              {columna.descripcion && (
                <p className="text-slate-600 text-sm">
                  {columna.descripcion}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
