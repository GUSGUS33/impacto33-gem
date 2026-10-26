export interface QuoteProduct {
  name: string;
  path: string;
}

export function quoteMessage(product?: QuoteProduct | null) {
  return product
    ? `Hola, quiero solicitar presupuesto para ${product.name}. https://impacto33.com${product.path}`
    : 'Hola, quiero solicitar un presupuesto sin compromiso.';
}

export function quoteFormLink(product?: QuoteProduct | null) {
  if (!product) return '/presupuesto-rapido';
  return `/presupuesto-rapido?${new URLSearchParams({ producto: product.name, ruta: product.path })}`;
}

export function readQuoteProduct(name?: string, path?: string): QuoteProduct | null {
  if (!name?.trim() || !path || !/^\/producto\/[a-zA-Z0-9%_-]+$/.test(path)) return null;
  return { name: name.trim().slice(0, 300), path };
}

export function jotformQuoteUrl(product?: QuoteProduct | null) {
  // Public form field q8_otrasNotas (unique name: otrasNotas).
  // This form's prefill decoder preserves '+', so spaces must be encoded as %20.
  const base = 'https://form.jotform.com/203603626827052';
  return product ? `${base}?otrasNotas=${encodeURIComponent(quoteMessage(product))}` : base;
}
