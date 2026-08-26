"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Filter,
  Layers,
  HelpCircle,
  FileText
} from "lucide-react";
import { PENINSULAR_PROVINCES, getProvincesByCommunity, Provincia } from "@/data/provincias";

export default function ProvinciasHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("TODAS");
  const [viewMode, setViewMode] = useState<"community" | "alphabetical">("community");

  const groupedByCommunity = useMemo(() => getProvincesByCommunity(), []);
  const communitiesList = useMemo(() => Object.keys(groupedByCommunity).sort(), [groupedByCommunity]);

  // Filtered provinces based on search query and community filter
  const filteredProvinces = useMemo(() => {
    return PENINSULAR_PROVINCES.filter((prov) => {
      const matchesQuery = 
        prov.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        prov.community.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (prov.capital && prov.capital.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      
      const matchesCommunity = 
        selectedCommunity === "TODAS" || prov.community === selectedCommunity;

      return matchesQuery && matchesCommunity;
    });
  }, [searchQuery, selectedCommunity]);

  // Alphabetical list sorted by name
  const sortedAlphabetically = useMemo(() => {
    return [...filteredProvinces].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [filteredProvinces]);

  // Group filtered provinces by community for the community view
  const filteredGroupedByCommunity = useMemo(() => {
    const res: Record<string, Provincia[]> = {};
    for (const prov of filteredProvinces) {
      if (!res[prov.community]) {
        res[prov.community] = [];
      }
      res[prov.community].push(prov);
    }
    return res;
  }, [filteredProvinces]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Provincias</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Truck size={16} /> Envíos directos a toda la Península Ibérica
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ropa Personalizada y Regalos Publicitarios por Provincias
          </h1>
          
          <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            Servicio profesional de serigrafía, bordado, DTF y merchandising para empresas, eventos y particulares. 
            Selecciona tu provincia para descubrir servicios locales y solicitar un presupuesto rápido.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2 border border-slate-200 text-slate-900">
            <div className="pl-3 text-slate-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Buscar provincia (ej. Barcelona, Madrid, Sevilla, Valencia...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-2 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none text-sm md:text-base font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded-md transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto text-left">
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Cobertura</p>
                <p className="text-sm font-bold text-white">47 Provincias Peninsulares</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Plazos rápidos</p>
                <p className="text-sm font-bold text-white">Envíos 24 - 48 h</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Taller Propio</p>
                <p className="text-sm font-bold text-white">Calidad Garantizada</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Precios</p>
                <p className="text-sm font-bold text-white">Directo de Fábrica</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Explorer */}
      <section className="container mx-auto px-4 md:px-6 py-10">
        {/* Controls: View Mode & Community Filter */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200/80 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} /> Filtro Comunidad:
            </span>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 text-xs md:text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas las Comunidades ({PENINSULAR_PROVINCES.length})</option>
              {communitiesList.map((comm) => (
                <option key={comm} value={comm}>
                  {comm} ({groupedByCommunity[comm]?.length})
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
            <button
              onClick={() => setViewMode("community")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "community"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={14} />
              Por Comunidades
            </button>
            <button
              onClick={() => setViewMode("alphabetical")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "alphabetical"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 size={14} />
              Orden Alfabético (A-Z)
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-600 font-medium">
            Mostrando <strong className="text-slate-900 font-bold">{filteredProvinces.length}</strong> provincias peninsulares
            {selectedCommunity !== "TODAS" && ` en ${selectedCommunity}`}
            {searchQuery && ` para "${searchQuery}"`}
          </p>
        </div>

        {/* Empty state */}
        {filteredProvinces.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron provincias</h3>
            <p className="text-sm text-slate-500 mb-4">
              Intenta buscar con otro término de búsqueda o limpia los filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCommunity("TODAS");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

        {/* View MODE 1: Grouped by Community */}
        {viewMode === "community" && filteredProvinces.length > 0 && (
          <div className="space-y-10">
            {Object.entries(filteredGroupedByCommunity).map(([commName, list]) => (
              <div key={commName} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                    {commName}
                  </h2>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {list.length} {list.length === 1 ? 'provincia' : 'provincias'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {list.map((prov) => (
                    <Link
                      key={prov.slug}
                      href={`/${prov.slug}/`}
                      className="group bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                            {prov.name}
                          </h3>
                          <MapPin size={16} className="text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
                        </div>
                        {prov.capital && (
                          <p className="text-xs text-slate-500 mb-3">
                            Capital: <span className="font-medium text-slate-700">{prov.capital}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Ver servicios</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View MODE 2: Alphabetical Grid (A-Z) */}
        {viewMode === "alphabetical" && filteredProvinces.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedAlphabetically.map((prov) => (
                <Link
                  key={prov.slug}
                  href={`/${prov.slug}/`}
                  className="group bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                        {prov.name}
                      </h3>
                      <MapPin size={16} className="text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
                    </div>
                    <span className="inline-block bg-slate-200/70 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded mb-3">
                      {prov.community}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    <span>Ver en {prov.name}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Value Proposition / Services Info */}
      <section className="container mx-auto px-4 md:px-6 py-10">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-800">
          <div className="max-w-3xl mb-10">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 block">
              Servicio Integral de Personalización
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Taller de Serigrafía, Bordado y Regalos Publicitarios con Servicio Peninsular
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              En IMPACTO33 contamos con taller propio especializado en marcaje textil y artículos promocionales. 
              Suministramos a pequeñas y grandes empresas, agencias de eventos, clubes deportivos y colectivos de toda España peninsular.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-200">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <CheckCircle2 className="text-blue-400 mb-3" size={28} />
              <h3 className="font-bold text-white text-lg mb-2">Impresión Textil Avanzada</h3>
              <p className="text-xs md:text-sm text-slate-300">
                Serigrafía tradicional, DTF a todo color, bordado industrial de alta definición y sublimación para ropa laboral y deportiva.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <Truck className="text-emerald-400 mb-3" size={28} />
              <h3 className="font-bold text-white text-lg mb-2">Envíos Rápidos en Península</h3>
              <p className="text-xs md:text-sm text-slate-300">
                Logística optimizada con entregas en 24h/48h a cualquier punto de la península tras finalizar el proceso de producción.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <FileText className="text-purple-400 mb-3" size={28} />
              <h3 className="font-bold text-white text-lg mb-2">Presupuestos a Medida</h3>
              <p className="text-xs md:text-sm text-slate-300">
                Calculadora en tiempo real y asesoramiento personalizado para grandes tiradas y pedidos de merchandising corporativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="container mx-auto px-4 md:px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Preguntas Frecuentes sobre Servicio por Provincias</h2>
              <p className="text-xs md:text-sm text-slate-500">Respuestas rápidas sobre envíos y producción peninsular</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700">
            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex items-center justify-between font-bold text-slate-900 cursor-pointer text-sm md:text-base">
                ¿Realizan envíos a todas las provincias de la Península?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </summary>
              <p className="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed">
                Sí, enviamos diariamente pedidos a las 47 provincias de la Península Ibérica a través de agencias de transporte exprés.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex items-center justify-between font-bold text-slate-900 cursor-pointer text-sm md:text-base">
                ¿Cómo puedo solicitar un presupuesto para mi provincia?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </summary>
              <p className="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed">
                Puedes seleccionar tu provincia en esta lista o utilizar nuestro calculador de presupuesto rápido online. Te responderemos con la mejor tarifa personalizada para tu volumen.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex items-center justify-between font-bold text-slate-900 cursor-pointer text-sm md:text-base">
                ¿Cuál es el tiempo de producción y entrega?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </summary>
              <p className="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed">
                El tiempo estándar de producción suele ser de 5 a 8 días laborables en función de la técnica. Una vez producido, el envío Peninsular se realiza en 24-48 horas. También disponemos de servicio urgente.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="container mx-auto px-4 md:px-6 py-6 text-center">
        <div className="bg-blue-600 text-white rounded-3xl p-8 md:p-10 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            ¿Necesitas un Presupuesto Rápido para tu Empresa?
          </h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto mb-6">
            Obtén precios al instante para camisetas, bolsas, tazas o cualquier prenda personalizada con envío a tu provincia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/presupuesto-rapido"
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full hover:bg-slate-100 transition-colors shadow-md text-sm md:text-base inline-flex items-center gap-2"
            >
              <FileText size={18} />
              Solicitar Presupuesto Rápido
            </Link>
            <Link
              href="/contacto"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-full transition-colors border border-blue-400/40 text-sm md:text-base"
            >
              Contactar con Asesor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
