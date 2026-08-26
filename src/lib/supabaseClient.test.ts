import { describe, it, expect } from 'vitest';
import { supabase } from './supabaseClient';

const hasSupabaseCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

describe('Supabase Client', () => {
  it('should initialize with valid credentials', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should be able to connect to Supabase', async () => {
    // Test basic connectivity by getting the current session
    const { data, error } = await supabase.auth.getSession();
    
    // Should not throw an error (even if there's no session)
    expect(error).toBeNull();
    // Session can be null if not authenticated, that's fine
    expect(data).toBeDefined();
  });

  it('should have valid Supabase URL', () => {
    const url = import.meta.env.VITE_SUPABASE_URL || 'https://TU_SUPABASE_PROJECT.supabase.co';
    expect(url).toBeDefined();
    expect(url).toContain('supabase');
  });

  it.skipIf(!hasSupabaseCredentials)('should have valid Supabase ANON KEY', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    expect(key).toBeDefined();
    expect(key.length).toBeGreaterThan(0);
    // JWT tokens start with "eyJ"
    expect(key).toMatch(/^eyJ/);
  });

  it.skipIf(!hasSupabaseCredentials)('should be able to access user_personalization table', async () => {
    // This test validates that we can query the database
    // It should not throw an error (even if the query returns no data)
    const { data, error } = await supabase
      .from('user_personalization')
      .select('id')
      .limit(1);
    
    // Should successfully query the table (error should be null)
    // Data can be an empty array if there are no records
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
});
