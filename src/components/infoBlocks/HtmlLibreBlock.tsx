import React from "react";

export function HtmlLibreBlock({ data }: { data: any }) {
  if (!data?.contenido) return null;

  return (
    <section className="w-full py-12 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {data.titulo && (
          <h2 className="text-3xl font-bold text-slate-900 mb-8 max-w-4xl mx-auto text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        <div 
          className="max-w-none w-full"
          dangerouslySetInnerHTML={{ __html: data.contenido }}
        />
      </div>
    </section>
  );
}
