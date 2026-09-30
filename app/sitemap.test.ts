import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GET } from './sitemap.xml/route';
import excludedRoutes from '@/data/sitemap-excluded-routes.json';

describe('sitemap', () => {
  it('publica un índice XML con los cuatro sitemaps canónicos', async () => {
    const response = GET();
    const xml = await response.text();

    expect(response.headers.get('content-type')).toContain('application/xml');
    expect(xml).toContain('<sitemapindex');
    expect(xml).toContain('https://impacto33.com/sitemaps/pages.xml');
    expect(xml).toContain('https://impacto33.com/sitemaps/categories.xml');
    expect(xml).toContain('https://impacto33.com/sitemaps/discovery.xml');
    expect(xml).toContain('https://impacto33.com/sitemap-products.xml');
    expect(xml).not.toContain('<lastmod>');
  });

  it('genera hijos sin duplicados, trailing slash ni rutas excluidas', () => {
    const files = [
      'public/sitemaps/pages.xml',
      'public/sitemaps/categories.xml',
      'public/sitemaps/discovery.xml',
      'public/sitemap-products.xml',
    ];
    const urls = files.flatMap((file) => {
      const xml = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    });

    expect(urls.length).toBeGreaterThan(2000);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url === 'https://impacto33.com/' || !url.endsWith('/'))).toBe(true);
    for (const route of excludedRoutes) {
      expect(urls).not.toContain(`https://impacto33.com${route}`);
    }
  });
});
