"use client";
import { Link } from 'wouter';
import { Heart, Trash2, ShoppingBag, Loader2, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useWishlistProductsWithData } from '@/hooks/useWishlistProductsWithData';
import { removeFromWishlist, clearWishlist } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';

type SortOption = 'recent' | 'price-asc' | 'price-desc';

interface ProductWithMetadata {
  id: string;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  stockStatus: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  addedAt: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { products, loading, isEmpty } = useWishlistProductsWithData(100);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.salePrice || a.price);
          const priceB = parseFloat(b.salePrice || b.price);
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.salePrice || a.price);
          const priceB = parseFloat(b.salePrice || b.price);
          return priceB - priceA;
        });
      case 'recent':
      default:
        return sorted.sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
    }
  }, [products, sortBy]);

  const handleRemoveFromFavorites = async (productId: number) => {
    setRemovingId(String(productId));
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Error removiendo favorito:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos tus favoritos?')) {
      return;
    }

    setClearing(true);
    try {
      await clearWishlist();
    } catch (err) {
      console.error('Error limpiando wishlist:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <RequireAuth>
      

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Mis Favoritos</h1>
            </div>
            <p className="text-red-100">
              {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} guardado
              {sortedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          {/* Controles */}
          {!isEmpty && !loading && (
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-slate-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>

              <button
                onClick={handleClearWishlist}
                disabled={clearing}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? 'Limpiando...' : 'Vaciar lista'}
              </button>
            </div>
          )}

          {/* Contenido */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-2">
                No tienes favoritos guardados aún.
              </p>
              <p className="text-slate-500 text-sm mb-4">
                Próximamente podrás ver aquí tus productos favoritos.
              </p>
              <Link href="/ropa-personalizada">
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Explorar Productos
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.slug}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Imagen */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {product.featuredImage?.node?.sourceUrl ? (
                      <img
                        src={product.featuredImage.node.sourceUrl}
                        alt={product.featuredImage.node.altText || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    {product.onSale && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -
                        {Math.round(
                          ((parseFloat(product.regularPrice) -
                            parseFloat(product.salePrice || product.price)) /
                            parseFloat(product.regularPrice)) *
                            100
                        )}
                        %
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-4 flex flex-col h-full">
                    <Link href={`/producto/${product.slug}`}>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors text-sm cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Precios */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-red-600 font-bold text-lg">
                        {product.salePrice || product.price}
                      </span>
                      {product.onSale && (
                        <span className="text-slate-400 line-through text-sm">
                          {product.regularPrice}
                        </span>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/producto/${product.slug}`} className="flex-1">
                        <button className="w-full px-3 py-2 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors text-sm font-medium">
                          Ver
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemoveFromFavorites(parseInt(product.id))}
                        disabled={removingId === product.id}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
