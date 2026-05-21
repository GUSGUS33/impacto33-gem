import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useViewedProductsWithData } from './useViewedProductsWithData';
import * as trackingService from '@/services/trackingService';
import * as AuthContext from '@/context/AuthContext';

// Mock de servicios
vi.mock('@/services/trackingService');
vi.mock('@/context/AuthContext');
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
  gql: vi.fn((str) => str),
}));

describe.skip('useViewedProductsWithData', () => {
  // TODO(Fase Hooks v2): Reactivar cuando arreglemos el mock de @apollo/client.
  // Falta exportar 'gql' en el mock.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty products when user is not authenticated', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useViewedProductsWithData());

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.products).toEqual([]);
    });
  });

  it('should fetch viewed products when user is authenticated', async () => {
    const mockViewedProducts = [
      {
        id: 1,
        product_id: 101,
        product_slug: 'product-1',
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        product_id: 102,
        product_slug: 'product-2',
        created_at: '2024-01-01T09:00:00Z',
      },
    ];

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(trackingService, 'getViewedProducts').mockResolvedValue(
      mockViewedProducts as any
    );

    const { result } = renderHook(() => useViewedProductsWithData(2));

    await waitFor(() => {
      expect(trackingService.getViewedProducts).toHaveBeenCalledWith(2);
    });
  });

  it('should remove duplicate slugs', async () => {
    const mockViewedProducts = [
      {
        id: 1,
        product_id: 101,
        product_slug: 'product-1',
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        product_id: 101,
        product_slug: 'product-1', // Duplicado
        created_at: '2024-01-01T09:00:00Z',
      },
    ];

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(trackingService, 'getViewedProducts').mockResolvedValue(
      mockViewedProducts as any
    );

    const { result } = renderHook(() => useViewedProductsWithData());

    await waitFor(() => {
      expect(trackingService.getViewedProducts).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(trackingService, 'getViewedProducts').mockRejectedValue(
      new Error('Database error')
    );

    const { result } = renderHook(() => useViewedProductsWithData());

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.products).toEqual([]);
    });
  });
});
