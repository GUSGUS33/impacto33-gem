import { Link } from 'wouter';

interface Category {
  name: string;
  img: string;
  link: string;
  alt: string;
}

interface CategoriesCarouselProps {
  categories?: Category[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export function CategoriesCarousel({
  categories,
  title = "Artículos promocionales y regalos publicitarios personalizados.",
  subtitle = "Descubre nuestro catálogo para empresas y particulares.",
  showHeader = true,
}: CategoriesCarouselProps) {
  // Categorías por defecto (URLs correctas del sitemap)
  const defaultCategories: Category[] = [
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
  ];

  const categoriesToShow = categories || defaultCategories;

  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">
              {title}
            </h2>
            <p className="text-slate-500 text-sm md:text-base">{subtitle}</p>
          </div>
        )}

        {/* Mobile Slider / Desktop Grid */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible snap-x snap-mandatory scrollbar-hide">
            {categoriesToShow.map((cat, idx) => (
              <Link key={idx} href={cat.link}>
                <div className="flex flex-col items-center group cursor-pointer min-w-[140px] snap-center">
                  <div className="w-32 h-32 mb-4 overflow-hidden rounded-full border-4 border-white group-hover:border-blue-500 transition-all duration-300 bg-white">
                    <img
                      src={`/images/${cat.img}`}
                      alt={cat.alt || cat.name}
                      loading="lazy"
                      width="128"
                      height="128"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm md:text-base text-center group-hover:text-blue-600 transition-colors px-2">
                    {cat.name}
                  </h3>
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
  );
}
