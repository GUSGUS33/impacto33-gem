import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';
import { PENINSULAR_PROVINCES } from '@/data/provincias';
import extraRoutes from '@/data/sitemap-extra-routes.json';
import excludedRoutes from '@/data/sitemap-excluded-routes.json';

describe('sitemap', () => {
  it('combina rutas SEO y provincias sin duplicados ni trailing slash', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://impacto33.com');
    expect(urls).toContain('https://impacto33.com/sudaderas-personalizadas/sudaderas-para-grupos');
    expect(urls).toContain('https://impacto33.com/servicios/vinilo');
    expect(urls).toContain('https://impacto33.com/mochilas-personalizadas/mochilas-escolares');
    expect(urls).toContain('https://impacto33.com/barcelona');
    expect(urls).toContain('https://impacto33.com/politica-privacidad');
    expect(urls.length).toBeGreaterThan(180);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url === 'https://impacto33.com' || !url.endsWith('/'))).toBe(true);
    for (const route of excludedRoutes) {
      expect(urls).not.toContain(`https://impacto33.com${route}`);
    }
  });

  it('mantiene las provincias sincronizadas con el sitemap estático del prebuild', () => {
    const extraRouteSet = new Set(extraRoutes);

    for (const province of PENINSULAR_PROVINCES) {
      expect(extraRouteSet.has(`/${province.slug}`)).toBe(true);
    }
  });
});
