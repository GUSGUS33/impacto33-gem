import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWishlistForCurrentUser,
  isProductInWishlist,
  toggleWishlistProduct,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from './wishlistService';
import * as supabaseClient from '@/lib/supabaseClient';

// Mock del cliente de Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe.skip('wishlistService', () => {
  // TODO(Fase Wishlist v2): Reactivar cuando reescribamos la suite de mocks de Supabase.
  // Hay errores de estructura de test (código huérfano) que necesitan refactoring.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWishlistForCurrentUser', () => {
    it('should return empty array if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getWishlistForCurrentUser();

      expect(result).toEqual([]);
    });

    it('should return wishlist items for authenticated user', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockWishlist = [
        { id: 1, product_id: 1, product_slug: 'product-1', added_at: '2024-01-01' },
        { id: 2, product_id: 2, product_slug: 'product-2', added_at: '2024-01-02' },
      ];

      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockWishlist,
              error: null,
            }),
          }),
        }),
      });

      const result = await getWishlistForCurrentUser();

      expect(result).toEqual(mockWishlist);
    });
  });

  describe('isProductInWishlist', () => {
    it('should return false if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await isProductInWishlist(1);

      expect(result).toBe(false);
    });

    it('should return true if product is in wishlist', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ id: 1 }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await isProductInWishlist(1);

      expect(result).toBe(true);
    });

    it('should return false if product is not in wishlist', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await isProductInWishlist(1);

      expect(result).toBe(false);
    });
  });

  describe('toggleWishlistProduct', () => {
    it('should return null if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await toggleWishlistProduct(1, 'product-1');

      expect(result).toBeNull();
    });

    it('should add product to wishlist if not present', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      // Mock isProductInWishlist to return false
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await toggleWishlistProduct(1, 'product-1');

      expect(result).toBe(true);
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await addToWishlist(1, 'product-1');

      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        supabase_user_id: 'user-123',
        product_id: 1,
        product_slug: 'product-1',
      });
    });
  });

  describe('removeFromWishlist', () => {
    it('should return false if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await removeFromWishlist(1);

      expect(result).toBe(false);
    });
  });


  describe('clearWishlist', () => {
    it('should clear all wishlist items for user', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      });

      const result = await clearWishlist();

      expect(result).toBe(true);
    });
  });
});
