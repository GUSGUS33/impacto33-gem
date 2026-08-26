import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: reemplazar por process.env.NEXT_PUBLIC_* definitivos en migración completa
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | undefined;

// Intentar crear el cliente real si las credenciales están disponibles
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseInstance = undefined;
  }
}

// Si no hay cliente real, crear un mock que no rompa la app
if (!supabaseInstance!) {
  console.warn('⚠️ Supabase credentials not found. Creating mock client. Auth features will not work.');
  
  // Mock client que retorna valores seguros para todas las operaciones
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured', status: 500 } as any }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured', status: 500 } as any }),
    signInWithOAuth: async () => ({ data: {}, error: { message: 'Supabase not configured', status: 500 } as any }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured', status: 500 } as any }),
    resetPasswordForEmail: async () => ({ data: {}, error: { message: 'Supabase not configured', status: 500 } as any }),
    resend: async () => ({ data: {}, error: { message: 'Supabase not configured', status: 500 } as any }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  const mockFrom = () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null }),
      }),
    }),
    insert: async () => ({ data: null, error: { message: 'Supabase not configured', status: 500 } as any }),
    update: () => ({
      eq: async () => ({ data: null, error: { message: 'Supabase not configured', status: 500 } as any }),
    }),
    delete: () => ({
      eq: async () => ({ error: null }),
    }),
  });

  supabaseInstance = {
    auth: mockAuth,
    from: mockFrom,
  } as any;
}

export const supabase: SupabaseClient = supabaseInstance!;
