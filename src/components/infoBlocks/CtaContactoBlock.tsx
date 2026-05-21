import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaContactoBlock({ data }: { data: any }) {
  if (!data?.titulo && !data?.textoBoton) return null;

  const url = data.url || "/contacto";

  return (
    <section className="w-full py-20 md:py-32 bg-slate-900 border-y border-slate-800 text-center">
      <div className="container mx-auto px-4">
        {data.titulo && (
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight max-w-3xl mx-auto drop-shadow-md">
            {data.titulo}
          </h2>
        )}
        {data.subtitulo && (
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            {data.subtitulo}
          </p>
        )}
        
        {data.textoBoton && (
          <Button asChild size="lg" className="text-lg px-10 py-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20 transition-transform hover:scale-105">
            <Link href={url}>
              {data.textoBoton}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
