import { supabase } from '@/lib/supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Helper to handle missing Supabase client
const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

/**
 * Registra un nuevo usuario con email y contraseña
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Cierra la sesión actual
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  return { error };
}

/**
 * Obtiene la sesión actual
 * Retorna null session si Supabase no está configurado (para permitir que la app funcione sin auth)
 */
export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  if (!supabase) {
    return { session: null, error: null };
  }
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    error,
  };
}

/**
 * Reenvía el email de confirmación a un usuario
 */
export async function resendConfirmationEmail(
  email: string
): Promise<{ error: AuthError | null }> {
  const client = requireSupabase();
  const { error } = await client.auth.resend({
    type: 'signup',
    email,
  });

  return { error };
}

/**
 * Envía un email de recuperación de contraseña
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: AuthError | null }> {
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { error };
}

/**
 * Actualiza la contraseña con el token de recuperación
 */
export async function updatePassword(
  newPassword: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const client = requireSupabase();
  const { data, error } = await client.auth.updateUser({
    password: newPassword,
  });

  return {
    user: data.user || null,
    error,
  };
}

/**
 * Inicia sesión con Google OAuth
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/inicio`,
    },
  });

  return { error };
}

/**
 * Suscribe a cambios en el estado de autenticación
 * Retorna un mock subscription si Supabase no está configurado
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
