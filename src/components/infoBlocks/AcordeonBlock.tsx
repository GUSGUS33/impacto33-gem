"use client";
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function AcordeonBlock({ data }: { data: any }) {
  if (!data?.items || data.items.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.items
      .filter((item: any) => item.pregunta && item.respuesta)
      .map((item: any) => ({
        "@type": "Question",
        "name": item.pregunta,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.respuesta.replace(/<[^>]*>/g, '').trim(),
        },
      })),
  };

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      {/* FAQPage Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        {data.descripcion && (
          <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center mb-12">
            {data.descripcion}
          </p>
        )}
        
        <Accordion type="single" collapsible className="w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          {data.items.map((item: any, index: number) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-slate-200">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-800 hover:text-blue-600 hover:no-underline">
                {item.pregunta}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 prose prose-slate max-w-none pb-6" dangerouslySetInnerHTML={{ __html: item.respuesta }} />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
