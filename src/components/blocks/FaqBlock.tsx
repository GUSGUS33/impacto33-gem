"use client";

import { PageBlock } from '@/queries/seoPageComplete';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqBlockProps {
  data: PageBlock;
}

/**
 * Bloque de Preguntas Frecuentes (FAQ)
 * Accordion expandible
 */
export function FaqBlock({ data }: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!data.faqItems || data.faqItems.length === 0) return null;

  // Generar FAQPage Schema para SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqItems
      .filter(item => item.pregunta && item.respuesta)
      .map(item => ({
        "@type": "Question",
        "name": item.pregunta,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.respuesta?.replace(/<[^>]*>/g, '') || '' // Eliminar HTML tags
        }
      }))
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* FAQPage Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {data.faqTitulo && (
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
          {data.faqTitulo}
        </h2>
      )}
      <div className="space-y-4">
        {data.faqItems.map((item, index) => {
          if (!item.pregunta) return null;

          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <h3 className="font-semibold text-slate-900 pr-4 text-lg">
                  {item.pregunta}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && item.respuesta && (
                <div className="px-6 pb-6">
                  <div
                    className="text-slate-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.respuesta }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
