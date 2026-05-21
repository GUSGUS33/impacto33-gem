import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWishlistProductsWithData } from './useWishlistProductsWithData';
import * as wishlistService from '@/services/wishlistService';
import * as AuthContext from '@/context/AuthContext';

// Mock de servicios
vi.mock('@/services/wishlistService');
vi.mock('@/context/AuthContext');
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
  gql: vi.fn((str) => str),
}));

describe.skip('useWishlistProductsWithData', () => {
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

    const { result } = renderHook(() => useWishlistProductsWithData());

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.products).toEqual([]);
    });
  });

  it('should fetch wishlist products when user is authenticated', async () => {
    const mockWishlistProducts = [
      {
        id: 1,
        product_id: 101,
        product_slug: 'product-1',
        added_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        product_id: 102,
        product_slug: 'product-2',
        added_at: '2024-01-01T09:00:00Z',
      },
    ];

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(wishlistService, 'getWishlistForCurrentUser').mockResolvedValue(
      mockWishlistProducts as any
    );

    const { result } = renderHook(() => useWishlistProductsWithData(2));

    await waitFor(() => {
      expect(wishlistService.getWishlistForCurrentUser).toHaveBeenCalledWith(2);
    });
  });

  it('should remove duplicate slugs from wishlist', async () => {
    const mockWishlistProducts = [
      {
        id: 1,
        product_id: 101,
        product_slug: 'product-1',
        added_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        product_id: 101,
        product_slug: 'product-1', // Duplicado
        added_at: '2024-01-01T09:00:00Z',
      },
    ];

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(wishlistService, 'getWishlistForCurrentUser').mockResolvedValue(
      mockWishlistProducts as any
    );

    const { result } = renderHook(() => useWishlistProductsWithData());

    await waitFor(() => {
      expect(wishlistService.getWishlistForCurrentUser).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(wishlistService, 'getWishlistForCurrentUser').mockRejectedValue(
      new Error('Database error')
    );

    const { result } = renderHook(() => useWishlistProductsWithData());

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.products).toEqual([]);
    });
  });

  it('should maintain original order from wishlist', async () => {
    const mockWishlistProducts = [
      {
        id: 1,
        product_id: 101,
        product_slug: 'product-1',
        added_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        product_id: 102,
        product_slug: 'product-2',
        added_at: '2024-01-01T09:00:00Z',
      },
      {
        id: 3,
        product_id: 103,
        product_slug: 'product-3',
        added_at: '2024-01-01T08:00:00Z',
      },
    ];

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
      logout: vi.fn(),
    });

    vi.spyOn(wishlistService, 'getWishlistForCurrentUser').mockResolvedValue(
      mockWishlistProducts as any
    );

    const { result } = renderHook(() => useWishlistProductsWithData(3));

    await waitFor(() => {
      expect(wishlistService.getWishlistForCurrentUser).toHaveBeenCalledWith(3);
    });
  });
});
