'use client';
import React from 'react';
import { useParams } from 'next/navigation';

const InfoPage = () => {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  // Mapa de títulos basado en el slug
  const titles: Record<string, string> = {
    'quienes-somos': '¿Quiénes Somos?',
    'plazos-de-entrega': 'Plazos de Entrega',
    'enviar-archivos': 'Enviar Archivos',
    'formas-de-pago': 'Formas de Pago',
    'tarifa-portes': 'Tarifa de Portes',
    'precios': 'Precios',
    'garantia-de-calidad': 'Garantía de Calidad',
    'trabajos-realizados': 'Trabajos Realizados',
    'marcas': 'Marcas',
    'condiciones-generales': 'Condiciones Generales',
    'politica-privacidad': 'Política de Privacidad',
    'cookies': 'Política de Cookies',
    'aviso-legal': 'Aviso Legal',
    'preguntas-frecuentes': 'Preguntas Frecuentes',
    'blog': 'Blog'
  };

  const title = titles[slug] || 'Información';

  return (
    <>
      

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">{title}</h1>
        
        <div className="prose prose-slate max-w-none bg-white p-8 rounded-lg shadow-sm border border-slate-100">
          <p className="text-lg text-slate-600 mb-6">
            Esta página está actualmente en construcción. Estamos trabajando para ofrecerte la mejor información sobre <strong>{title}</strong>.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-700 m-0">
              Si necesitas información inmediata sobre este tema, por favor contáctanos directamente:
            </p>
          </div>

          <ul className="list-none p-0 space-y-3 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="font-semibold">Email:</span> 
              <a href="mailto:info@impacto33.com" className="text-blue-600 hover:underline">info@impacto33.com</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Teléfono:</span> 
              <a href="tel:+34690906027" className="text-blue-600 hover:underline">+34 690 906 027</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">Horario:</span> 
              Lunes a Viernes de 9:00 a 14:00 y de 15:00 a 18:00
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default InfoPage;
