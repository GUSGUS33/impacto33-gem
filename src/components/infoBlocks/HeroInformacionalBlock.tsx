import React from "react";
import Image from "next/image";

export function HeroInformacionalBlock({ data }: { data: any }) {
  if (!data?.titulo) return null;

  const bgImage = data.imagenFondo?.node;

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 py-24 md:py-32 lg:py-40 flex items-center justify-center">
      {bgImage && (
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={bgImage.sourceUrl}
            alt={bgImage.altText || data.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {data.mostrarBreadcrumb && (
          <div className="mb-6 opacity-70 text-sm text-white font-medium uppercase tracking-wider">
            {/* Opcional: Renderizar un breadcrumb simplificado o dejar hueco */}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
          {data.titulo}
        </h1>
        {data.subtitulo && (
          <p className="text-lg md:text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow">
            {data.subtitulo}
          </p>
        )}
      </div>
    </section>
  );
}
