'use client';

import Script from 'next/script';
import { first } from '@/lib/queries/home';

export function Resenas({ data }: { data: any }) {
  const { titulo, elfsightId } = data || {};

  return (
    <section className="py-12 md:py-16 lg:py-[100px] bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {titulo && (
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-10">{titulo}</h2>
        )}
        
        {elfsightId ? (
          <div className="w-full mx-auto max-w-5xl">
            {/* Elfsight Widget */}
            <div className={`elfsight-app-${elfsightId}`} data-elfsight-app-lazy></div>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            [Falta la ID de Elfsight]
          </div>
        )}

        {elfsightId && (
          <Script
            src="https://static.elfsight.com/platform/platform.js"
            strategy="lazyOnload"
          />
        )}
      </div>
    </section>
  );
}
