import { SeoCategoryData } from "@shared/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Mail, FileText } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";

interface SeoContentBlockProps {
  data: SeoCategoryData;
}

export function SeoContentBlock({ data }: SeoContentBlockProps) {
  return (
    <div className="space-y-16 pb-12">
      
      {/* Blocks 1, 2, 3 are rendered in parent to allow product grid injection */}

      {/* 5. Ventajas Empresa */}
      <section className="bg-slate-50 py-12 rounded-3xl mx-4 md:mx-auto container">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">{data.ventajasEmpresa.titulo}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.ventajasEmpresa.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Casos de Uso */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {data.casosUso.map((caso, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-6 items-center bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                <img 
                  src={`/images/casos-uso/${data.slug}-${idx + 1}.jpg`} 
                  alt={caso.image_alt || caso.titulo}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback si la imagen no existe
                    e.currentTarget.src = "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              </div>
              <div className="w-full md:w-2/3 text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{caso.titulo}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{caso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-900">Preguntas Frecuentes</h2>
        <Accordion type="single" collapsible className="w-full">
          {data.faq.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                {faq.pregunta}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">
                {faq.respuesta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 8. Texto Final & 9. CTA */}
      <section className="bg-blue-600 text-white py-16 mt-12">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed opacity-90">
            {data.texto_final_refuerzo}
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-bold mb-6">{data.cta_textoCta}</h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/presupuesto-rapido">
                <span className={buttonVariants({ size: "lg", className: "bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 rounded-full w-full md:w-auto cursor-pointer" })}>
                  <FileText className="w-5 h-5 mr-2" />
                  Pedir Presupuesto
                </span>
              </Link>
              <a 
                href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg", className: "border-white text-white hover:bg-white/20 font-bold text-lg px-8 rounded-full w-full md:w-auto" })}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
