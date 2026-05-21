import React from 'react';
import { PageBlock } from '@/queries/seoPageComplete';

interface GaleriaBlockProps {
  data: PageBlock;
}

/**
 * Bloque de galería de trabajos/imágenes
 * Grid responsive de imágenes
 */
export const GaleriaBlock = React.memo(function GaleriaBlock({ data }: GaleriaBlockProps) {
  if (!data.galeriaImagenes?.nodes || data.galeriaImagenes.nodes.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {data.galeriaTitulo && (
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          {data.galeriaTitulo}
        </h2>
      )}
      {data.galeriaDescripcion && (
        <p className="text-lg text-slate-600 mb-12 text-center">
          {data.galeriaDescripcion}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.galeriaImagenes.nodes.map((imagen, index) => (
          <div
            key={index}
            className="aspect-square bg-slate-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            <img
              src={imagen.sourceUrl}
              alt={imagen.altText || `Imagen ${index + 1}`}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
