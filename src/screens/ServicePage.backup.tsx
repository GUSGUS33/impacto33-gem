import React from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Image as ImageIcon, Printer, Palette, Layers, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/Breadcrumbs";

// Datos de los servicios
const servicesData: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  image: string;
  icon: React.ElementType;
  gallery: string[];
  benefits: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}> = {
  "serigrafia": {
    title: "Serigrafía Textil",
    description: "La técnica clásica y más duradera. Ideal para grandes tiradas.",
    longDescription: "La serigrafía es una técnica de impresión milenaria que consiste en transferir tinta a través de una malla tensada en un marco. Es el método más popular y rentable para grandes cantidades, ofreciendo una durabilidad excepcional y colores vibrantes que resisten cientos de lavados.",
    features: [
      "Ideal para grandes cantidades (más de 50 unidades)",
      "Alta durabilidad y resistencia al lavado",
      "Colores Pantone exactos",
      "Económico en grandes tiradas",
      "Acabado profesional y tacto suave"
    ],
    image: "/images/servicio-estampar-ropa-serigrafia-textil.jpg",
    icon: Layers,
    gallery: [
      "/images/categories/camisetas.webp",
      "/images/categories/sudaderas.webp",
      "/images/categories/bolsas.webp"
    ],
    benefits: [
      { title: "Durabilidad Extrema", desc: "La tinta penetra en el tejido, asegurando que el diseño no se agriete ni se desvanezca con el tiempo." },
      { title: "Coste Efectivo", desc: "Cuantas más unidades pidas, menor será el coste unitario, haciéndolo perfecto para eventos y uniformes." },
      { title: "Versatilidad", desc: "Se puede aplicar sobre algodón, poliéster y mezclas, en camisetas, sudaderas, bolsas y más." }
    ],
    faqs: [
      { question: "¿Cuál es el pedido mínimo para serigrafía?", answer: "Recomendamos un mínimo de 50 unidades para que el coste de las pantallas y fotolitos sea rentable. Para cantidades menores, sugerimos impresión digital o transfer." },
      { question: "¿Cuántos colores puedo imprimir?", answer: "Podemos imprimir hasta 8 colores planos. Si tu diseño tiene degradados o fotografías, la serigrafía tradicional no es la mejor opción; en ese caso, recomendamos DTG o Sublimación." },
      { question: "¿Resiste bien los lavados?", answer: "Sí, es una de las técnicas más resistentes. Si se lava correctamente (agua fría, del revés), la impresión puede durar tanto como la propia prenda." },
      { question: "¿Puedo imprimir sobre cualquier color de prenda?", answer: "Sí, la serigrafía funciona perfectamente tanto en prendas claras como oscuras, ya que utilizamos tintas de alta opacidad." }
    ]
  },
  "sublimacion": {
    title: "Sublimación Textil",
    description: "Color sin límites. Perfecta para tazas y textil poliéster.",
    longDescription: "La sublimación es un proceso químico donde la tinta pasa de estado sólido a gaseoso, penetrando directamente en las fibras del tejido. Esto permite imprimir diseños a todo color, fotografías y degradados sin tacto alguno sobre la prenda, ya que la tinta se funde con el material.",
    features: [
      "Impresión a todo color sin límite de tonos",
      "Sin tacto (la tinta se funde con la tela)",
      "Transpirable 100%",
      "Ideal para ropa deportiva y técnica",
      "Permite estampar fotografías con alta calidad"
    ],
    image: "/images/servicio-personalizado-sublimacion-textil.jpg",
    icon: Palette,
    gallery: [
      "/images/categories/camisetas-tecnicas.webp",
      "/images/categories/tazas.webp",
      "/images/categories/lanyards.webp"
    ],
    benefits: [
      { title: "Calidad Fotográfica", desc: "Reproduce imágenes complejas, degradados y sombras con una fidelidad de color impresionante." },
      { title: "Imperceptible al Tacto", desc: "Al teñir la fibra, no deja ninguna capa de tinta sobre la tela, manteniendo la transpirabilidad." },
      { title: "Resistencia Total", desc: "El diseño no se borra, no pierde color y resiste lavados intensivos sin problemas." }
    ],
    faqs: [
      { question: "¿Puedo sublimar camisetas de algodón?", answer: "No, la sublimación solo funciona químicamente sobre poliéster (mínimo 80%). Para algodón, recomendamos impresión digital o serigrafía." },
      { question: "¿Se puede sublimar sobre prendas negras?", answer: "No, la sublimación no tiene tinta blanca, por lo que solo se puede aplicar sobre prendas blancas o de colores muy claros." },
      { question: "¿El diseño pierde color con el sol?", answer: "La sublimación es muy resistente, pero una exposición prolongada y directa al sol intenso podría atenuar los colores con los años, como cualquier tejido teñido." },
      { question: "¿Hay límite de colores?", answer: "Ninguno. Puedes imprimir fotografías, degradados y diseños complejos sin coste adicional por número de colores." }
    ]
  },
  "impresion-digital": {
    title: "Impresión Digital (DTG)",
    description: "Calidad fotográfica directa sobre la prenda. Sin pedido mínimo.",
    longDescription: "La impresión digital directa (DTG) funciona como una impresora de inyección de tinta pero sobre tela. Permite imprimir diseños complejos con muchos colores y detalles directamente sobre prendas de algodón, sin necesidad de pantallas ni fotolitos, lo que la hace ideal para tiradas cortas.",
    features: [
      "Sin pedido mínimo (desde 1 unidad)",
      "Calidad fotográfica y detalles finos",
      "Tacto suave integrado en la prenda",
      "Ideal para diseños multicolor complejos",
      "Rápida producción"
    ],
    image: "/images/servicio-DTG-impresion-digital-textil.jpg",
    icon: Printer,
    gallery: [
      "/images/categories/camisetas.webp",
      "/images/categories/bolsas.webp",
      "/images/categories/sudaderas.webp"
    ],
    benefits: [
      { title: "Flexibilidad Total", desc: "Puedes pedir desde una sola unidad con un diseño a todo color sin costes de preparación." },
      { title: "Detalle Máximo", desc: "Capaz de reproducir sombras, degradados y líneas finas que otras técnicas no pueden." },
      { title: "Rapidez", desc: "Al no requerir pantallas previas, el proceso de producción es mucho más ágil para pedidos urgentes." }
    ],
    faqs: [
      { question: "¿Cuál es la composición ideal de la prenda?", answer: "Para obtener los mejores resultados, recomendamos prendas de 100% algodón. Cuanto más algodón tenga, mejor se fijará la tinta." },
      { question: "¿Es resistente a los lavados?", answer: "Sí, aunque requiere ciertos cuidados: lavar del revés, en agua fría y evitar secadora para prolongar la vida del diseño." },
      { question: "¿Puedo imprimir sobre prendas oscuras?", answer: "Sí, nuestras máquinas aplican una base de tinta blanca previa para que los colores resalten perfectamente sobre fondos negros o de color." },
      { question: "¿Es más caro que la serigrafía?", answer: "Para pocas unidades es más barato porque no hay costes fijos de pantalla. Para grandes tiradas (más de 50-100), la serigrafía suele ser más económica." }
    ]
  },
  "vinilo": {
    title: "Vinilo Textil",
    description: "Acabados especiales y alta resistencia para ropa laboral.",
    longDescription: "El vinilo textil es una lámina plástica termoadhesiva de alta calidad que se corta con plotter y se fija a la prenda mediante calor y presión. Es la técnica reina para la personalización de nombres y números en equipaciones deportivas, así como para diseños vectoriales simples con colores sólidos.",
    features: [
      "Colores sólidos muy intensos y cubrientes",
      "Acabados especiales (flúor, metalizado, reflectante)",
      "Ideal para nombres y números",
      "Gran resistencia y durabilidad",
      "Perfecto para ropa laboral y deportiva"
    ],
    image: "/images/servicio-imprimir-vinilo-textil-personalizado.jpg",
    icon: ImageIcon,
    gallery: [
      "/images/categories/ropa-vestuario-laboral.webp",
      "/images/categories/deporte.webp",
      "/images/categories/gorras.webp"
    ],
    benefits: [
      { title: "Acabados Únicos", desc: "Disponible en texturas terciopelo, purpurina, reflectante o metalizado para destacar tu marca." },
      { title: "Personalización Individual", desc: "La mejor opción para poner nombres diferentes en cada prenda (ej. equipos deportivos)." },
      { title: "Alta Opacidad", desc: "Cubre perfectamente sobre prendas oscuras sin perder intensidad de color." }
    ],
    faqs: [
      { question: "¿Se despega con el tiempo?", answer: "Si se aplica correctamente con prensa profesional, no debería despegarse. Utilizamos vinilos de alta gama que se funden con el tejido." },
      { question: "¿Puedo planchar sobre el vinilo?", answer: "Nunca directamente. Debes planchar la prenda del revés o colocar un paño protector sobre el diseño para no derretirlo." },
      { question: "¿Sirve para diseños con muchos detalles pequeños?", answer: "No es lo ideal, ya que hay que 'pelar' el vinilo sobrante manualmente. Para diseños muy intrincados, recomendamos DTF o impresión digital." },
      { question: "¿Tenéis vinilos reflectantes para seguridad?", answer: "Sí, disponemos de vinilos certificados para alta visibilidad, ideales para ropa laboral y de seguridad." }
    ]
  },
  "bordado": {
    title: "Bordado Textil",
    description: "Elegancia y distinción. El acabado premium por excelencia.",
    longDescription: "El bordado es la técnica de personalización más elegante y resistente. Consiste en coser hilos de colores directamente sobre la prenda para crear el diseño. Aporta un valor añadido de calidad y profesionalidad, siendo el estándar para uniformes corporativos, gorras y prendas de alta gama.",
    features: [
      "Acabado premium y elegante",
      "Relieve y textura únicos",
      "Durabilidad prácticamente eterna",
      "Hilos de alta resistencia y brillo",
      "Ideal para polos, gorras y chaquetas"
    ],
    image: "/images/servicio-bordados.jpg",
    icon: Layers,
    gallery: [
      "/images/categories/polos.webp",
      "/images/categories/gorras.webp",
      "/images/categories/chaquetas.webp"
    ],
    benefits: [
      { title: "Imagen Profesional", desc: "Transmite seriedad y calidad, elevando la percepción de valor de tu marca o empresa." },
      { title: "Resistencia Superior", desc: "El bordado aguanta lavados a altas temperaturas y el desgaste diario mejor que cualquier tinta." },
      { title: "Tridimensionalidad", desc: "El relieve de los hilos crea un efecto visual y táctil que destaca sobre la prenda." }
    ],
    faqs: [
      { question: "¿Se puede bordar cualquier diseño?", answer: "Casi todos, pero los textos muy pequeños (menos de 5mm) o degradados no se pueden reproducir con hilo. Adaptamos tu logo para que quede perfecto." },
      { question: "¿Tiene coste de picaje?", answer: "Sí, el 'picaje' es la digitalización del logo para que la máquina lo entienda. Es un coste único; si repites pedido, no se vuelve a cobrar." },
      { question: "¿Se puede bordar sobre camisetas finas?", answer: "No lo recomendamos, ya que el bordado tiene peso y puede arrugar o rasgar tejidos muy finos (menos de 160g). Mejor en polos, sudaderas o gorras." },
      { question: "¿Cuántos colores de hilo puedo usar?", answer: "Nuestras máquinas permiten hasta 12-15 colores por diseño, suficiente para la inmensa mayoría de logotipos corporativos." }
    ]
  },
  "transfer": {
    title: "Transfer Textil (DTF)",
    description: "Versatilidad para todo tipo de tejidos y colores.",
    longDescription: "El Transfer Digital (DTF - Direct To Film) es una técnica revolucionaria que imprime el diseño sobre un film especial que luego se transfiere a la prenda con calor. Permite estampar sobre casi cualquier tipo de tejido (algodón, poliéster, nylon) y color, con una elasticidad y resistencia sorprendentes.",
    features: [
      "Apto para cualquier tejido y color",
      "Gran elasticidad (no se cuartea)",
      "Colores vivos y detalles nítidos",
      "Tacto suave y ligero",
      "Resistente a los lavados"
    ],
    image: "/images/servicio-DTF-transfer-textil.jpg",
    icon: Printer,
    gallery: [
      "/images/categories/camisetas.webp",
      "/images/categories/bolsas.webp",
      "/images/categories/gorras.webp"
    ],
    benefits: [
      { title: "Versatilidad Total", desc: "Se puede aplicar en zonas difíciles (mangas, cuellos) y materiales donde otras técnicas fallan." },
      { title: "Elasticidad", desc: "La tinta se estira con la prenda sin romperse, ideal para ropa deportiva o elástica." },
      { title: "Definición", desc: "Permite imprimir letras pequeñas y detalles finos con gran nitidez y limpieza." }
    ],
    faqs: [
      { question: "¿Deja un recuadro de fondo como los transfers antiguos?", answer: "No, el DTF solo transfiere la tinta del diseño, sin fondos ni bordes transparentes indeseados." },
      { question: "¿Es resistente al lavado?", answer: "Sí, aguanta muy bien (hasta 40-50 lavados) si se lava del revés y a temperatura media (30-40ºC)." },
      { question: "¿Se nota mucho al tacto?", answer: "Tiene un tacto muy suave y fino, mucho menos 'plástico' que el vinilo tradicional, integrándose bien con la prenda." },
      { question: "¿Sirve para gorras y mochilas?", answer: "Es perfecto para ello, ya que se adapta a superficies curvas y tejidos rígidos como el poliéster 600D de las mochilas." }
    ]
  }
};

