import { wpGraphqlFetch } from '@/lib/wpGraphql';
import Image from 'next/image';
import Link from 'next/link';
import { getTransactionalUrl } from '@/lib/slugMap';
import { Star } from 'lucide-react';

const QUERY_PRODUCTDS_BY_CATEGORY = `
  query GetProductsByCategory($slug: String!, $first: Int!) {
    products(first: $first, where: { categoryIn: [$slug] }) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct { price regularPrice onSale }
        ... on VariableProduct { price regularPrice onSale }
        image { sourceUrl altText }
      }
    }
  }
`;

export async function TabProductos({ slugCategoria, cantidad }: { slugCategoria: string, cantidad: number }) {
  if (!slugCategoria) return null;

  try {
    const data = await wpGraphqlFetch<{ products: any }>(
      QUERY_PRODUCTDS_BY_CATEGORY,
      { slug: slugCategoria, first: parseInt(String(cantidad), 10) || 10 },
      3600
    );

    const products = data.products?.nodes || [];
    const transactionalUrl = getTransactionalUrl(slugCategoria);

    if (products.length === 0) {
      return (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 font-medium">No se encontraron productos en esta categoría.</p>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any) => {
            const displayPrice = product.price || product.regularPrice;
            const imageUrl = product.image?.sourceUrl;

            return (
              <div 
                key={product.id} 
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/producto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden block">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <span className="text-xs uppercase font-bold px-2 text-center">Sin imagen</span>
                    </div>
                  )}
                </Link>

                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <Link href={`/producto/${product.slug}`}>
                    <h3 className="font-bold text-sm md:text-base text-slate-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Estrellas de reseña */}
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] md:text-xs text-slate-500 ml-1.5 ml-1">4.9/5</span>
                    </div>
                  </div>

                  <div className="mt-auto grid gap-3">
                    {displayPrice && (
                      <div className="flex items-center text-xs md:text-sm text-slate-500">
                        Desde <span className="text-slate-900 font-bold ml-1 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: displayPrice }} />
                      </div>
                    )}
                    
                    <Link
                      href={`/producto/${product.slug}`}
                      className="inline-flex w-full justify-center items-center rounded-full bg-slate-50 hover:bg-brand text-slate-900 hover:text-white font-bold py-2 md:py-2.5 px-4 transition-colors text-xs md:text-sm"
                    >
                      Personalizar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <Link
            href={transactionalUrl}
            className="inline-flex items-center text-blue-600 font-bold hover:text-brand hover:underline underline-offset-4"
          >
            Ver todos los productos de esta categoría
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching TabProductos:", error);
    return null;
  }
}
