import React from "react";
import { InfoBlockRenderer } from "./InfoBlockRenderer";

interface InfoPageRendererProps {
  page: any;
  blocks: any[];
}

export function InfoPageRenderer({ page, blocks }: InfoPageRendererProps) {
  // Comprobamos si el primer bloque es un Hero para no duplicar visualmente el H1
  const isFirstBlockHero =
    blocks?.[0]?.__typename === "BloquesInformacionalesInfoBlocksHeroInformacionalLayout";

  return (
    <article className="flex flex-col w-full min-h-screen">
      {/* Título de la página (H1 siempre presente para SEO) */}
      {page?.title && (
        <h1
          className={
            isFirstBlockHero
              ? "sr-only"
              : "text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 text-center py-12 container mx-auto px-4"
          }
        >
          {page.title}
        </h1>
      )}

      {blocks && blocks.length > 0 ? (
        <div className="w-full flex-grow">
          {blocks.map((block, index) => (
            <InfoBlockRenderer key={`info-block-${index}`} block={block} />
          ))}
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Esta página aún no tiene contenido.</p>
        </div>
      )}
    </article>
  );
}
