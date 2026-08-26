import { wpGraphqlFetch } from '@/lib/wpGraphql';
import Image from 'next/image';
import Link from 'next/link';
import { getTransactionalUrl } from '@/lib/slugMap';
import { Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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

export async function ProductosDestacados({ data }: { data: any }) {
  const { titulo, subtitulo, modo, slugCategoria, cantidad, mostrarPrecio } = data;
  
  if (!slugCategoria) return null;

  try {
    const res = await wpGraphqlFetch<{ products: any }>(
      QUERY_PRODUCTDS_BY_CATEGORY,
      { slug: slugCategoria, first: parseInt(cantidad as string, 10) || 10 },
      3600
    );

    const products = res.products?.nodes || [];
    const transactionalUrl = getTransactionalUrl(slugCategoria);

    if (products.length === 0) return null;

    return (
      <section className="py-12 md:py-16 lg:py-[100px] bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          {(titulo || subtitulo) && (
            <div className="text-center mb-10">
              {titulo && <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{titulo}</h2>}
              {subtitulo && <p className="text-slate-500 max-w-2xl mx-auto">{subtitulo}</p>}
            </div>
          )}

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
                      {mostrarPrecio !== false && displayPrice && (
                        <div className="flex items-center text-xs md:text-sm text-slate-500">
                          Desde <span className="text-slate-900 font-bold ml-1 text-sm md:text-base">{formatPrice(displayPrice)}</span>
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

          <div className="mt-12 text-center">
            <Link
              href={transactionalUrl}
              className="inline-flex bg-blue-600 hover:bg-brand text-white font-bold py-3.5 px-8 rounded-full transition-colors shadow-md hover:shadow-lg hover:scale-105"
            >
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching ProductosDestacados:", error);
    return null;
  }
}
