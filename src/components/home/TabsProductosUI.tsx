'use client';

import React, { useState } from 'react';

export function TabsProductosUI({ 
  titulo, 
  tabs, 
  children 
}: { 
  titulo?: string, 
  tabs: any[], 
  children: React.ReactNode 
}) {
  const [activeTab, setActiveTab] = useState(0);

  if (!tabs || tabs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-[100px] bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {titulo && (
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-10">{titulo}</h2>
        )}

        {/* Botones Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                activeTab === index 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label || tab.slugCategoria || 'Tab'}
            </button>
          ))}
        </div>

        {/* Contenido Renderizado */}
        <div className="relative">
          {Array.isArray(children) ? children[activeTab] : children}
        </div>
      </div>
    </section>
  );
}
