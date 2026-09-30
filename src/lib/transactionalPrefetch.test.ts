import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageBlock } from '@/queries/seoPageComplete';
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock('@/lib/wpGraphql', () => ({ wpGraphqlFetch: fetchMock }));
import { prefetchTransactionalPageData } from './transactionalPrefetch';

describe('precarga de categorías', () => {
  beforeEach(() => { fetchMock.mockReset(); });

  it('conserva prioridad manual, elimina duplicados y limita el listado', async () => {
    const manual = { databaseId: 1, id: '1', slug: 'manual' };
    const automatic = { databaseId: 2, id: '2', slug: 'automatico' };
    fetchMock.mockImplementation(async (query: string) => {
      if (query.includes('GetChildPagesSSR')) return { page: { children: { nodes: [] } } };
      if (query.includes('GetProductsByIdsSSR')) return { products: { nodes: [manual] } };
      if (query.includes('GetProductBySkuSSR')) return { products: { nodes: [manual] } };
      return { products: { nodes: [manual, automatic, { databaseId: 3, id: '3' }] } };
    });
    const result = await prefetchTransactionalPageData({ uri: '/camisetas/' }, [{
      blockType: ['productos_dinamicos'], productosDinamicosCategoria: 'camisetas',
      productosDinamicosIds: '1', productosDinamicosSkus: 'SKU1', productosDinamicosMaximo: 2,
    } as PageBlock]);
    expect(result.productsByBlock[0]).toEqual([manual, automatic]);
  });

  it('consulta hermanas a partir del padre y conserva el índice del bloque', async () => {
    fetchMock.mockResolvedValue({ page: { children: { nodes: [{ uri: '/padre/hermana/' }] } }, products: { nodes: [] } });
    const result = await prefetchTransactionalPageData({ uri: '/padre/hija/', parent: { node: { uri: '/padre/' } } }, [
      { blockType: ['html'] } as PageBlock,
      { blockType: ['productosdinamicos'], productosDinamicosCategoria: 'camisetas' } as PageBlock,
    ]);
    expect(fetchMock.mock.calls[0][1]).toEqual({ parentUri: '/padre/' });
    expect(result.productsByBlock).toEqual({ 1: [] });
    expect(result.childPages[0].uri).toBe('/padre/hermana/');
  });

  it('permite recuperación en cliente cuando WordPress falla', async () => {
    fetchMock.mockRejectedValue(new Error('HTTP 503'));
    await expect(prefetchTransactionalPageData({ uri: '/camisetas/' }, [{
      blockType: ['productos_dinamicos'], productosDinamicosCategoria: 'camisetas',
    } as PageBlock])).resolves.toEqual({ childPages: [], productsByBlock: { 0: [] } });
  });
});
