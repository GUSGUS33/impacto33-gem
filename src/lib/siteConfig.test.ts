import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabaseClient before importing siteConfig
vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '6321b8a8-976f-49b3-84f1-05b427f8e138' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

describe('siteConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export the correct SITE_SLUG', async () => {
    const { SITE_SLUG } = await import('./siteConfig');
    expect(SITE_SLUG).toBe('impacto33');
  });

  it('should export the correct SITE_ID_FALLBACK', async () => {
    const { SITE_ID_FALLBACK } = await import('./siteConfig');
    expect(SITE_ID_FALLBACK).toBe('6321b8a8-976f-49b3-84f1-05b427f8e138');
  });

  it('getSiteIdSync should return fallback when not yet resolved', async () => {
    const { getSiteIdSync, SITE_ID_FALLBACK } = await import('./siteConfig');
    // Before async resolution, sync getter should return fallback
    const result = getSiteIdSync();
    expect(result).toBe(SITE_ID_FALLBACK);
  });

  it('getSiteId should return a valid UUID', async () => {
    const { getSiteId } = await import('./siteConfig');
    const siteId = await getSiteId();
    expect(siteId).toBeTruthy();
    expect(typeof siteId).toBe('string');
    // UUID v4 format
    expect(siteId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('getSiteId should return the impacto33 site_id', async () => {
    const { getSiteId } = await import('./siteConfig');
    const siteId = await getSiteId();
    expect(siteId).toBe('6321b8a8-976f-49b3-84f1-05b427f8e138');
  });
});
