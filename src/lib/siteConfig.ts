/**
 * Multi-site configuration for impacto33.
 *
 * This module provides the site_id and slug used to filter all business
 * queries in the shared Supabase database.  Every service that reads or
 * writes to tables with a `site_id` column MUST use these constants so
 * that impacto33 never leaks data to/from other tenants.
 *
 * The site_id is resolved once from `public.sites` and cached for the
 * lifetime of the browser tab.  A hard-coded fallback is provided so
 * that the app works even if the `sites` table is temporarily
 * unreachable (e.g. during cold-start).
 */

import { supabase } from './supabaseClient';

// ── Hard-coded fallback (matches `public.sites` row for impacto33) ──
export const SITE_SLUG = 'impacto33';
export const SITE_ID_FALLBACK = '6321b8a8-976f-49b3-84f1-05b427f8e138';

// ── Runtime cache ──
let _resolvedSiteId: string | null = null;
let _resolvePromise: Promise<string> | null = null;

/**
 * Returns the UUID `site_id` for impacto33.
 *
 * On the first call it queries `public.sites` and caches the result.
 * Subsequent calls return the cached value immediately.  If the query
 * fails, the hard-coded fallback is used (and cached).
 */
export async function getSiteId(): Promise<string> {
  if (_resolvedSiteId) return _resolvedSiteId;

  if (!_resolvePromise) {
    _resolvePromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id')
          .eq('slug', SITE_SLUG)
          .single();

        if (error || !data) {
          console.warn(
            `[siteConfig] Could not resolve site_id for "${SITE_SLUG}", using fallback.`,
            error?.message,
          );
          _resolvedSiteId = SITE_ID_FALLBACK;
        } else {
          _resolvedSiteId = data.id;
        }
      } catch {
        console.warn('[siteConfig] Exception resolving site_id, using fallback.');
        _resolvedSiteId = SITE_ID_FALLBACK;
      }
      return _resolvedSiteId!;
    })();
  }

  return _resolvePromise;
}

/**
 * Synchronous getter — returns the cached site_id or the fallback.
 * Prefer `getSiteId()` (async) when possible.
 */
export function getSiteIdSync(): string {
  return _resolvedSiteId ?? SITE_ID_FALLBACK;
}

// Eagerly resolve on module load so subsequent sync calls work.
if (typeof window !== 'undefined') {
  getSiteId().catch(() => {});
}
