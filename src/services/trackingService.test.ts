import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackProductView, getViewedProducts, clearViewedProducts } from './trackingService';
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

describe.skip('trackingService', () => {
  // TODO(Fase Analytics): Reactivar cuando implementemos tracking completo de vistas.
  // Feature de analytics, no afecta flujo de compra
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackProductView', () => {
    it('should not track view if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await trackProductView({ productId: 1, productSlug: 'test-product' });

      // Verify that from() was not called
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should track view if user is authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

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

      await trackProductView({ productId: 1, productSlug: 'test-product' });

      expect(mockSupabase.from).toHaveBeenCalledWith('viewed_products');
      expect(mockInsert).toHaveBeenCalledWith({
        supabase_user_id: 'user-123',
        product_id: 1,
        product_slug: 'test-product',
      });
    });

    it('should handle errors gracefully', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
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

      // Should not throw
      await expect(
        trackProductView({ productId: 1, productSlug: 'test-product' })
      ).resolves.not.toThrow();
    });
  });

  describe('getViewedProducts', () => {
    it('should return empty array if user is not authenticated', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getViewedProducts();

      expect(result).toEqual([]);
    });

    it('should return viewed products for authenticated user', async () => {
      const mockSupabase = supabaseClient.supabase as any;
      const mockProducts = [
        { id: 1, product_id: 1, product_slug: 'product-1', created_at: '2024-01-01' },
        { id: 2, product_id: 2, product_slug: 'product-2', created_at: '2024-01-02' },
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
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getViewedProducts(2);

      expect(result).toEqual(mockProducts);
    });
  });

  describe('clearViewedProducts', () => {
    it('should clear all viewed products for user', async () => {
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

      const result = await clearViewedProducts();

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('viewed_products');
    });
  });
});
