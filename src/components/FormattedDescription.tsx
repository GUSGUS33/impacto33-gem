/**
 * FormattedDescription Component
 * 
 * Procesa y mejora el HTML de descripciones de WooCommerce
 * Características avanzadas:
 * - Convierte texto plano a HTML si es necesario
 * - Divide párrafos largos en secciones más legibles
 * - Detecta palabras clave y las pone en negrita automáticamente
 * - Añade espaciado estratégico
 * - Sanitiza HTML para evitar XSS
 * - Mejora estructura visual general
 */

interface FormattedDescriptionProps {
  html: string;
  className?: string;
}

/**
 * Palabras clave que se detectan automáticamente para poner en negrita
 */
const KEYWORDS_TO_BOLD = [
  'características técnicas',
  'características',
  'modelo:',
  'modelo',
  'talla',
  'tallas',
  'material',
  'materiales',
  'composición',
  'peso',
  'dimensiones',
  'color',
  'colores',
  'cuidados',
  'instrucciones',
  'garantía',
  'disponible',
  'disponibles',
  'especificaciones',
  'especificación',
  'descripción',
  'información',
  'ventajas',
  'beneficios',
  'uso',
  'aplicación',
  'aplicaciones',
  'tecnología',
  'proceso',
  'método',
  'sistema',
  'servicio',
  'servicios',
  'precio',
  'precios',
  'envío',
  'devolución',
  'política',
  'políticas',
  'nota:',
  'importante:',
  'atención:',
  'advertencia:',
  'recomendación:',
  'recomendaciones:',
];

/**
 * Detecta si el HTML es texto plano (sin etiquetas HTML)
 */
function isPlainText(html: string): boolean {
  // Si no tiene etiquetas HTML, es texto plano
  return !/<[^>]+>/g.test(html);
}

/**
 * Convierte texto plano a HTML con párrafos
 * Divide por líneas en blanco o puntos seguidos de mayúscula
 */
function convertPlainTextToHtml(text: string): string {
  // Escapar caracteres especiales HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Dividir por líneas en blanco (párrafos)
  const paragraphs = html.split(/\n\s*\n/);
  
  // Convertir cada párrafo a etiqueta <p>
  const htmlParagraphs = paragraphs
    .map(para => {
      // Limpiar espacios en blanco
      const cleaned = para.trim();
      if (cleaned) {
        // Reemplazar saltos de línea simples con <br>
        const withBr = cleaned.replace(/\n/g, '<br />');
        return `<p>${withBr}</p>`;
      }
      return '';
    })
    .filter(p => p) // Remover párrafos vacíos
    .join('');

  return htmlParagraphs;
}

/**
 * Divide párrafos largos en secciones más legibles
 */
function splitLongParagraphs(html: string): string {
  // Expresión regular para encontrar párrafos
  const paragraphRegex = /<p([^>]*)>(.*?)<\/p>/gi;
  
  let result = html;
  const matches = Array.from(html.matchAll(paragraphRegex));

  // Procesar en orden inverso para no afectar los índices
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const fullTag = match[0];
    const attributes = match[1];
    const content = match[2];

    // Si el párrafo es muy largo (más de 400 caracteres), dividirlo
    if (content.length > 400) {
      // Dividir por puntos seguidos de espacio
      const sentences = content.split(/(?<=[.!?])\s+/);
      
      if (sentences.length > 1) {
        // Agrupar sentencias en grupos de 2-3 para crear párrafos más pequeños
        const groupedSentences: string[] = [];
        let currentGroup: string[] = [];
        let currentLength = 0;

        sentences.forEach((sentence) => {
          currentGroup.push(sentence);
          currentLength += sentence.length;

          // Si el grupo alcanza ~200 caracteres o tiene 3 sentencias, crear un nuevo párrafo
          if (currentLength > 200 || currentGroup.length >= 3) {
            groupedSentences.push(currentGroup.join(' '));
            currentGroup = [];
            currentLength = 0;
          }
        });

        // Añadir el grupo final si hay contenido
        if (currentGroup.length > 0) {
          groupedSentences.push(currentGroup.join(' '));
        }

        // Reconstruir los párrafos
        const newParagraphs = groupedSentences
          .map((group) => `<p${attributes}>${group}</p>`)
          .join('');

        result = result.replace(fullTag, newParagraphs);
      }
    }
  }

  return result;
}

/**
 * Detecta palabras clave y las pone en negrita automáticamente
 */
function boldKeywords(html: string): string {
  let result = html;

  KEYWORDS_TO_BOLD.forEach((keyword) => {
    // Crear una expresión regular que sea case-insensitive
    // pero que no reemplace si ya está dentro de una etiqueta <strong>, <b>, <em>, etc.
    const regex = new RegExp(
      `(?<!<[^>]*)(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![^<]*>)`,
      'gi'
    );

    result = result.replace(regex, '<strong>$1</strong>');
  });

  return result;
}

/**
 * Añade espaciado extra después de puntos para mejorar legibilidad
 */
function improveSpacing(html: string): string {
  // Añadir saltos de línea después de puntos seguidos de mayúscula
  let result = html.replace(/([.!?])\s+([A-Z])/g, '$1<br /><br />$2');

  // Añadir espaciado entre párrafos consecutivos
  result = result.replace(/<\/p>\s*<p/g, '</p><p');

  return result;
}

/**
 * Procesa el HTML y añade clases Tailwind para mejor formato
 */
