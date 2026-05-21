import { useEffect, useRef } from 'react';

interface JotFormEmbedProps {
  formId: string;
  height?: number;
  title?: string;
}

export default function JotFormEmbed({ formId, height = 500, title = "Formulario de Contacto" }: JotFormEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // JotForm script for auto-resizing
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.indexOf('setHeight') > -1) {
        const args = e.data.split(':');
        if (args[1] === formId && iframeRef.current) {
          iframeRef.current.style.height = args[2] + 'px';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [formId]);

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        id={`JotFormIFrame-${formId}`}
        title={title}
        onLoad={() => window.parent.scrollTo(0, 0)}
        allowTransparency={true}
        allowFullScreen={true}
        allow="geolocation; microphone; camera"
        src={`https://form.jotform.com/${formId}`}
        frameBorder="0"
        style={{
          minWidth: '100%',
          maxWidth: '100%',
          height: `${height}px`,
          border: 'none',
        }}
        scrolling="no"
      />
    </div>
  );
}
