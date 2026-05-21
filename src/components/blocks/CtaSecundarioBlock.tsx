import { PageBlock } from '@/queries/seoPageComplete';

interface CtaSecundarioBlockProps {
  data: PageBlock;
}

/**
 * Bloque de CTA secundario
 * Llamada a la acción destacada
 */
export function CtaSecundarioBlock({ data }: CtaSecundarioBlockProps) {
  if (!data.ctasecundarioTitulo) return null;

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-12 shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {data.ctasecundarioTitulo}
        </h2>
        {data.ctasecundarioDescripcion && (
          <p className="text-lg text-blue-50 mb-8">
            {data.ctasecundarioDescripcion}
          </p>
        )}
        {data.ctasecundarioTexto && data.ctasecundarioUrl && (
          <a
            href={data.ctasecundarioUrl}
            className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transition-colors"
          >
            {data.ctasecundarioTexto}
          </a>
        )}
      </div>
    </div>
  );
}
