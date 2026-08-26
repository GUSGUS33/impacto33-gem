'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  HelpCircle, 
  Truck, 
  UploadCloud, 
  CreditCard, 
  Users, 
  Briefcase, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Mail, 
  Phone,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';

export default function InfoPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('todos');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Render specific content based on slug
  switch (slug) {
    case 'preguntas-frecuentes':
      return renderFaqPage(faqSearch, setFaqSearch, activeFaqCategory, setActiveFaqCategory, openFaqIndex, setOpenFaqIndex);
    case 'plazos-de-entrega':
      return renderPlazosEntregaPage();
    case 'enviar-archivos':
      return renderEnviarArchivosPage();
    case 'formas-de-pago':
      return renderFormasDePagoPage();
    case 'quienes-somos':
      return renderQuienesSomosPage();
    case 'trabajos-realizados':
      return renderTrabajosRealizadosPage();
    case 'marcas':
      return renderMarcasPage();
    case 'blog':
      return renderBlogPage();
    case 'aviso-legal':
      return renderAvisoLegalPage();
    case 'politica-privacidad':
      return renderPoliticaPrivacidadPage();
    case 'cookies':
      return renderCookiesPage();
    case 'tarifa-portes':
      return renderTarifaPortesPage();
    case 'precios':
      return renderPreciosPage();
    case 'garantia-de-calidad':
      return renderGarantiaCalidadPage();
    case 'condiciones-generales':
      return renderCondicionesGeneralesPage();
    default:
      return renderDefaultInfoPage(slug);
  }
}

