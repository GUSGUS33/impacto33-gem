import { PageBlock } from '@/queries/seoPageComplete';

interface VideoBlockProps {
  data: PageBlock;
}

/**
 * Bloque de video promocional
 * Soporta YouTube, Vimeo y videos directos
 */
export function VideoBlock({ data }: VideoBlockProps) {
  if (!data.videoUrl) return null;

  // Detectar tipo de video (YouTube, Vimeo, directo)
  const isYouTube = data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be');
  const isVimeo = data.videoUrl.includes('vimeo.com');

  // Obtener embed URL para YouTube/Vimeo
  let embedUrl = data.videoUrl;
  if (isYouTube) {
    const videoId = data.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (isVimeo) {
    const videoId = data.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {data.videoTitulo && (
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          {data.videoTitulo}
        </h2>
      )}
      {data.videoDescripcion && (
        <p className="text-lg text-slate-600 mb-8 text-center">
          {data.videoDescripcion}
        </p>
      )}
      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-xl">
        {isYouTube || isVimeo ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={data.videoUrl}
            controls
            className="w-full h-full"
          />
        )}
      </div>
      {data.videoCtaTexto && data.videoCtaUrl && (
        <div className="text-center mt-8">
          <a
            href={data.videoCtaUrl}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            {data.videoCtaTexto}
          </a>
        </div>
      )}
    </div>
  );
}
