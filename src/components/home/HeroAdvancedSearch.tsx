'use client';

import { useState, useTransition } from 'react';
import { Search, ChevronDown, Tag, PackageSearch, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroAdvancedSearch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('q', searchTerm);
      if (category) params.set('category', category);
      if (budget) params.set('budget', budget);
      
      router.push(`/busqueda?${params.toString()}`);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-2xl p-2 md:p-3 relative z-30 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
        
        {/* Input Text */}
        <div className="relative flex-1 w-full flex items-center border-b md:border-b-0 md:border-r border-slate-200 px-4 py-2 md:py-0 group">
          <Search className="w-5 h-5 text-blue-600 transition-transform group-focus-within:scale-110 shrink-0" />
          <div className="ml-3 flex-1">
            <label htmlFor="hero-search" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Producto
            </label>
            <input
              id="hero-search"
              type="text"
              placeholder="Ej: camisetas, tazas, usb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none text-sm md:text-base truncates"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="relative flex-1 w-full flex items-center border-b md:border-b-0 md:border-r border-slate-200 px-4 py-2 md:py-0 group cursor-pointer hover:bg-slate-50/50 rounded-lg md:rounded-none transition-colors">
          <PackageSearch className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="ml-3 flex-1 relative">
            <label htmlFor="hero-category" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Categoría
            </label>
            <select
              id="hero-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-medium focus:outline-none text-sm md:text-base appearance-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              <option value="ropa">Ropa Personalizada</option>
              <option value="bolsas">Bolsas y Mochilas</option>
              <option value="hogar">Tazas y Botellas</option>
              <option value="tecnologia">Tecnología y USB</option>
              <option value="oficina">Material de Oficina</option>
              <option value="eco">Ecológicos y Sostenibles</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Presupuesto */}
        <div className="relative flex-1 w-full flex items-center px-4 py-2 md:py-0 group cursor-pointer hover:bg-slate-50/50 rounded-lg md:rounded-none transition-colors">
          <Tag className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="ml-3 flex-1 relative">
            <label htmlFor="hero-budget" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Presupuesto
            </label>
            <select
              id="hero-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-medium focus:outline-none text-sm md:text-base appearance-none cursor-pointer"
            >
              <option value="">Cualquier precio</option>
              <option value="low">Menos de 1€ / ud</option>
              <option value="mid">1€ - 5€ / ud</option>
              <option value="high">Más de 5€ / ud</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Botón Buscar */}
        <div className="w-full md:w-auto px-2 pb-2 md:pb-0 md:pr-2 pt-2 md:pt-0 shrink-0">
          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5 hidden md:block" />
            )}
            <span>{isPending ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
