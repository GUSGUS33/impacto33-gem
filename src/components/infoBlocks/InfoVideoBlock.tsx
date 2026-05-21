import React from "react";

export function InfoVideoBlock({ data }: { data: any }) {
  if (!data?.videoUrl) return null;

  // Simple embed conversion for YouTube/Vimeo URLs
  let embedUrl = data.videoUrl;
  if (embedUrl.includes("youtube.com/watch?v=")) {
    embedUrl = embedUrl.replace("watch?v=", "embed/");
  } else if (embedUrl.includes("youtu.be/")) {
    embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
  }

  return (
    <section className="w-full py-16 md:py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 max-w-5xl">
        {data.titulo && (
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center tracking-tight">
            {data.titulo}
          </h2>
        )}
        
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black mb-10 border border-slate-800">
          <iframe
            src={embedUrl}
            title={data.titulo || "Video"}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {data.descripcion && (
          <div 
            className="prose prose-invert prose-lg max-w-3xl mx-auto text-center text-slate-300"
            dangerouslySetInnerHTML={{ __html: data.descripcion }}
          />
        )}
      </div>
    </section>
  );
}
