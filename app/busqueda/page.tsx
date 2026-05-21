import { wpGraphqlFetch } from '@/lib/wpGraphql';
import { getTransactionalUrl } from '@/lib/slugMap';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Search, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { generateSeoMetadata } from '@/lib/seo';

export const metadata = generateSeoMetadata({
  title: 'Búsqueda de productos',
  description: 'Encuentra los mejores artículos promocionales y regalos de empresa.',
});

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($search: String!, $first: Int!) {
    products(first: $first, where: { search: $search }) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct { price regularPrice onSale productCategories(first: 2) { nodes { slug name } } }
        ... on VariableProduct { price regularPrice onSale productCategories(first: 2) { nodes { slug name } } }
        image { sourceUrl altText }
      }
    }
  }
`;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; budget?: string }
}) {
  const searchTerm = searchParams.q || '';
  const categoryStr = searchParams.category;
  const budgetStr = searchParams.budget;

  let products = [];
  let error = null;

  if (searchTerm) {
    try {
      const data = await wpGraphqlFetch<{ products: { nodes: any[] } }>(
        SEARCH_PRODUCTS_QUERY,
        { search: searchTerm, first: 40 },
        60 // Caché de 60 segundos para mejorar rendimiento
      );
      products = data?.products?.nodes || [];
      
      // Basic client-side filtering if category/budget are present
      if (categoryStr) {
        products = products.filter(p => 
          p.productCategories?.nodes?.some((c: any) => 
            c.slug.toLowerCase().includes(categoryStr.toLowerCase()) || 
            c.name.toLowerCase().includes(categoryStr.toLowerCase())
          )
        );
      }
      
      if (budgetStr) {
        products = products.filter(p => {
          const rawPrice = p.price;
          if (!rawPrice) return true; // Keep products without explicit price
          const priceValue = parseFloat(rawPrice.replace(/[^0-9,-]+/g,"").replace(",", "."));
          if (isNaN(priceValue)) return true;

          if (budgetStr === 'low') return priceValue < 1;
          if (budgetStr === 'mid') return priceValue >= 1 && priceValue <= 5;
          if (budgetStr === 'high') return priceValue > 5;
          return true;
        });
      }

    } catch (e: any) {
      console.error('Search error:', e);
      error = "Tuvimos un problema realizando la búsqueda. " + (e.message || JSON.stringify(e));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 border-t border-slate-200 lg:border-t-0 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Búsqueda Avanzada'}
            </h1>
          </div>
          {searchTerm && (
            <p className="text-slate-500 font-medium ml-14">
              Hemos encontrado {products.length} producto{products.length !== 1 ? 's' : ''}
              {categoryStr ? ` en la categoría filtrada` : ''}
              {budgetStr ? ` con el presupuesto seleccionado` : ''}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {!searchTerm && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">Busca productos</h2>
            <p className="text-slate-500">Utiliza el buscador en la página principal para encontrar artículos.</p>
          </div>
        )}

        {searchTerm && products.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
              No hemos encontrado nada para "{searchTerm}"
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Intenta utilizar términos más generales, o comprueba si hay errores de ortografía.
            </p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
              Volver al inicio
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => {
              const productUrl = `/producto/${product.slug}`;
              // Try to grab a display price
              let displayPriceStr = product.price || '';
              const cleanPrice = displayPriceStr
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();

              return (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                  <Link href={productUrl} className="relative aspect-[4/5] overflow-hidden block bg-slate-50">
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
                        <span className="text-xs uppercase font-bold px-2 text-center">Sin imagen</span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-4 md:p-5 flex flex-col flex-1 bg-white">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Estrellas */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] md:text-xs text-slate-500 ml-1.5 font-medium">4.9</span>
                    </div>

                    <div className="mt-auto">
                      {cleanPrice && (
                        <div className="text-xs text-slate-500 mb-3">
                          Desde <span className="font-extrabold text-slate-900 text-sm md:text-base">{cleanPrice}</span>
                        </div>
                      )}
                      
                      <Link
                        href={productUrl}
                        className="block w-full py-2.5 px-4 text-center text-sm font-bold bg-slate-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      >
                        Ver detalles
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
