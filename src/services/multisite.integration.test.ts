import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests de integración para verificar que todos los servicios
 * incluyen filtro site_id en sus queries a Supabase.
 * 
 * Estrategia: mockear supabase y verificar que .eq('site_id', ...) se llama.
 */

const IMPACTO33_SITE_ID = '6321b8a8-976f-49b3-84f1-05b427f8e138';

// Chainable mock builder
function createChainableMock(finalValue: any = { data: [], error: null }) {
  const calls: Array<{ method: string; args: any[] }> = [];

  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === '_calls') return calls;
      if (prop === 'then') return undefined; // prevent Promise-like behavior
      return (...args: any[]) => {
        calls.push({ method: prop as string, args });
        // Terminal methods return the final value
        if (['single', 'maybeSingle'].includes(prop as string)) {
          return Promise.resolve(finalValue);
        }
        return new Proxy({}, handler);
      };
    },
  };

  return new Proxy({}, handler);
}

// Mock supabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@test.com' },
          },
        },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@test.com' } },
        error: null,
      }),
    },
  },
}));

// Mock siteConfig
vi.mock('@/lib/siteConfig', () => ({
  getSiteId: vi.fn().mockResolvedValue(IMPACTO33_SITE_ID),
  getSiteIdSync: vi.fn().mockReturnValue(IMPACTO33_SITE_ID),
  SITE_SLUG: 'impacto33',
  SITE_ID_FALLBACK: IMPACTO33_SITE_ID,
}));

describe('Multi-site integration: all services filter by site_id', () => {
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('@/lib/supabaseClient');
    mockFrom = supabase.from as ReturnType<typeof vi.fn>;
  });

  describe('cartService', () => {
    it('getActiveCart should filter by site_id', async () => {
      const chain = createChainableMock({ data: null, error: { code: 'PGRST116' } });
      mockFrom.mockReturnValue(chain);

      const { getOrCreateActiveCartForUser } = await import('./cartService');
      await getOrCreateActiveCartForUser();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('wishlistService', () => {
    it('getWishlistForCurrentUser should filter by site_id', async () => {
      const chain = createChainableMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { getWishlistForCurrentUser } = await import('./wishlistService');
      await getWishlistForCurrentUser();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('trackingService', () => {
    it('getViewedProducts should filter by site_id', async () => {
      const chain = createChainableMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { getViewedProducts } = await import('./trackingService');
      await getViewedProducts();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('searchHistoryService', () => {
    it('getRecentSearches should filter by site_id', async () => {
      const chain = createChainableMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { getRecentSearches } = await import('./searchHistoryService');
      await getRecentSearches();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('addressService', () => {
    it('getUserAddresses should filter by site_id', async () => {
      const chain = createChainableMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { getUserAddresses } = await import('./addressService');
      await getUserAddresses();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('profileService', () => {
    it('getUserProfile should filter by site_id', async () => {
      const chain = createChainableMock({
        data: { email: 'test@test.com', is_newsletter_subscribed: false },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const { getUserProfile } = await import('./profileService');
      await getUserProfile('test-user-id');

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('profileOnboardingService', () => {
    it('getOnboardingStatus should filter by site_id', async () => {
      const chain = createChainableMock({
        data: { profile_onboarding_completed: false },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const { getOnboardingStatus } = await import('./profileOnboardingService');
      await getOnboardingStatus('test-user-id');

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('userProfileService', () => {
    it('getOrCreateUserProfile should filter by site_id', async () => {
      const chain = createChainableMock({
        data: { id: 1, email: 'test@test.com' },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const { getOrCreateUserProfile } = await import('./userProfileService');
      await getOrCreateUserProfile('test-user-id', 'test@test.com');

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });

  describe('ordersService', () => {
    it('getUserOrders should filter by site_id', async () => {
      const chain = createChainableMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { getUserOrders } = await import('./ordersService');
      await getUserOrders();

      const calls = (chain as any)._calls;
      const eqCalls = calls.filter((c: any) => c.method === 'eq');
      const siteIdFilter = eqCalls.find((c: any) => c.args[0] === 'site_id');
      expect(siteIdFilter).toBeDefined();
      expect(siteIdFilter.args[1]).toBe(IMPACTO33_SITE_ID);
    });
  });
});
