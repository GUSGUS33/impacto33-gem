import Image from 'next/image';
import Link from 'next/link';
import { first } from '@/lib/queries/home';

export function GridCategorias({ data }: { data: any }) {
  const { titulo, subtitulo, columnas, categorias } = data;
  
  if (!categorias || categorias.length === 0) return null;

  const numColumnas = first(columnas);
  let gridColsClass = 'lg:grid-cols-6';
  
  if (numColumnas === '4') gridColsClass = 'lg:grid-cols-4';
  if (numColumnas === '8') gridColsClass = 'lg:grid-cols-8';

  return (
    <section className="py-12 md:py-16 lg:py-[100px] bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {(titulo || subtitulo) && (
          <div className="text-center mb-10">
            {titulo && <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{titulo}</h2>}
            {subtitulo && <p className="text-slate-500 max-w-2xl mx-auto">{subtitulo}</p>}
          </div>
        )}

        <div className={`grid grid-cols-3 md:grid-cols-4 ${gridColsClass} gap-4 md:gap-6 lg:gap-8 w-full justify-center`}>
          {categorias.map((cat: any, index: number) => {
            const slug = cat.slugCategoria || '#';
            const name = cat.labelPersonalizado?.trim() || cat.slugCategoria || 'Categoría';
            const imageUrl = cat.imagenOverride?.node?.sourceUrl;
            const initial = name.charAt(0).toUpperCase();

            return (
              <Link 
                key={index} 
                href={`/${slug}`}
                className="group flex flex-col items-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-3 md:mb-4 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-transparent group-hover:border-brand transition-colors shadow-sm group-hover:shadow-md">
                  {imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-slate-400 group-hover:text-brand transition-colors">
                      {initial}
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-brand transition-colors text-center px-1">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