// ============================================================================
// 1. PREGUNTAS FRECUENTES (FAQ)
// ============================================================================
function renderFaqPage(
  search: string, 
  setSearch: (s: string) => void, 
  category: string, 
  setCategory: (c: string) => void,
  openIdx: number | null,
  setOpenIdx: (i: number | null) => void
) {
  const faqs = [
    {
      cat: 'pedidos',
      q: '¿Existe un pedido mínimo?',
      a: 'No tenemos un pedido mínimo estricto para prendas lisas. Para pedidos personalizados con serigrafía o bordado, el pedido mínimo recomendado es de 10-25 unidades para optimizar el coste de pantalla e impresión.'
    },
    {
      cat: 'pedidos',
      q: '¿Puedo solicitar una muestra antes de hacer un pedido grande?',
      a: '¡Sí! Puedes pedir muestras sin personalizar para comprobar la calidad del tejido y el tallaje. Si aceptas el presupuesto final para producción masiva, el importe de la muestra puede abonarse en la factura final.'
    },
    {
      cat: 'personalizacion',
      q: '¿Qué técnica de personalización debo elegir?',
      a: 'Depende de tu diseño y la prenda: La Serigrafía es ideal para grandes tiradas y diseños de pocos colores. El Bordado ofrece un acabado elegante e indestructible para ropa laboral. El DTF / Impresión Digital permite fotos o diseños multicolor sin límite de tonos. Te asesoramos gratuitamente.'
    },
    {
      cat: 'envios',
      q: '¿Cuánto tardan en entregar mi pedido?',
      a: 'El plazo estándar de producción y entrega es de 5 a 7 días laborables tras la confirmación del boceto digital. Contamos con servicio Express (48-72h) bajo consulta previa.'
    },
    {
      cat: 'archivos',
      q: '¿En qué formato debo enviar mi logotipo?',
      a: 'Lo ideal es enviarlo en formato vectorial (.AI, .EPS, .SVG o .PDF editable). Si no lo tienes vectorizado, aceptamos .PNG o .JPG a alta resolución (300 dpi). Nuestro equipo de diseño puede vectorizarlo por ti.'
    },
    {
      cat: 'pagos',
      q: '¿Qué formas de pago aceptáis?',
      a: 'Aceptamos Tarjeta de Crédito/Débito, Bizum, Transferencia Bancaria y PayPal. Todos los pagos son 100% seguros y con factura detallada.'
    },
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = category === 'todos' || f.cat === category;
    const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* FAQPage Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle size={14} /> Centro de Ayuda
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Preguntas Frecuentes (FAQ)</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Resuelve todas tus dudas sobre pedidos, plazos, técnicas de estampación y envíos.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar pregunta (ej. pedido mínimo, plazo, muestra...)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'pedidos', label: 'Pedidos y Muestras' },
            { id: 'personalizacion', label: 'Técnicas y Estampación' },
            { id: 'envios', label: 'Envíos y Entregas' },
            { id: 'archivos', label: 'Diseño y Archivos' },
            { id: 'pagos', label: 'Pagos y Facturas' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                category === c.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-3 mb-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <button 
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-base">{faq.q}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-xl text-center border border-slate-200 text-slate-500">
              No encontramos ninguna pregunta relacionada con tu búsqueda.
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-bold mb-2">¿Tienes alguna otra duda?</h3>
          <p className="text-blue-100 text-sm mb-6">Nuestro equipo de atención al cliente está listo para ayudarte con tu presupuesto.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacto" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Contactar con Soporte
            </Link>
            <a href="tel:+34690906027" className="bg-blue-800/80 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors text-sm flex items-center gap-2">
              <Phone size={16} /> Llamar +34 690 906 027
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. PLAZOS DE ENTREGA
// ============================================================================
function renderPlazosEntregaPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Clock size={16} /> Logística y Envíos
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Plazos de Entrega</h1>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          En <strong>IMPACTO33</strong> trabajamos para que recibas tus prendas personalizadas en el menor tiempo posible con las máximas garantías de calidad y puntualidad.
        </p>

        {/* Plazos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Envío Estándar</h3>
            <p className="text-2xl font-black text-blue-600 mb-3">5 - 7 Días</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plazo habitual para pedidos personalizados con serigrafía, DTF o bordado tras aprobación del boceto.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden shadow-2xs">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold mb-4">
              <Zap size={18} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Servicio Express</h3>
            <p className="text-2xl font-black text-blue-700 mb-3">48 - 72 Horas</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Tienes un evento urgente? Ofrecemos producción prioritaria urgente bajo consulta de stock previo.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold mb-4">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Prendas Lisas</h3>
            <p className="text-2xl font-black text-emerald-600 mb-3">24 - 48 Horas</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Para ropa sin personalizar o envío de muestras físicas para verificación de talla y tejido.
            </p>
          </div>
        </div>

        {/* Pasos del pedido */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">¿Cómo se calcula el tiempo de entrega?</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
              <div>
                <strong className="text-slate-900">Aprobación del Boceto Digital:</strong> El plazo empieza a contar una vez que confirmas la simulación visual enviada por nuestro equipo técnico.
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
              <div>
                <strong className="text-slate-900">Producción y Marcado:</strong> Estampado de las prendas en nuestros talleres locales con rigurosos controles de calidad.
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
              <div>
                <strong className="text-slate-900">Expedición y Seguimiento:</strong> Envío directo con agencias de transporte urgente (SEUR, MRW o DHL) con número de seguimiento en tiempo real.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. ENVIAR ARCHIVOS
// ============================================================================
function renderEnviarArchivosPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <UploadCloud size={16} /> Guía Técnica de Diseño
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Instrucciones para Enviar tus Archivos</h1>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Para garantizar la máxima nitidez y fidelidad de color en tus estampados o bordados, te recomendamos seguir las siguientes pautas técnicas.
        </p>

        {/* Formatos Recomendados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="border border-green-200 bg-green-50/50 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" /> Formatos Recomendados (Vectorial)
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• <strong>.AI</strong> (Adobe Illustrator)</li>
              <li>• <strong>.EPS</strong> (Encapsulated PostScript)</li>
              <li>• <strong>.SVG</strong> (Vector de gráficos escalables)</li>
              <li>• <strong>.PDF</strong> (PDF vectorial de alta resolución)</li>
            </ul>
            <p className="text-xs text-slate-500 mt-4">
              * Recuerda convertir los textos/fuentes en curvas o trazados para evitar incompatibilidades.
            </p>
          </div>

          <div className="border border-slate-200 bg-slate-50 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Imágenes de Mapa de Bits
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• <strong>.PNG</strong> (Con fondo transparente)</li>
              <li>• <strong>.TIFF / .JPG</strong> (Resolución mínima 300 DPI)</li>
              <li>• Modo de color recomendado: <strong>CMYK</strong> o Pantone</li>
            </ul>
            <p className="text-xs text-slate-500 mt-4">
              * Evita usar imágenes descargadas directamente de WhatsApp o redes sociales (baja resolución).
            </p>
          </div>
        </div>

        {/* Ayuda de vectorización */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">¿No tienes tu logotipo en formato vectorial?</h3>
            <p className="text-blue-100 text-sm">
              No te preocupes. Nuestro departamento de diseño ajustará y vectorizará gratuitamente tu diseño para asegurar un resultado perfecto en máquina.
            </p>
          </div>
          <Link href="/contacto" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap text-sm">
            Enviar mi archivo para revisión
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. FORMAS DE PAGO
// ============================================================================
function renderFormasDePagoPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <CreditCard size={16} /> Pagos Seguros
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Formas de Pago</h1>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          En <strong>IMPACTO33</strong> ofrecemos múltiples plataformas de pago 100% seguras con cifrado SSL de nivel bancario.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Tarjeta de Crédito / Débito</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Aceptamos Visa, Mastercard, Maestro y Visa Electron a través de la pasarela segura Redsys con autenticación 3D Secure.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">Visa</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">Mastercard</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">Redsys</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Bizum</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Pago instantáneo y cómodo directamente desde tu aplicación bancaria sin comisiones adicionales.
            </p>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold">Inmediato</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Transferencia Bancaria</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Ideal para empresas e instituciones. Al realizar tu pedido te facilitamos la factura proforma con nuestro IBAN.
            </p>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">Factura Proforma</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">PayPal</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Paga utilizando el saldo de tu cuenta PayPal o tus tarjetas guardadas con protección del comprador.
            </p>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-semibold">Protección PayPal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. QUIÉNES SOMOS
// ============================================================================
function renderQuienesSomosPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Users size={16} /> Sobre Nosotros
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">¿Quiénes Somos en IMPACTO33?</h1>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Desde 2009, en <strong>IMPACTO33</strong> nos dedicamos a transformar prendas de vestir y regalos promocionales en potentes herramientas de marca para empresas, eventos, peñas y particulares.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <span className="block text-3xl font-black text-blue-600 mb-1">+15</span>
            <span className="text-xs text-slate-500 uppercase font-semibold">Años de Experiencia</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <span className="block text-3xl font-black text-blue-600 mb-1">+500k</span>
            <span className="text-xs text-slate-500 uppercase font-semibold">Prendas / Año</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <span className="block text-3xl font-black text-blue-600 mb-1">+10.000</span>
            <span className="text-xs text-slate-500 uppercase font-semibold">Clientes Felices</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <span className="block text-3xl font-black text-blue-600 mb-1">100%</span>
            <span className="text-xs text-slate-500 uppercase font-semibold">Garantía Calidad</span>
          </div>
        </div>

        {/* Nuestros valores */}
        <div className="space-y-6 text-slate-700 leading-relaxed mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Nuestra Filosofía</h2>
          <p>
            Creemos que cada prenda personalizada cuenta una historia. Ya sea la camiseta de una carrera popular, el uniforme técnico de tu plantilla o el merchandising para un lanzamiento de producto, aplicamos la máxima precisión técnica en cada impresión.
          </p>
          <p>
            Trabajamos con talleres propios y la maquinaria más avanzada del mercado en serigrafía, bordado industrial, impresión digital DTF y sublimación. Sin intermediarios, asegurando precios directos de fábrica.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. TRABAJOS REALIZADOS
// ============================================================================
function renderTrabajosRealizadosPage() {
  const trabajos = [
    { title: 'Camisetas Serigrafiadas Evento Corporativo', tag: 'Serigrafía Textil', img: '/images/servicio-estampar-ropa-serigrafia-textil.jpg' },
    { title: 'Bordado de Logotipos en Polos de Empresa', tag: 'Bordado Premium', img: '/images/servicio-bordados.jpg' },
    { title: 'Sudaderas Personalizadas para Marcas de Ropa', tag: 'Impresión DTF', img: '/images/categoria-camisetas.webp' },
    { title: 'Bolsas Ecológicas de Tela y Totebags', tag: 'Serigrafía Ecológica', img: '/images/categoria-bolsas.webp' },
  ];

  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Briefcase size={14} /> Galería de Trabajos
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Trabajos Realizados</h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Muestra de algunos de los proyectos de estampación textil y regalos promocionales fabricados para nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trabajos.map((t, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs group hover:shadow-md transition-all">
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img src={t.img} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded uppercase backdrop-blur-xs">
                  {t.tag}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">¿Quieres ver tu logo impreso en nuestras prendas?</h3>
          <p className="text-slate-600 text-sm mb-6">Solicita un boceto virtual gratuito de tu producto antes de realizar el pedido.</p>
          <Link href="/presupuesto-rapido" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm">
            Solicitar Boceto Gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MARCAS
// ============================================================================
function renderMarcasPage() {
  const marcas = [
    { name: 'Roly', desc: 'Líder en ropa deportiva y textil promocional de alta durabilidad.' },
    { name: "Sol's", desc: 'Marca francesa de ropa textil moderna, camisetas de algodón orgánico y polos.' },
    { name: 'Fruit of the Loom', desc: 'Clásico mundial en camisetas básicas de algodón de alta densidad.' },
    { name: 'B&C Collection', desc: 'Especialistas en sudaderas, chaquetas y cortes de moda.' },
    { name: 'Gildan', desc: 'Excelente relación calidad-precio para eventos multitudinarios.' },
    { name: 'Kariban', desc: 'Línea corporativa y elegante con acabados de alta gama.' },
    { name: 'Velilla', desc: 'Ropa laboral de protección y uniformes de trabajo homologados.' },
    { name: 'Makito', desc: 'Catálogo de artículos promocionales y regalos publicitarios.' },
  ];

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Tag size={16} /> Distribuidores Oficiales
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Nuestras Marcas de Confianza</h1>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Trabajamos únicamente con fabricantes de prendas internacionales que garantizan la máxima calidad del tejido, resistencia en lavados y fabricación ética.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marcas.map((m, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{m.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. BLOG
// ============================================================================
function renderBlogPage() {
  const posts = [
    {
      title: 'Guía Completa 2026: ¿Serigrafía, Impresión DTF o Bordado?',
      desc: 'Analizamos las diferencias de coste, durabilidad y acabado de cada técnica para ayudarte a elegir la mejor opción.',
      date: '02 Agosto 2026'
    },
    {
      title: 'Cómo Elegir la Ropa Laboral Adecuada para tu Empresa',
      desc: 'Consejos para combinar seguridad, comodidad y buena presencia corporativa en la vestimenta de tu equipo.',
      date: '28 Julio 2026'
    },
    {
      title: 'Tendencias en Regalos Publicitarios y Merchandising Sostenible',
      desc: 'Bolsas de algodón orgánico, botellas de bambú y artículos ecológicos con el logo de tu empresa.',
      date: '15 Julio 2026'
    }
  ];

  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen size={16} /> Novedades y Consejos
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Blog de Personalización Textil</h1>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <article key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs hover:shadow-md transition-shadow">
              <span className="text-xs text-slate-400 font-medium block mb-2">{post.date}</span>
              <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                {post.title}
              </h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{post.desc}</p>
              <span className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer">
                Leer artículo completo <ArrowRight size={14} />
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEGALES (Aviso Legal, Privacidad, Cookies, Condiciones, Portes, Precios, Calidad)
// ============================================================================
function renderAvisoLegalPage() {
  return renderLegalTemplate(
    'Aviso Legal',
    'En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).',
    [
      { h: '1. Datos Identificativos', p: 'El titular de la tienda online impacto33.com es IMPACTO33 S.L., con domicilio social en España. Correo electrónico de contacto: info@impacto33.com, Teléfono: +34 690 906 027.' },
      { h: '2. Propiedad Intelectual', p: 'Todos los contenidos del sitio web (textos, gráficos, logotipos, imágenes y diseño) están protegidos por derechos de propiedad intelectual e industrial.' },
      { h: '3. Responsabilidad', p: 'IMPACTO33 no se hace responsable de las interrupciones temporales del servicio debidas a mantenimiento técnico o de causas ajenas a su control.' }
    ]
  );
}

function renderPoliticaPrivacidadPage() {
  return renderLegalTemplate(
    'Política de Privacidad',
    'Conforme al Reglamento General de Protección de Datos (RGPD UE 2016/679) y LOPDGDD 3/2018.',
    [
      { h: '1. Responsable del Tratamiento', p: 'Sus datos personales son tratados por IMPACTO33 con la finalidad de gestionar la venta, personalización de productos y envío de presupuestos solicitados.' },
      { h: '2. Legitimación', p: 'La base legal para el tratamiento de sus datos es la ejecución del contrato de compraventa o el consentimiento expreso prestado en los formularios.' },
      { h: '3. Sus Derechos', p: 'Puede ejercitar sus derechos de acceso, rectificación, supresión, limitación y oposición enviando un correo electrónico a info@impacto33.com.' }
    ]
  );
}

function renderCookiesPage() {
  return renderLegalTemplate(
    'Política de Cookies',
    'Información clara e integral sobre el uso de cookies en el sitio web de IMPACTO33.',
    [
      { h: '1. ¿Qué son las cookies?', p: 'Una cookie es un pequeño archivo de texto que se almacena en su navegador al visitar casi cualquier página web.' },
      { h: '2. Cookies Utilizadas', p: 'Utilizamos cookies técnicas necesarias para el funcionamiento del carrito de compra y cookies analíticas para mejorar la experiencia de usuario.' },
      { h: '3. Configuración', p: 'Usted puede restringir, bloquear o borrar las cookies de IMPACTO33 desde la configuración de su navegador en cualquier momento.' }
    ]
  );
}

function renderTarifaPortesPage() {
  return renderLegalTemplate(
    'Tarifa de Portes y Envíos',
    'Información sobre tarifas de envío en España Peninsular y Baleares.',
    [
      { h: '1. Envíos Península', p: 'Envíos gratuitos a partir de pedidos de importe superior a 150€ (IVA no incl.). Para pedidos inferiores, el importe de transporte es de 6,95€ + IVA.' },
      { h: '2. Envíos Baleares y Canarias', p: 'Consultar tarifas y trámites aduaneros específicos para envíos fuera de la Península.' }
    ]
  );
}

function renderPreciosPage() {
  return renderLegalTemplate(
    'Precios y Descuentos por Volumen',
    'Transparencia en el escalado de precios.',
    [
      { h: '1. Escalado por Cantidad', p: 'Nuestras tarifas reducen progresivamente el coste unitario por prenda a mayor volumen de pedido (10, 25, 50, 100, 250, 500+ unidades).' },
      { h: '2. Impuestos', p: 'Salvo que se indique explícitamente lo contrario, los precios web se muestran sin IVA para facilitar las transacciones B2B.' }
    ]
  );
}

function renderGarantiaCalidadPage() {
  return renderLegalTemplate(
    'Garantía de Calidad',
    'Nuestro compromiso con el acabado perfecto.',
    [
      { h: '1. Revisión Previa', p: 'Antes de pasar a máquina, enviamos una simulación virtual gráfica para que apruebes dimensiones y ubicación exacta del marcaje.' },
      { h: '2. Garantía de Reposición', p: 'Si existe cualquier defecto de fabricación o fallo en la estampación, nos hacemos cargo de la reposición sin coste adicional.' }
    ]
  );
}

function renderCondicionesGeneralesPage() {
  return renderLegalTemplate(
    'Condiciones Generales de Venta',
    'Términos que rigen las transacciones comerciales en IMPACTO33.',
    [
      { h: '1. Aceptación del Pedido', p: 'El pedido se formaliza tras el pago o señal acordada y la confirmación escrita de la maqueta o boceto gráfico.' },
      { h: '2. Devoluciones', p: 'Al tratarse de artículos personalizados a medida con logotipos específicos, no se admiten devoluciones por desistimiento una vez impresas las prendas.' }
    ]
  );
}

function renderLegalTemplate(title: string, subtitle: string, sections: { h: string; p: string }[]) {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck size={16} /> Información Legal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500 text-sm mb-8">{subtitle}</p>

        <div className="space-y-6 text-slate-700 text-sm leading-relaxed border-t border-slate-100 pt-6">
          {sections.map((sec, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-base mb-2">{sec.h}</h3>
              <p>{sec.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderDefaultInfoPage(slug: string) {
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{formattedTitle}</h1>
        <p className="text-slate-600 mb-8">
          En IMPACTO33 te asesoramos encantados sobre cualquier consulta relacionada con {formattedTitle.toLowerCase()}.
        </p>
        <Link href="/contacto" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm inline-block">
          Contactar con Atención al Cliente
        </Link>
      </div>
    </div>
  );
}
