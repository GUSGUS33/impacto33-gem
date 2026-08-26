import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransactionalPages } from './useTransactionalPages';
import { useQuery } from '@apollo/client';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  gql: vi.fn((strings) => strings[0]),
}));

describe('useTransactionalPages', () => {
  it('should return empty array when loading', () => {
    (useQuery as any).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    const { result } = renderHook(() => useTransactionalPages());

    expect(result.current.pages).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should filter only transactional pages', () => {
    const mockData = {
      pages: {
        nodes: [
          {
            id: '1',
            databaseId: 1,
            title: 'Camisetas Personalizadas',
            slug: 'camisetas-personalizadas',
            uri: '/camisetas-personalizadas/',
            template: {
              templateName: 'Plantilla SEO (Headless Minimal)',
              __typename: 'Template_PlantillaSEOHeadlessMinimal',
            },
            heroPageSeo: {
              tituloPrincipal: 'Camisetas Personalizadas',
              intro: 'Las mejores camisetas',
            },
            seoMeta: {
              metaDescription: 'Descripción SEO',
            },
          },
          {
            id: '2',
            databaseId: 2,
            title: 'Página Normal',
            slug: 'pagina-normal',
            uri: '/pagina-normal/',
            template: {
              templateName: 'Default Template',
              __typename: 'DefaultTemplate',
            },
            heroPageSeo: null,
            seoMeta: null,
          },
        ],
      },
    };

    (useQuery as any).mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useTransactionalPages());

    expect(result.current.pages).toHaveLength(1);
    expect(result.current.pages[0].title).toBe('Camisetas Personalizadas');
  });

  it('should find page by URI', () => {
    const mockData = {
      pages: {
        nodes: [
          {
            id: '1',
            databaseId: 1,
            title: 'Camisetas Personalizadas',
            slug: 'camisetas-personalizadas',
            uri: '/camisetas-personalizadas/',
            template: {
              templateName: 'Plantilla SEO (Headless Minimal)',
              __typename: 'Template_PlantillaSEOHeadlessMinimal',
            },
            heroPageSeo: null,
            seoMeta: null,
          },
        ],
      },
    };

    (useQuery as any).mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useTransactionalPages());

    // Test con diferentes formatos de URI
    expect(result.current.findPageByUri('/camisetas-personalizadas/')).toBeDefined();
    expect(result.current.findPageByUri('camisetas-personalizadas')).toBeDefined();
    expect(result.current.findPageByUri('/camisetas-personalizadas')).toBeDefined();
    expect(result.current.findPageByUri('camisetas-personalizadas/')).toBeDefined();
  });

  it('should return undefined for non-existent page', () => {
    const mockData = {
      pages: {
        nodes: [],
      },
    };

    (useQuery as any).mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useTransactionalPages());

    expect(result.current.findPageByUri('/no-existe/')).toBeUndefined();
  });
});
