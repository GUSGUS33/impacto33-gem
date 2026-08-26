import Image from 'next/image';
import Link from 'next/link';

export function BannerTextoImagen({ data }: { data: any }) {
  const { imagen, badge, titulo, subtitulo, ctaTexto, ctaUrl, posicionTexto, colorFondo } = data;
  
  const imageUrl = imagen?.node?.sourceUrl;
  const isTextRight = posicionTexto === 'derecha';
  const isTextCenter = posicionTexto === 'centro';
  
  let alignClass = 'items-start text-left';
  let selfAlignClass = 'ml-0 mr-auto';
  if (isTextRight) {
    alignClass = 'items-end text-right';
    selfAlignClass = 'mr-0 ml-auto';
  } else if (isTextCenter) {
    alignClass = 'items-center text-center';
    selfAlignClass = 'mx-auto';
  }

  const defaultBg = colorFondo ? `bg-[${colorFondo}]` : 'bg-slate-900';

  return (
    <section className="relative w-full min-h-[350px] md:min-h-[450px] lg:min-h-[600px] overflow-hidden flex items-center py-16 lg:py-[100px]">
      {/* Fondo */}
      <div className={`absolute inset-0 z-0 ${!imageUrl ? defaultBg : ''}`}>
        {imageUrl && (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={titulo || 'Banner'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
            {/* Overlay oscuro para legibilidad si hay imagen */}
            <div className="absolute inset-0 bg-slate-900/50" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className={`flex flex-col max-w-2xl ${alignClass} ${selfAlignClass}`}>
          {badge && (
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow-sm">
              {badge}
            </span>
          )}
          
          {titulo && (
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
              {titulo}
            </h2>
          )}
          
          {subtitulo && (
            <p className="text-lg text-slate-100 mb-8 max-w-xl drop-shadow-sm">
              {subtitulo}
            </p>
          )}
          
          {ctaTexto && ctaUrl && (
            <Link
              href={ctaUrl}
              className="inline-block bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              {ctaTexto}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
