import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeSlug, normalizeSlugs } from './slugUtils';
import { sanitizeBreadcrumbUrl, getCategoryBreadcrumbForProduct, getProductBreadcrumbChain } from './slugMap';

describe('normalizeSlug', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.warn para verificar warnings en dev
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Casos con caracteres invisibles', () => {
    it('debe eliminar tab al final del slug', () => {
      const result = normalizeSlug('camisetas-manga-corta\t');
      expect(result).toBe('camisetas-manga-corta');
    });

    it('debe eliminar espacios al inicio y final', () => {
      const result = normalizeSlug(' camisetas-manga-corta ');
      expect(result).toBe('camisetas-manga-corta');
    });

    it('debe eliminar newline en medio del slug', () => {
      const result = normalizeSlug('camisetas\nmanga-corta');
      expect(result).toBe('camisetasmanga-corta');
    });

    it('debe eliminar múltiples espacios en medio', () => {
      const result = normalizeSlug('camisetas   manga-corta');
      expect(result).toBe('camisetasmanga-corta');
    });

    it('debe eliminar tabs, espacios y newlines combinados', () => {
      const result = normalizeSlug(' \tcamisetas\n\tmanga-corta \t ');
      expect(result).toBe('camisetasmanga-corta');
    });

    it('debe eliminar carriage return (\\r)', () => {
      const result = normalizeSlug('camisetas\rmanga-corta');
      expect(result).toBe('camisetasmanga-corta');
    });
  });

  describe('Casos con slugs limpios', () => {
    it('debe retornar slug limpio sin modificar', () => {
      const result = normalizeSlug('camisetas-personalizadas');
      expect(result).toBe('camisetas-personalizadas');
    });

    it('debe convertir a minúsculas', () => {
      const result = normalizeSlug('Camisetas-Personalizadas');
      expect(result).toBe('camisetas-personalizadas');
    });

    it('debe mantener guiones y números', () => {
      const result = normalizeSlug('t-shirts-2024');
      expect(result).toBe('t-shirts-2024');
    });

    it('debe mantener underscores', () => {
      const result = normalizeSlug('t_shirts');
      expect(result).toBe('t_shirts');
    });
  });

  describe('Casos con valores vacíos o inválidos', () => {
    it('debe retornar null para string vacío', () => {
      const result = normalizeSlug('');
      expect(result).toBeNull();
    });

    it('debe retornar null para null', () => {
      const result = normalizeSlug(null);
      expect(result).toBeNull();
    });

    it('debe retornar null para undefined', () => {
      const result = normalizeSlug(undefined);
      expect(result).toBeNull();
    });

    it('debe retornar null para string solo con whitespace', () => {
      const result = normalizeSlug('   \t\n   ');
      expect(result).toBeNull();
    });

    it('debe retornar null para valores no-string', () => {
      const result = normalizeSlug(123 as any);
      expect(result).toBeNull();
    });
  });

  describe('Logging en desarrollo', () => {
    it('debe loggear warning cuando hay whitespace en desarrollo', () => {
      // Simular entorno de desarrollo
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      normalizeSlug('camisetas-manga-corta\t');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[slugUtils] Slug con whitespace detectado:',
        'Original: "camisetas-manga-corta\t"',
        'Limpio: "camisetas-manga-corta"'
      );

      // Restaurar entorno
      process.env.NODE_ENV = originalEnv;
    });

    it('NO debe loggear warning en producción', () => {
      // Simular entorno de producción
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      normalizeSlug('camisetas-manga-corta\t');

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      // Restaurar entorno
      process.env.NODE_ENV = originalEnv;
    });

    it('NO debe loggear warning para slugs limpios', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      normalizeSlug('camisetas-manga-corta');

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('normalizeSlugs', () => {
  it('debe normalizar array de slugs', () => {
    const result = normalizeSlugs([
      'camisetas\t',
      ' polos ',
      'sudaderas',
      null,
      undefined,
      '   ',
    ]);

    expect(result).toEqual([
      'camisetas',
      'polos',
      'sudaderas',
    ]);
  });

  it('debe retornar array vacío para array vacío', () => {
    const result = normalizeSlugs([]);
    expect(result).toEqual([]);
  });

  it('debe filtrar todos los valores inválidos', () => {
    const result = normalizeSlugs([null, undefined, '', '   ']);
    expect(result).toEqual([]);
  });
});

describe('sanitizeBreadcrumbUrl y Breadcrumbs Transaccionales', () => {
  it('debe eliminar prefijos de taxonomías nativas de WooCommerce (/categoria-producto/, /product-category/)', () => {
    expect(sanitizeBreadcrumbUrl('/categoria-producto/t_shirts/')).toBe('/camisetas-personalizadas/');
    expect(sanitizeBreadcrumbUrl('/product-category/camisetas-personalizadas/')).toBe('/camisetas-personalizadas/');
    expect(sanitizeBreadcrumbUrl('/categoria/sudaderas/')).toBe('/sudaderas-personalizadas/');
    expect(sanitizeBreadcrumbUrl('https://impacto33.com/categoria-producto/bags/')).toBe('/bolsas-personalizadas/');
  });

  it('debe transformar slugs de WooCommerce a la URL de la página transaccional', () => {
    const breadcrumb = getCategoryBreadcrumbForProduct([
      { name: 'Camisetas', slug: 't_shirts' }
    ]);
    expect(breadcrumb).not.toBeNull();
    expect(breadcrumb?.url).toBe('/camisetas-personalizadas/');
    expect(breadcrumb?.url).not.toContain('categoria-producto');
    expect(breadcrumb?.url).not.toContain('t_shirts');
  });

  it('debe generar la jerarquía transaccional completa (Madre > Hija) para productos', () => {
    const chain = getProductBreadcrumbChain({
      productSlug: 'camiseta-tecnica-deporte-hombre',
      productName: 'Camiseta Técnica Deportiva',
      categories: [{ name: 'Camisetas', slug: 't_shirts' }]
    });

    expect(chain.length).toBeGreaterThan(0);
    // Cada eslabón del breadcrumb debe ser una URL transaccional
    for (const item of chain) {
      expect(item.url).toMatch(/^\/[a-z0-9-_\/]+$/);
      expect(item.url).not.toContain('categoria-producto');
      expect(item.url).not.toContain('product-category');
    }
  });
});
