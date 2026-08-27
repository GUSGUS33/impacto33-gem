import { wpGraphqlFetch } from '@/lib/wpGraphql';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Search, AlertCircle, ShoppingBag } from 'lucide-react';
import { generateSeoMetadata } from '@/lib/seo';
import { SearchFilterBar } from './SearchFilterBar';

export const metadata = generateSeoMetadata({
  title: 'Búsqueda de productos | Impacto33',
  description: 'Encuentra los mejores artículos promocionales y ropa personalizada al mejor precio.',
  noIndex: true,
});

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($search: String!, $first: Int!) {
    products(first: $first, where: { search: $search }) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          onSale
          productCategories(first: 10) {
            nodes {
              slug
              name
            }
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          onSale
          productCategories(first: 10) {
            nodes {
              slug
              name
            }
          }
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

/**
 * Valida si las categorías de un producto coinciden con el filtro de categoría seleccionado
 */
function matchCategory(
  productCategories: Array<{ slug: string; name: string }> | undefined,
  categoryFilter?: string
): boolean {
  if (!categoryFilter) return true;
  if (!productCategories || productCategories.length === 0) return true;

  const filter = categoryFilter.toLowerCase().trim();

  // Palabras clave asociadas a cada grupo principal
  const clothingKeywords = [
    'ropa', 'textil', 'camiseta', 't_shirt', 'cam_', 'cam', 'polo',
    'sudadera', 'hoodie', 'chaqueta', 'coat', 'jacket', 'pantal',
    'chalec', 'sport', 'deport', 'laboral', 'horeca', 'sanitary',
    'foodindustry', 'basic', 'chnd', 'bdr', 'windbreak', 'raincoat',
    'neckwarmer', 'equip', 'industry', 'highviz', 'sp_tshi', 'cat',
    'serviciostshirts', 'cam_w', 'cam_po', 'cam_sp', 'outlet'
  ];

  const bagsKeywords = [
    'bolsa', 'bag', 'mochila', 'backpack', 'travel', 'viaje', 'nevera',
    'cooler', 'waterproof', 'estanca', 'malet', 'sub_bags', 'bags_coolers',
    'bags_travel', 'summer_cooler_bags'
  ];

  const cupsKeywords = [
    'taza', 'mug', 'botella', 'bottle', 'termo', 'thermos', 'bidon',
    'flask', 'cristal', 'cup_warmer', 'hogar', 'kitchen', 'cocina',
    'bottles_thermos_flas', 'sports_bottles', 'glass_bottles'
  ];

  const techKeywords = [
    'tech', 'tecnologia', 'audio', 'sound', 'speaker', 'altavoz',
    'auricular', 'earphone', 'headphone', 'charg', 'cargador', 'cables',
    'wireless', 'usb', 'powerbank', 'wireless_charger', 'charging_cables'
  ];

  const officeKeywords = [
    'oficina', 'office', 'boligrafo', 'ball_pen', 'pen', 'notebook',
    'bloc', 'agenda', 'diary', 'calendar', 'mouse_pad', 'alfombrilla',
    'conferences_fairs'
  ];

  const ecoKeywords = [
    'eco', 'ecologic', 'bambu', 'bamboo', 'madera', 'wood', 'recicla',
    'organic', 'sostenib', 'bol-mad'
  ];

  let targetKeywords = [filter];
  if (filter === 'ropa') targetKeywords = clothingKeywords;
  else if (filter === 'bolsas') targetKeywords = bagsKeywords;
  else if (filter === 'hogar' || filter === 'tazas' || filter === 'botellas') targetKeywords = cupsKeywords;
  else if (filter === 'tecnologia') targetKeywords = techKeywords;
  else if (filter === 'oficina') targetKeywords = officeKeywords;
  else if (filter === 'eco') targetKeywords = ecoKeywords;

  return productCategories.some((cat) => {
    const s = (cat.slug || '').toLowerCase();
    const n = (cat.name || '').toLowerCase();
    return targetKeywords.some((kw) => s.includes(kw) || n.includes(kw));
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; budget?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = (resolvedSearchParams.q || '').trim();
  const categoryStr = resolvedSearchParams.category;
  const budgetStr = resolvedSearchParams.budget;

  let products: any[] = [];
  let error = null;

  if (searchTerm) {
    try {
      const data = await wpGraphqlFetch<{ products: { nodes: any[] } }>(
        SEARCH_PRODUCTS_QUERY,
        { search: searchTerm, first: 60 },
        60 // ISR de 60 segundos
      );
      const rawProducts = data?.products?.nodes || [];

      // Filtrado por categoría inteligente
      products = rawProducts.filter((p) =>
        matchCategory(p.productCategories?.nodes, categoryStr)
      );

      // Filtrado por presupuesto
      if (budgetStr) {
        products = products.filter((p) => {
          const rawPrice = p.price;
          if (!rawPrice) return true;
          const priceValue = parseFloat(
            rawPrice.replace(/[^0-9,-]+/g, '').replace(',', '.')
          );
          if (isNaN(priceValue)) return true;

          if (budgetStr === 'low') return priceValue < 1;
          if (budgetStr === 'mid') return priceValue >= 1 && priceValue <= 5;
          if (budgetStr === 'high') return priceValue > 5;
          return true;
        });
      }
    } catch (e: any) {
      console.error('Search error:', e);
      error = 'Tuvimos un problema al realizar la búsqueda en el catálogo. Por favor inténtalo de nuevo.';
    }
  }

  const suggestedQueries = [
    'Camiseta de manga corta',
    'Camiseta deportiva',
    'Polos técnicos',
    'Bolsas de algodón',
    'Botellas de acero',
    'Tazas personalizadas',
    'Mochilas con cordón',
    'Sudaderas con capucha',
  ];

  return (
    <main className="min-h-screen bg-slate-50 border-t border-slate-200 lg:border-t-0 py-6 md:py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado y Barra de Filtros */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {searchTerm ? `Resultados para "${searchTerm}"` : 'Búsqueda de Productos'}
              </h1>
              {searchTerm && !error && (
                <p className="text-slate-500 text-sm font-medium">
                  {products.length === 1
                    ? '1 producto encontrado'
                    : `${products.length} productos encontrados`}
                  {categoryStr ? ` en ${categoryStr === 'ropa' ? 'Ropa Personalizada' : categoryStr === 'bolsas' ? 'Bolsas y Mochilas' : categoryStr === 'hogar' ? 'Tazas y Botellas' : categoryStr === 'tecnologia' ? 'Tecnología' : categoryStr === 'oficina' ? 'Oficina' : 'Ecológicos'}` : ''}
                  {budgetStr ? ` con el filtro de precio seleccionado` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buscador Interactivo y Filtros */}
        <SearchFilterBar
          initialQuery={searchTerm}
          initialCategory={categoryStr}
          initialBudget={budgetStr}
          totalResults={products.length}
        />

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl flex items-center gap-3 mb-8 border border-red-200/70">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Estado: Sin término de búsqueda ingresado */}
        {!searchTerm && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">¿Qué estás buscando?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Escribe el nombre de un artículo (como camisetas, botellas, bolsas o tazas) para explorar el catálogo completo con precios y personalización.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQueries.map((term) => (
                <Link
                  key={term}
                  href={`/busqueda?q=${encodeURIComponent(term)}`}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition-all"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Estado: Sin resultados encontrados */}
        {searchTerm && products.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 md:p-14 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
              <Search className="w-9 h-9" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              No hemos encontrado coincidencias para &quot;{searchTerm}&quot;
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Comprueba que no haya errores de escritura o intenta buscar con términos más generales.
            </p>

            {/* Sugerencias populares */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Búsquedas populares sugeridas:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((term) => (
                  <Link
                    key={term}
                    href={`/busqueda?q=${encodeURIComponent(term)}`}
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 text-xs font-medium transition-all"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Link
                href="/ropa-personalizada"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-sm"
              >
                Ver Ropa Personalizada
              </Link>
              <Link
                href="/"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all text-sm"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}

        {/* Grid de Productos Encontrados */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => {
              const productUrl = `/producto/${product.slug}`;
              let displayPriceStr = product.price || '';
              const cleanPrice = displayPriceStr
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();

              const categoryName = product.productCategories?.nodes?.[0]?.name || null;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                >
                  <Link
                    href={productUrl}
                    className="relative aspect-[4/5] overflow-hidden block bg-slate-50"
                  >
                    {product.image?.sourceUrl ? (
                      <Image
                        src={product.image.sourceUrl}
                        alt={product.image.altText || product.name}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <span className="text-xs uppercase font-bold px-2 text-center">
                          Sin imagen
                        </span>
                      </div>
                    )}

                    {categoryName && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          {categoryName}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4 md:p-5 flex flex-col flex-1 bg-white">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Calificación */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-[10px] md:text-xs text-slate-500 ml-1.5 font-medium">
                        4.9
                      </span>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
                      {cleanPrice ? (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Desde
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm md:text-base">
                            {cleanPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Consultar</span>
                      )}

                      <Link
                        href={productUrl}
                        className="py-2 px-3.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
