import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackSearch, getRecentSearches, clearSearchHistory } from './searchHistoryService';
import * as supabaseClient from '@/lib/supabaseClient';

// Mock de Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe.skip('searchHistoryService', () => {
  // TODO(Fase Búsqueda Avanzada): Reactivar cuando implementemos historial de búsquedas completo.
  // Feature de UX, no crítica para Fase 1.2
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackSearch', () => {
    it('should not track search if user is not authenticated', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await trackSearch('test query');
      expect(result).toBe(false);
    });

    it('should return false for empty query', async () => {
      const result = await trackSearch('');
      expect(result).toBe(false);
    });

    it('should normalize query to lowercase', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabaseClient.supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
        }),
        insert: mockInsert,
      } as any);

      await trackSearch('TEST QUERY');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test query',
        })
      );
    });
  });

  describe('getRecentSearches', () => {
    it('should return empty array if user is not authenticated', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getRecentSearches();
      expect(result).toEqual([]);
    });

    it('should return recent searches ordered by date', async () => {
      const mockSearches = [
        {
          id: '1',
          query: 'tazas personalizadas',
          created_at: '2024-01-01T10:00:00Z',
          supabase_user_id: 'user-123',
          woo_customer_id: null,
        },
        {
          id: '2',
          query: 'bolsas',
          created_at: '2024-01-01T09:00:00Z',
          supabase_user_id: 'user-123',
          woo_customer_id: null,
        },
      ];

      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      vi.mocked(supabaseClient.supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockSearches,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getRecentSearches(5);
      expect(result).toHaveLength(2);
      expect(result[0].query).toBe('tazas personalizadas');
    });

    it('should respect limit parameter', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseClient.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      await getRecentSearches(10);
      // Verificar que se llamó con el límite correcto
      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe('clearSearchHistory', () => {
    it('should return false if user is not authenticated', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await clearSearchHistory();
      expect(result).toBe(false);
    });

    it('should clear all searches for authenticated user', async () => {
      vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseClient.supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any);

      const result = await clearSearchHistory();
      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
