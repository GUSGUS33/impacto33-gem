'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PackageSearch, Tag, X, Sparkles, Filter, Loader2 } from 'lucide-react';

interface SearchFilterBarProps {
  initialQuery: string;
  initialCategory?: string;
  initialBudget?: string;
  totalResults: number;
}

export function SearchFilterBar({
  initialQuery,
  initialCategory = '',
  initialBudget = '',
  totalResults,
}: SearchFilterBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [budget, setBudget] = useState(initialBudget);

  const applyFilters = (newQ: string, newCat: string, newBud: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set('q', newQ.trim());
      if (newCat) params.set('category', newCat);
      if (newBud) params.set('budget', newBud);
      router.push(`/busqueda?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, category, budget);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    applyFilters(query, newCat, budget);
  };

  const handleBudgetChange = (newBud: string) => {
    setBudget(newBud);
    applyFilters(query, category, newBud);
  };

  const clearCategory = () => {
    setCategory('');
    applyFilters(query, '', budget);
  };

  const clearBudget = () => {
    setBudget('');
    applyFilters(query, category, '');
  };

  const clearAll = () => {
    setCategory('');
    setBudget('');
    applyFilters(query, '', '');
  };

  const popularSuggestions = [
    'Camisetas',
    'Polos',
    'Sudaderas',
    'Bolsas de tela',
    'Botellas',
    'Tazas',
    'Mochilas',
    'Gorras',
    'USB',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-8">
      {/* Formulario Principal de Búsqueda */}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Input Text */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por producto, palabra clave o referencia..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categoría Selector */}
        <div className="relative md:w-56 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <PackageSearch className="w-4 h-4" />
          </div>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none cursor-pointer transition-all"
          >
            <option value="">Todas las categorías</option>
            <option value="ropa">Ropa Personalizada</option>
            <option value="bolsas">Bolsas y Mochilas</option>
            <option value="hogar">Tazas y Botellas</option>
            <option value="tecnologia">Tecnología y USB</option>
            <option value="oficina">Material de Oficina</option>
            <option value="eco">Ecológicos y Sostenibles</option>
          </select>
        </div>

        {/* Presupuesto Selector */}
        <div className="relative md:w-48 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Tag className="w-4 h-4" />
          </div>
          <select
            value={budget}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none cursor-pointer transition-all"
          >
            <option value="">Cualquier precio</option>
            <option value="low">Menos de 1€ / ud</option>
            <option value="mid">1€ - 5€ / ud</option>
            <option value="high">Más de 5€ / ud</option>
          </select>
        </div>

        {/* Botón Buscar */}
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm shrink-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{isPending ? 'Buscando' : 'Buscar'}</span>
        </button>
      </form>

      {/* Filtros activos & Sugerencias */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {/* Pills de filtros aplicados */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtros:
          </span>

          {category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              Categoría: {category === 'ropa' ? 'Ropa Personalizada' : category === 'bolsas' ? 'Bolsas y Mochilas' : category === 'hogar' ? 'Tazas y Botellas' : category === 'tecnologia' ? 'Tecnología' : category === 'oficina' ? 'Oficina' : 'Ecológicos'}
              <button type="button" onClick={clearCategory} className="hover:text-blue-900 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {budget && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Precio: {budget === 'low' ? '< 1€' : budget === 'mid' ? '1€ - 5€' : '> 5€'}
              <button type="button" onClick={clearBudget} className="hover:text-emerald-900 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {!category && !budget && (
            <span className="text-xs text-slate-400 italic">Ningún filtro adicional aplicado</span>
          )}

          {(category || budget) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 ml-1"
            >
              Borrar filtros
            </button>
          )}
        </div>

        {/* Sugerencias Rápidas */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium shrink-0">Popular:</span>
          {popularSuggestions.slice(0, 5).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                applyFilters(term, category, budget);
              }}
              className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
