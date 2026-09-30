import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
const { queryResult } = vi.hoisted(() => ({ queryResult: vi.fn() }));
vi.mock('@apollo/client', async (importOriginal) => ({
  ...await importOriginal<typeof import('@apollo/client')>(),
  useApolloClient: () => ({}),
  useQuery: queryResult,
}));
import { useFilteredProducts, type FilteredProduct } from './useFilteredProducts';
const initial = { id: '1', databaseId: 1, name: 'Servidor' } as FilteredProduct;
function Probe() {
  const result = useFilteredProducts({ categorySlug: 'camisetas', initialProducts: [initial] });
  return <span>{result.loading ? 'Cargando' : result.products.map(p => p.name).join(',')}</span>;
}
describe('productos precargados', () => {
  it('aparecen durante la primera consulta cliente', () => {
    queryResult.mockReturnValue({ loading: true });
    expect(renderToStaticMarkup(<Probe />)).toContain('Servidor');
  });
  it('se conservan si falla la consulta cliente', () => {
    queryResult.mockReturnValue({ loading: false, error: new Error('503') });
    expect(renderToStaticMarkup(<Probe />)).toContain('Servidor');
  });
  it('se sustituyen por los resultados actualizados, incluso una lista vacía', () => {
    queryResult.mockReturnValue({ loading: false, data: { products: { nodes: [{ ...initial, name: 'Actualizado' }] } } });
    expect(renderToStaticMarkup(<Probe />)).toContain('Actualizado');
    queryResult.mockReturnValue({ loading: false, data: { products: { nodes: [] } } });
    expect(renderToStaticMarkup(<Probe />)).not.toContain('Servidor');
  });
});
