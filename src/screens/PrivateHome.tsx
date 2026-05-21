'use client';

import Link from 'next/link';
import { Clock, Search, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViewedProductsWithData } from '@/hooks/useViewedProductsWithData';
import { useWishlistProductsWithData } from '@/hooks/useWishlistProductsWithData';
import { useProfileOnboarding } from '@/hooks/useProfileOnboarding';
import { ProfileOnboarding } from '@/components/ProfileOnboarding';
import { CategoriesCarousel } from '@/components/CategoriesCarousel';
import { FavoriteButton } from '@/components/FavoriteButton';
import Image from 'next/image';

/**
 * Componente reutilizable para tarjeta de producto
 */
function ProductCard({
  product,
  href,
}: {
  product: any;
  href: string;
}) {
  const price = product.salePrice || product.price;
  const regularPrice = product.regularPrice;
  const showDiscount = product.onSale && regularPrice && price !== regularPrice;

  return (
    <Link href={href} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full">
      <div className="bg-white hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
        {/* Imagen */}
        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden block">
          {product.featuredImage?.node?.sourceUrl ? (
            <Image
              src={product.featuredImage.node.sourceUrl}
              alt={product.featuredImage.node.altText || product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
              <span className="text-xs uppercase font-bold px-2 text-center text-slate-300">Sin imagen</span>
            </div>
          )}
          {showDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
              -
              {Math.round(
                ((parseFloat(regularPrice) - parseFloat(price)) /
                  parseFloat(regularPrice)) *
                  100
              )}
              %
            </div>
          )}
          {/* Botón de favorito */}
          <div className="absolute top-2 left-2 z-10 opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
            <FavoriteButton
              productId={parseInt(product.id)}
              productSlug={product.slug}
              size="sm"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-xs md:text-sm">
              {product.name}
            </h3>
          </div>

          {/* Precios */}
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">
              {price}
            </span>
            {showDiscount && (
              <span className="text-slate-400 line-through text-sm">
                {regularPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PrivateHome() {
  const { user } = useAuth();
  const {
    products: viewedProducts,
    loading: loadingViewed,
    isEmpty: viewedEmpty,
  } = useViewedProductsWithData(8);
  const {
    products: wishlistProducts,
    loading: loadingWishlist,
    isEmpty: wishlistEmpty,
  } = useWishlistProductsWithData(8);
  const {
    isCompleted: onboardingCompleted,
    loading: onboardingLoading,
    saving: onboardingSaving,
    saveOnboarding,
    skipOnboarding,
  } = useProfileOnboarding();

  return (
    <>
      

      <div className="min-h-screen bg-slate-50">
        {/* Header de bienvenida */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              ¡Hola, {user?.email?.split('@')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Bienvenido de nuevo a tu panel personalizado
            </p>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          {/* Bloque de Onboarding de Perfil */}
          {!onboardingCompleted && !onboardingLoading && (
            <>
              <ProfileOnboarding
                onSave={saveOnboarding}
                onSkip={skipOnboarding}
                saving={onboardingSaving}
              />
              {/* Categorías debajo del onboarding */}
              <CategoriesCarousel showHeader={false} />
            </>
          )}
          {/* Bloque 1: Retoma donde lo dejaste */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                Retoma donde lo dejaste
              </h2>
            </div>

            {loadingViewed ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : viewedEmpty ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-4">
                  Aún no has visitado productos. ¡Explora nuestro catálogo!
                </p>
                <Link href="/ropa-personalizada">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Catálogo
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {viewedProducts.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    href={`/producto/${product.slug}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Bloque 2: Tus favoritos */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                Tus favoritos
              </h2>
            </div>

            {loadingWishlist ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : wishlistEmpty ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-4">
                  No tienes favoritos guardados aún.
                </p>
                <Link href="/ropa-personalizada">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Explorar Productos
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    href={`/producto/${product.slug}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Bloque 3: Búsquedas recientes */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                Búsquedas recientes
              </h2>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">
                Próximamente: Aquí aparecerán tus búsquedas recientes.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
