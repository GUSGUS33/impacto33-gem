import React from "react";

export function TextoSimpleBlock({ data }: { data: any }) {
  if (!data?.contenido) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        <div 
          className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-600 prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-800"
          dangerouslySetInnerHTML={{ __html: data.contenido }}
        />
      </div>
    </section>
  );
}
