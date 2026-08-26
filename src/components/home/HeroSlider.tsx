'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { HeroAdvancedSearch } from './HeroAdvancedSearch';

export function HeroSlider({ data }: { data: any }) {
  const slides = data?.slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative mb-28 sm:mb-20 md:mb-16">
      <section className="relative w-full h-[400px] sm:h-[480px] md:h-[600px] overflow-hidden bg-slate-900">
        {slides.map((slide: any, index: number) => {
          const imageUrl = slide.imagenFondo?.node?.sourceUrl;
          const fallbackBg = 'bg-gradient-to-r from-slate-900 to-blue-900';
          const isActive = index === currentSlide;

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={slide.imagenFondo?.node?.altText || 'Hero slide'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                />
              ) : (
                <div className={`absolute inset-0 ${fallbackBg}`} />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/60" />

              <div className="relative z-20 h-full flex items-center justify-center text-center px-4 sm:px-6">
                <div className="max-w-3xl pt-4 sm:pt-0">
                  {slide.badge && (
                    <span className="inline-block bg-blue-600 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase tracking-wider">
                      {slide.badge}
                    </span>
                  )}
                  {slide.titulo && (
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 sm:mb-4 leading-tight">
                      {slide.titulo}
                    </h1>
                  )}
                  {slide.subtitulo && (
                    <p className="text-sm sm:text-lg md:text-xl text-slate-200 mb-5 sm:mb-8 max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
                      {slide.subtitulo}
                    </p>
                  )}
                  {slide.ctaTexto && slide.ctaUrl && (
                    <Link
                      href={slide.ctaUrl}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-brand text-white font-bold py-2.5 px-6 sm:py-3 sm:px-8 text-sm sm:text-base rounded-full transition-colors min-h-[44px]"
                    >
                      {slide.ctaTexto}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicadores */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-blue-600 w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Buscador Avanzado posicionado sobre el límite inferior */}
      <div className="absolute left-0 right-0 -bottom-24 md:-bottom-12 z-40 px-4 w-full flex justify-center">
        <HeroAdvancedSearch />
      </div>
    </div>
  );
}
