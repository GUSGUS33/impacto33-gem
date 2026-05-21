import Link from "next/link";
import { useMainMenu } from "@/hooks/useMainMenu";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export interface MenuItem {
  title: string;
  href: string;
  items?: { label: string; href: string; image?: { src: string; altText: string } | null }[];
}

export interface MegaMenuSection {
  title: string;
  columns: MenuItem[];
  image?: { src: string; alt: string };
}

/**
 * Determina el número de columnas del grid según la sección.
 * Se basa en el número real de columnas que devuelve WordPress.
 */
function getGridCols(columnCount: number): string {
  if (columnCount <= 2) return "grid-cols-2";
  if (columnCount === 3) return "grid-cols-3";
  if (columnCount === 4) return "grid-cols-4";
  if (columnCount === 5) return "grid-cols-5";
  if (columnCount === 6) return "grid-cols-6";
  if (columnCount >= 7) return "grid-cols-7";
  return "grid-cols-4";
}

/**
 * Detecta si una sección es "Servicios" por su key o URI.
 * Servicios tiene un renderizado especial con imágenes.
 */
function isServiciosSection(key: string): boolean {
  return key === "servicios" || key === "servicios-de-personalizacion-para-empresas";
}

/**
 * Genera el slug para la imagen de un servicio a partir de su URI.
 * Ej: /servicios/serigrafia → serigrafia
 *     /servicios/impresion-dtf → dtf (caso especial)
 */
function getServiceImageSlug(uri: string): string {
  const parts = uri.replace(/^\/|\/$/g, "").split("/");
  const lastPart = parts[parts.length - 1] || "";
  
  // Mapeo de slugs de WP a nombres de archivo de imagen existentes
  const imageMap: Record<string, string> = {
    "impresion-dtf": "dtf",
    "serigrafia": "serigrafia",
    "bordado": "bordado",
    "sublimacion": "sublimacion",
    "impresion-digital": "impresion-digital",
  };
  
  return imageMap[lastPart] || lastPart;
}

/**
 * Descripciones cortas para los servicios (renderizado especial).
 * Se muestran debajo de la imagen y el título.
 */
const serviceDescriptions: Record<string, string> = {
  "impresion-dtf": "Estampación textil digital de alta calidad para cualquier tejido.",
  "serigrafia": "La serigrafía es una técnica de impresión ideal para grandes tiradas.",
  "bordado": "Acabado premium y duradero para ropa corporativa y uniformes.",
  "sublimacion": "Ideal para ropa deportiva y técnica con diseños a todo color.",
  "impresion-digital": "Impresión a todo color sin límites de colores ni degradados.",
};

export function MegaMenu() {
  const { menuSections, loading, error } = useMainMenu();

    // Mientras carga, mostrar los títulos de sección sin dropdown
    if (loading) {
      return (
        <nav className="hidden xl:flex items-center gap-8 font-bold text-[13px] uppercase tracking-wider text-slate-800 h-full">
          {["Ropa Personalizada", "Bolsas y Mochilas", "Tazas y Botellas", "Merchandising", "Servicios"].map((title) => (
            <div key={title} className="relative h-full flex items-center">
              <div className="flex items-center gap-1 py-6 cursor-default text-slate-400 animate-pulse">
                {title} <span className="text-slate-300 text-[10px]">▼</span>
              </div>
            </div>
          ))}
        </nav>
      );
    }
  
    if (error || !menuSections) {
      console.error("MegaMenu Error:", error);
      return (
        <nav className="hidden xl:flex items-center gap-8 font-bold text-[13px] uppercase tracking-wider text-slate-800 h-full">
          <div className="text-red-500 font-normal">Error cargando menú: {error?.message || "Sin datos"}</div>
        </nav>
      );
    }

  return (
    <nav className="hidden xl:flex items-center gap-8 font-bold text-[13px] uppercase tracking-wider text-slate-800 h-full">
      {Object.entries(menuSections).map(([key, section]) => (
        <div
          key={key}
          className="group relative h-full flex items-center"
          style={{ paddingBottom: '20px', marginBottom: '-20px' }}
        >
          {/* Contenedor visual del grupo principal */}
          <div
            className="flex items-center gap-1 py-6 cursor-default group-hover:text-blue-500 transition-colors"
          >
            {section.title} <span className="text-slate-400 text-[10px]">▼</span>
          </div>

          {/* Dropdown Panel - CSS Hover trigger */}
          {section.columns.length > 0 && (
            <div className="absolute left-0 right-[-vw] xl:fixed xl:left-0 xl:right-0 xl:top-[100px] w-full bg-white shadow-xl border-t-4 border-blue-400 z-50 opacity-0 invisible -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
              <div className="container mx-auto px-4 py-8 flex gap-8">
                {/* Columns */}
                <div className={`flex-1 grid ${getGridCols(section.columns.length)} gap-8`}>
                  {section.columns.map((col, idx) => (
                    <div key={idx}>
                      {!isServiciosSection(key) && (
                        <>
                          <Link
                            href={col.href}
                            className="block font-bold text-slate-900 mb-4 hover:text-blue-500 text-xs"
                          >
                            {col.title}
                          </Link>
                          {col.items && (
                            <ul className="space-y-2">
                              {col.items.map((item, i) => (
                                <li key={i}>
                                  <Link
                                    href={item.href}
                                    className="group/item flex items-center gap-3 text-slate-500 hover:text-blue-500 text-[11px] capitalize font-normal py-1"
                                  >
                                    {item.image ? (
                                      <div className="relative w-7 h-7 xl:w-8 xl:h-8 flex-shrink-0 overflow-hidden rounded-full shadow-sm bg-slate-100 group-hover/item:ring-2 group-hover/item:ring-blue-500 transition-all">
                                        <OptimizedImage
                                          src={item.image.src}
                                          alt={item.image.altText || item.label}
                                          fill
                                          containerClassName="w-full h-full"
                                          className="object-cover"
                                          sizes="(max-width: 768px) 28px, 32px"
                                          loading="eager"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 min-w-7 min-h-7 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 text-slate-400 font-medium text-[10px] group-hover/item:bg-blue-50 group-hover/item:text-blue-600 transition-all">
                                        {item.label.substring(0, 1).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="leading-tight">{item.label}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                      {/* Special case for Services with images */}
                      {isServiciosSection(key) ? (
                        <div className="mt-0">
                          <Link
                            href={col.href}
                            className="block mb-3 overflow-hidden rounded-md"
                          >
                            <OptimizedImage
                              src={`/images/services/${getServiceImageSlug(col.href)}.jpg`}
                              alt={col.title}
                              width={300}
                              height={200}
                              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                              loading="eager"
                            />
                          </Link>
                          <Link
                            href={col.href}
                            className="block font-bold text-slate-900 mb-2 hover:text-blue-500 text-sm"
                          >
                            {col.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 normal-case font-normal leading-relaxed">
                            {serviceDescriptions[col.href.replace(/^\/servicios\//, "").replace(/\/$/, "")] || ""}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Featured Image (Right Side) */}
                {section.image && (
                  <div className="w-64 flex-shrink-0">
                    <OptimizedImage
                      src={section.image.src}
                      alt={section.image.alt}
                      width={256}
                      height={256}
                      className="w-full h-auto rounded shadow-sm"
                      loading="eager"
                    />
                    <p className="mt-2 text-center text-blue-500 font-medium text-xs">
                      {section.image.alt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