function enhanceHtmlWithTailwind(html: string): string {
  let enhanced = html;

  // Mejorar párrafos: añadir espaciado y tamaño de fuente
  enhanced = enhanced.replace(
    /<p([^>]*)>/g,
    '<p$1 class="mb-5 leading-relaxed text-base text-slate-700">'
  );

  // Mejorar encabezados H1, H2, H3, H4, H5, H6
  enhanced = enhanced.replace(
    /<h1([^>]*)>/g,
    '<h1$1 class="text-3xl font-bold mt-8 mb-4 text-slate-900">'
  );
  enhanced = enhanced.replace(
    /<h2([^>]*)>/g,
    '<h2$1 class="text-2xl font-bold mt-6 mb-3 text-slate-900">'
  );
  enhanced = enhanced.replace(
    /<h3([^>]*)>/g,
    '<h3$1 class="text-xl font-bold mt-5 mb-2 text-slate-800">'
  );
  enhanced = enhanced.replace(
    /<h4([^>]*)>/g,
    '<h4$1 class="text-lg font-bold mt-4 mb-2 text-slate-800">'
  );
  enhanced = enhanced.replace(
    /<h5([^>]*)>/g,
    '<h5$1 class="text-base font-bold mt-3 mb-2 text-slate-800">'
  );
  enhanced = enhanced.replace(
    /<h6([^>]*)>/g,
    '<h6$1 class="text-sm font-bold mt-2 mb-2 text-slate-800">'
  );

  // Mejorar listas desordenadas
  enhanced = enhanced.replace(
    /<ul([^>]*)>/g,
    '<ul$1 class="list-disc list-inside mb-5 space-y-2 text-slate-700">'
  );

  // Mejorar listas ordenadas
  enhanced = enhanced.replace(
    /<ol([^>]*)>/g,
    '<ol$1 class="list-decimal list-inside mb-5 space-y-2 text-slate-700">'
  );

  // Mejorar items de lista
  enhanced = enhanced.replace(
    /<li([^>]*)>/g,
    '<li$1 class="ml-2 text-slate-700">'
  );

  // Mejorar blockquotes
  enhanced = enhanced.replace(
    /<blockquote([^>]*)>/g,
    '<blockquote$1 class="border-l-4 border-blue-500 pl-4 py-2 my-5 italic text-slate-600 bg-blue-50 rounded-r">'
  );

  // Mejorar tablas
  enhanced = enhanced.replace(
    /<table([^>]*)>/g,
    '<table$1 class="w-full border-collapse my-5 border border-slate-300">'
  );

  enhanced = enhanced.replace(
    /<thead([^>]*)>/g,
    '<thead$1 class="bg-slate-100">'
  );

  enhanced = enhanced.replace(
    /<th([^>]*)>/g,
    '<th$1 class="border border-slate-300 px-4 py-2 text-left font-bold text-slate-900">'
  );

  enhanced = enhanced.replace(
    /<td([^>]*)>/g,
    '<td$1 class="border border-slate-300 px-4 py-2 text-slate-700">'
  );

  // Mejorar imágenes
  enhanced = enhanced.replace(
    /<img([^>]*?)>/g,
    '<img$1 class="max-w-full h-auto rounded-lg my-5" />'
  );

  // Mejorar enlaces
  enhanced = enhanced.replace(
    /<a([^>]*?)href="([^"]*)"([^>]*)>/g,
    '<a$1href="$2"$3 class="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors">'
  );

  // Mejorar código inline
  enhanced = enhanced.replace(
    /<code([^>]*)>/g,
    '<code$1 class="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800">'
  );

  // Mejorar bloques de código
  enhanced = enhanced.replace(
    /<pre([^>]*)>/g,
    '<pre$1 class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-5 font-mono text-sm">'
  );

  // Mejorar énfasis (strong, em, b, i)
  enhanced = enhanced.replace(
    /<strong([^>]*)>/g,
    '<strong$1 class="font-bold text-slate-900">'
  );

  enhanced = enhanced.replace(
    /<b([^>]*)>/g,
    '<b$1 class="font-bold text-slate-900">'
  );

  enhanced = enhanced.replace(
    /<em([^>]*)>/g,
    '<em$1 class="italic text-slate-700">'
  );

  enhanced = enhanced.replace(
    /<i([^>]*)>/g,
    '<i$1 class="italic text-slate-700">'
  );

  // Mejorar saltos de línea (br)
  enhanced = enhanced.replace(
    /<br\s*\/?>/g,
    '<br class="my-2" />'
  );

  // Mejorar divisores horizontales
  enhanced = enhanced.replace(
    /<hr\s*\/?>/g,
    '<hr class="my-6 border-t border-slate-300" />'
  );

  return enhanced;
}

/**
 * Sanitiza el HTML para evitar XSS
 */
function sanitizeHtml(html: string): string {
  // Permitir solo etiquetas seguras
  const dangerousPatterns = [/<script/gi, /on\w+\s*=/gi, /javascript:/gi];
  let isSafe = !dangerousPatterns.some(pattern => pattern.test(html));

  if (!isSafe) {
    console.warn('⚠️ HTML potencialmente peligroso detectado en descripción. Sanitizando...');
    // Remover scripts y event handlers
    html = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/javascript:/gi, '');
  }

  return html;
}

export function FormattedDescription({
  html,
  className = '',
}: FormattedDescriptionProps) {
  if (!html) {
    return null;
  }

  // Sanitizar HTML
  let processed = sanitizeHtml(html);

  // Si es texto plano, convertir a HTML primero
  if (isPlainText(processed)) {
    console.log('📝 Detectado texto plano, convirtiendo a HTML...');
    processed = convertPlainTextToHtml(processed);
  }

  // Aplicar mejoras en orden
  processed = splitLongParagraphs(processed);
  processed = improveSpacing(processed);
  processed = boldKeywords(processed);
  processed = enhanceHtmlWithTailwind(processed);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
