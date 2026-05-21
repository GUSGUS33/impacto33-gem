'use client';

import { useState } from 'react';
import Image from 'next/image';

export function Newsletter({ data }: { data: any }) {
  const { titulo, subtitulo, placeholderEmail, textoBoton, imagen } = data;
  const imageUrl = imagen?.node?.sourceUrl;

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simular envío (Fase 1 solo UI)
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <section className="py-12 md:py-16 lg:py-[100px] bg-slate-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-6xl mx-auto rounded-3xl bg-slate-800 p-8 md:p-12 border border-slate-700/50">
          
          {/* Contenido Izquierda */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {titulo && (
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {titulo}
              </h2>
            )}
            
            {subtitulo && (
              <p className="text-slate-300 text-lg mb-8 max-w-md">
                {subtitulo}
              </p>
            )}

            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-xl w-full max-w-md font-medium text-center">
                ¡Gracias por suscribirte! Te enviaremos novedades pronto.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder={placeholderEmail || "Tu correo electrónico"}
                  className="flex-1 rounded-full px-6 py-3 bg-slate-900 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-blue-600 hover:bg-brand text-white font-bold py-3 px-8 rounded-full transition-colors flex justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Enviando...' : (textoBoton || 'Suscribirse')}
                </button>
              </form>
            )}
            <p className="text-xs text-slate-500 mt-4 text-center lg:text-left">
              * Prometemos no enviar spam. Puedes darte de baja en cualquier momento.
            </p>
          </div>

          {/* Imagen Derecha (Oculta en móvil si es puramente decorativa) */}
          {imageUrl && (
            <div className="hidden lg:block w-full max-w-[300px]">
              <div className="relative aspect-square w-full">
                <Image
                  src={imageUrl}
                  alt="Newsletter decoration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