const ServicePage = () => {
  const [match, params] = useRoute("/servicios/:slug");
  const slug = params?.slug;
  const service = slug ? servicesData[slug] : null;

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Servicio no encontrado</h1>
        <p className="text-slate-600 mb-8">Lo sentimos, el servicio que buscas no existe o no está disponible.</p>
        <Link href="/">
          <Button className="bg-blue-600 text-white rounded-full px-8">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <>
      

      {/* Breadcrumbs */}
      <div className="bg-slate-900 pt-4 pb-0">
        <div className="container mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-sm inline-block rounded-lg px-4">
            <Breadcrumbs 
              items={[
                { label: "Servicios", href: "/#servicios" },
                { label: service.title }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={service.image} 
            srcSet={`
              ${service.image.replace('.jpg', '-mobile.webp')} 480w,
              ${service.image.replace('.jpg', '-tablet.webp')} 768w,
              ${service.image.replace('.jpg', '-desktop.webp')} 1200w
            `}
            sizes="100vw"
            alt={service.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-blue-500/30">
              <Icon size={16} />
              Servicio Profesional
            </div>
            <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-6 md:mb-8 leading-relaxed max-w-2xl">
              {service.longDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/presupuesto-rapido">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full font-bold shadow-lg shadow-blue-900/20 w-full sm:w-auto">
                  Solicitar Presupuesto
                </Button>
              </Link>
              <Link href="/contacto">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full font-bold w-full sm:w-auto">
                  Consultar Dudas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Benefits */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
            
            {/* Left Column: Features List */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">Características Principales</h2>
              <ul className="space-y-3 md:space-y-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <div className="mt-1 bg-blue-100 text-blue-600 p-2 rounded-full">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-lg text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Benefits Cards */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">¿Por qué elegir {service.title}?</h2>
              <div className="space-y-6">
                {service.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gallery / Examples */}
      <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Ejemplos de Aplicación</h2>
            <p className="text-slate-500 text-sm md:text-base">Productos ideales para aplicar esta técnica</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {service.gallery.map((img, idx) => (
              <div key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="aspect-square overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={img} 
                    alt={`Ejemplo ${service.title} ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 text-center">
                  <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Ver productos relacionados <ArrowRight className="inline-block ml-1 w-4 h-4" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Preguntas Frecuentes sobre {service.title}</h2>
            <p className="text-slate-500 text-sm md:text-base">Resolvemos tus dudas técnicas antes de empezar.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {service.faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-200">
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-800 hover:text-blue-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-4 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">¿Listo para personalizar tu marca?</h2>
          <p className="text-blue-100 text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto">
            Solicita tu presupuesto sin compromiso. Nuestro equipo te asesorará sobre la mejor técnica para tu proyecto.
          </p>
          <Link href="/presupuesto-rapido">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg rounded-full font-bold shadow-xl transition-transform hover:scale-105 w-full md:w-auto">
              Pedir Presupuesto Ahora
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default ServicePage;
