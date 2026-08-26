import React, { useState } from 'react';
import { useProduct } from '../hooks/useProduct';
import ProductPricingFlow from '../components/pricing/ProductPricingFlow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DemoPricing() {
  const [slug, setSlug] = useState('camiseta-personalizada-de-manga-larga-100-algodon-gris-vigore');
  const [searchSlug, setSearchSlug] = useState(slug);
  const { product, loading, error } = useProduct(slug);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSlug(searchSlug);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          🛠️ Demo Sistema de Precios
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Esta página demuestra la integración completa del flujo de precios con datos reales de GraphQL.
          Prueba a buscar diferentes productos por su slug.
        </p>
      </div>

      {/* Buscador de Producto */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input 
              value={searchSlug}
              onChange={(e) => setSearchSlug(e.target.value)}
              placeholder="Introduce el slug del producto (ej: camiseta-tecnica-manga-corta)"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar Producto'}
          </Button>
        </form>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="space-y-8">
          <div className="flex gap-8">
            <Skeleton className="w-1/3 aspect-square rounded-xl" />
            <div className="w-2/3 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      )}

      {/* Estado de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <h3 className="font-bold text-lg mb-2">Error al cargar el producto</h3>
          <p>{error.message}</p>
          <p className="text-sm mt-2 opacity-75">Verifica que el slug sea correcto y exista en WooCommerce.</p>
        </div>
      )}

      {/* Visualización del Producto */}
      {!loading && !error && product && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Info Básica */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <img 
                src={product.featuredImage?.node?.sourceUrl || '/placeholder-image.jpg'} 
                alt={product.name}
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900 mb-2">{product.name}</h2>
              <div className="text-blue-600 font-bold text-lg" dangerouslySetInnerHTML={{ __html: product.price || '' }} />
              <div className="mt-4 text-sm text-slate-500">
                <p>ID: {product.id}</p>
                {/* <p>SKU: {product.sku || 'N/A'}</p> */}
                <p>Stock: {product.stockStatus}</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Flujo de Precios */}
          <div className="md:col-span-2">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">
                Simulador de Precios
              </h3>
              <ProductPricingFlow 
                product={product}
                onRequestQuote={(data) => {
                  alert(JSON.stringify(data, null, 2));
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
