"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExternalScripts } from "@/hooks/useExternalScripts";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Newsletter } from "@/components/home/Newsletter";

const HERO_IMAGES = [
  "/images/articulos-promocionales-personalizados-empresa.jpg",
  "/images/banner-img-10.jpg"
];

function HeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {HERO_IMAGES.map((src, index) => {
        // Solo renderizar imagenes secundarias despues de montar
        if (index > 0 && !isMounted) return null;
        return (
          <OptimizedImage 
            key={src}
            src={src}
            alt={`Banner hero promocional ${index + 1}`}
            fill
            priority={index === 0}
            sizes="100vw"
            containerClassName={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
          />
        );
      })}
    </>
  );
}

export default function Home() {
  const scriptsLoaded = useExternalScripts();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirigir a home personalizada si el usuario está logueado
  useEffect(() => {
    if (!loading && user) {
      router.push('/inicio');
    }
  }, [user, loading, router]);

  // Load Elfsight script dynamically
  useEffect(() => {
    if (scriptsLoaded) {
      const script = document.createElement('script');
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.defer = true;
      script.dataset.useServiceCore = "";
      document.body.appendChild(script);
      
      return () => {
        try {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        } catch (e) {
          // ignore error on unmount
        }
      }
    }
  }, [scriptsLoaded]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IMPACTO33",
    "url": "https://impacto33.com",
    "logo": "https://impacto33.com/images/logo-impacto33.png",
    "description": "Artículos promocionales y regalos publicitarios personalizados para empresas.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34690906027",
      "contactType": "customer service",
      "areaServed": "ES",
      "availableLanguage": "Spanish"
    },
    "sameAs": [
      "https://www.facebook.com/impacto33",
      "https://www.instagram.com/impacto33",
      "https://twitter.com/impacto33"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IMPACTO33",
    "url": "https://impacto33.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://impacto33.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
          <HeroSlider />
          <div className="absolute inset-0 bg-black/40 z-10" />
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 leading-tight">
              ¿Te ayudamos a buscar?
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-center mb-8 font-light">
              Tu producto personalizado
            </p>
            
            <div className="w-full max-w-2xl">
              <div className="flex gap-2">
                <Input 
                  placeholder="Buscar..." 
                  className="rounded-full px-6 py-3 text-lg"
                />
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-3">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="bg-white py-8 md:py-10 border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <OptimizedImage src="/images/price-tag.png" alt="Precios" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Precios mayoristas</h3>
                  <p className="text-xs text-slate-500">Directos de fábrica</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <OptimizedImage src="/images/smartphone-ICON.png" alt="Atención" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Atención personalizada</h3>
                  <p className="text-xs text-slate-500">Te asesoramos en todo</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <OptimizedImage src="/images/supermarket.png" alt="Talleres" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Talleres propios</h3>
                  <p className="text-xs text-slate-500">Control de calidad total</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <OptimizedImage src="/images/delivery-truck.png" alt="Entrega" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Entrega rápida</h3>
                  <p className="text-xs text-slate-500">En toda España</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Artículos promocionales y regalos publicitarios personalizados.</h2>
              <p className="text-slate-500 text-sm md:text-base">Descubre nuestro catálogo para empresas y particulares.</p>
            </div>

            {/* Mobile Slider / Desktop Grid */}
            <div className="relative">
              <div className="flex overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible snap-x snap-mandatory scrollbar-hide">
                {[
                  { name: "Camisetas", img: "categoria-camisetas.webp", link: "/camisetas-personalizadas/", alt: "Camisetas personalizadas para empresas y eventos" },
                  { name: "Polos", img: "categoria-polos.webp", link: "/polos-personalizados/", alt: "Polos bordados y serigrafiados para uniformes" },
                  { name: "Sudaderas", img: "categoria-sudaderas.webp", link: "/sudaderas-personalizadas/", alt: "Sudaderas personalizadas con logo corporativo" },
                  { name: "Chaquetas", img: "categoria-chaquetas.webp", link: "/chaquetas-personalizadas/", alt: "Chaquetas y ropa de abrigo personalizada" },
                  { name: "Pantalones", img: "categoria-pantalones.webp", link: "/pantalones-personalizados/", alt: "Pantalones personalizados para uniformes" },
                  { name: "Monos", img: "categoria-monos.webp", link: "/monos-personalizados/", alt: "Monos personalizados para trabajo" },
                  
                  { name: "Vestuario laboral", img: "categoria-ropa-vestuario-laboral.webp", link: "/vestuario-laboral/", alt: "Vestuario laboral y uniformes de trabajo personalizados" },
                  { name: "Mochilas", img: "categoria-mochilas.webp", link: "/mochilas-personalizadas/", alt: "Mochilas personalizadas para empresas" },
                  { name: "Bolsas", img: "categoria-bolsas.webp", link: "/bolsas-personalizadas/", alt: "Bolsas de tela y tote bags personalizadas para ferias" },
                  { name: "Accesorios de viaje", img: "categoria-accesorios-viaje.webp", link: "/accesorios-viaje/", alt: "Accesorios de viaje personalizados" },
                  { name: "Papelería", img: "categoria-libretas.webp", link: "/papeleria-personalizada/", alt: "Papelería personalizada corporativa" },
                  { name: "Escritura", img: "categoria-libretas.webp", link: "/escritura-personalizada/", alt: "Artículos de escritura personalizados" },
                  
                  { name: "Tecnología", img: "categoria-memorias-usb.webp", link: "/tecnologia-personalizada/", alt: "Tecnología personalizada: memorias USB, power banks" },
                  { name: "Hogar", img: "categoria-tazas.webp", link: "/hogar-personalizado/", alt: "Artículos para el hogar personalizados" },
                  { name: "Merchandising eventos", img: "categoria-articulos-para-fiestas.webp", link: "/merchandising-eventos/", alt: "Merchandising personalizado para eventos" },
                  { name: "Verano", img: "categoria-verano.webp", link: "/verano-personalizado/", alt: "Artículos de verano personalizados" },
                  { name: "Mascotas", img: "categoria-mascotas.webp", link: "/mascotas-personalizadas/", alt: "Artículos para mascotas personalizados" },
                  { name: "Deporte", img: "categoria-camisetas-tecnicas.webp", link: "/deporte-personalizado/", alt: "Artículos deportivos personalizados" },
                ].map((cat, idx) => (
                  <Link key={idx} href={cat.link}>
                    <div className="flex flex-col items-center group cursor-pointer min-w-[140px] snap-center">
                      <div className="w-32 h-32 mb-4 overflow-hidden rounded-full border-4 border-white group-hover:border-blue-500 transition-all duration-300 bg-white">
                        <OptimizedImage 
                          src={`/images/${cat.img}`} 
                          alt={cat.alt || cat.name} 
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <h3 className="font-bold text-slate-700 text-sm md:text-base text-center group-hover:text-blue-600 transition-colors px-2">{cat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Mobile Scroll Hint */}
              <div className="md:hidden text-center text-slate-400 text-xs mt-2 animate-pulse">
                Desliza para ver más &rarr;
              </div>
            </div>
          </div>
        </section>

        {/* Diferénciate Section */}
        <section className="py-12 md:py-16 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-600 mb-4 md:mb-6 leading-tight">
                  Diferénciate con <br/>
                  <span className="text-blue-500">Regalos personalizados</span> <br/>
                  únicos.
                </h2>
                <p className="text-slate-500 mb-6 md:mb-8 text-lg md:text-xl font-light">
                  El mejor marketing para tu empresa.
                </p>
                <Link href="/presupuesto-rapido">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-6 text-sm font-semibold tracking-wide w-full md:w-auto uppercase">
                    <span>COMENZAR AHORA</span>
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2 relative">
                 <OptimizedImage 
                   src="/images/regalos-personalizados-originales-para-empresas.jpg" 
                   alt="Regalos únicos" 
                   width={600}
                   height={600}
                   className="w-full h-auto object-contain"
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#48475c] mb-6 text-center">
            Opiniones de nuestros clientes
          </h2>
          {scriptsLoaded && <div className="elfsight-app-002cb98a-9032-4065-ae41-780f662588ea" />}
        </section>

        {/* Services Section - Hidden as requested */}
        <section className="py-16 bg-white hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Nuestros Servicios de Impresión</h2>
              <p className="text-slate-500">Tecnología punta para resultados perfectos.</p>
            </div>
          </div>
        </section>

        {/* Newsletter Section con Brevo y 10% Dto */}
        <Newsletter />
      </main>
    </>
  );
}
