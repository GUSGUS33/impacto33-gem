import { describe, expect, it } from 'vitest';
import { jotformQuoteUrl, quoteFormLink, quoteMessage, readQuoteProduct } from './quoteLinks';

describe('quote links', () => {
  const product = { name: 'Bolígrafo & lápiz + azul', path: '/producto/boligrafo-azul' };
  it('keeps generic links outside products', () => {
    expect(quoteFormLink()).toBe('/presupuesto-rapido');
    expect(quoteMessage()).not.toContain('/producto/');
    expect(new URL(jotformQuoteUrl()).search).toBe('');
  });
  it('encodes and preserves product name and canonical path', () => {
    const url = new URL(quoteFormLink(product), 'https://impacto33.com');
    expect(readQuoteProduct(url.searchParams.get('producto')!, url.searchParams.get('ruta')!)).toEqual(product);
    expect(quoteMessage(product)).toContain('https://impacto33.com/producto/boligrafo-azul');
    expect(new URL(jotformQuoteUrl(product)).searchParams.get('otrasNotas')).toBe(quoteMessage(product));
    expect(jotformQuoteUrl(product)).not.toContain('+');
  });
  it('rejects foreign URLs and unrelated paths', () => {
    for (const path of ['https://evil.example', '//evil.example', '/contacto', '/producto/a?redirect=x']) {
      expect(readQuoteProduct('Producto', path)).toBeNull();
    }
    expect(readQuoteProduct('', product.path)).toBeNull();
  });
});
