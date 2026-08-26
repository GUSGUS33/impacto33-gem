import Link from 'next/link';

export function CtaFinal({ data }: { data: any }) {
  const { titulo, subtitulo, textoBoton, urlBoton, colorFondo } = data;

  const defaultBgClass = !colorFondo ? 'bg-slate-900' : '';

  return (
    <section 
      className={`py-16 md:py-20 lg:py-[100px] text-center ${defaultBgClass}`}
      style={{ backgroundColor: colorFondo || undefined }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {titulo && (
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {titulo}
            </h2>
          )}
          
          {subtitulo && (
            <p className="text-lg md:text-xl text-white/90 mb-10 font-medium">
              {subtitulo}
            </p>
          )}

          {textoBoton && urlBoton && (
            <Link
              href={urlBoton}
              className="inline-block bg-white text-slate-900 font-extrabold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 hover:text-brand transition-all duration-300"
            >
              {textoBoton}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
