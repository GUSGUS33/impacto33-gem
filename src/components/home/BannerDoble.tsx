import Image from 'next/image';
import Link from 'next/link';

export function BannerDoble({ data }: { data: any }) {
  const { titulo, banners } = data;

  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-[100px] bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {titulo && (
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-10">{titulo}</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-auto md:h-[400px]">
          {banners.map((banner: any, index: number) => {
            const imageUrl = banner.imagen?.node?.sourceUrl;
            
            return (
              <div 
                key={index} 
                className="relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-full flex flex-col justify-end p-8 md:p-10 group"
              >
                {/* Fondo */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={banner.titulo || 'Banner doble'}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                  {/* Gradiente para que el texto sea legible siempre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                </div>

                {/* Contenido (abajo alineado) */}
                <div className="relative z-10 flex flex-col items-start translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {banner.badge && (
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                      {banner.badge}
                    </span>
                  )}
                  
                  {banner.titulo && (
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                      {banner.titulo}
                    </h3>
                  )}
                  
                  {banner.subtitulo && (
                    <p className="text-slate-200 mb-6 line-clamp-2">
                      {banner.subtitulo}
                    </p>
                  )}
                  
                  {banner.ctaTexto && banner.ctaUrl && (
                    <Link
                      href={banner.ctaUrl}
                      className="inline-block bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-6 rounded-full transition-colors opacity-90 group-hover:opacity-100"
                    >
                      {banner.ctaTexto}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
