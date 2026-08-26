import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

export interface UserProfileData {
  email: string;
  is_newsletter_subscribed: boolean;
  company_type?: 'small' | 'medium' | 'agency' | 'ngo' | 'individual';
  merch_usage?: 'corporate' | 'uniforms' | 'gifts' | 'welcome' | 'ecommerce';
  order_volume?: 'small' | 'medium' | 'large';
  priority_focus?: string[];
  extra_notes?: string;
}

export interface ProfileResponse {
  data: UserProfileData | null;
  error: PostgrestError | AuthError | null;
}

export interface PasswordChangeResponse {
  success: boolean;
  error: AuthError | null;
}

/**
 * Obtiene el perfil completo del usuario para este site (datos personales + onboarding)
 * Si no existe, lo crea automáticamente con site_id
 */
export async function getUserProfile(
  supabaseUserId: string
): Promise<ProfileResponse> {
  try {
    const siteId = await getSiteId();

    const { data, error } = await supabase
      .from('user_personalization')
      .select('email, is_newsletter_subscribed')
      .eq('supabase_user_id', supabaseUserId)
      .eq('site_id', siteId)
      .single();

    // Si no existe (error PGRST116), crear uno nuevo con site_id
    if (error && error.code === 'PGRST116') {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email || '';

      const { data: newProfile, error: insertError } = await supabase
        .from('user_personalization')
        .insert({
          supabase_user_id: supabaseUserId,
          email: email,
          is_newsletter_subscribed: false,
          site_id: siteId,
        })
        .select('email, is_newsletter_subscribed')
        .single();

      if (insertError) {
        return { data: null, error: insertError };
      }

      return {
        data: newProfile as UserProfileData,
        error: null,
      };
    }

    if (error) {
      return { data: null, error };
    }

    return {
      data: data as UserProfileData,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err as PostgrestError,
    };
  }
}

/**
 * Actualiza el perfil del usuario para este site
 */
export async function updateUserProfile(
  supabaseUserId: string,
  updates: Partial<UserProfileData>
): Promise<ProfileResponse> {
  try {
    const siteId = await getSiteId();

    const { data, error } = await supabase
      .from('user_personalization')
      .update(updates)
      .eq('supabase_user_id', supabaseUserId)
      .eq('site_id', siteId)
      .select('email, is_newsletter_subscribed')
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: data as UserProfileData,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err as PostgrestError,
    };
  }
}

/**
 * Cambia la contraseña del usuario (no depende de site_id, es auth global)
 */
export async function changePassword(
  newPassword: string
): Promise<PasswordChangeResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err as AuthError,
    };
  }
}

/**
 * Obtiene el email actual del usuario desde la sesión (no depende de site_id)
 */
export async function getCurrentUserEmail(): Promise<{
  email: string | null;
  error: AuthError | null;
}> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { email: null, error };
    }

    return { email: user?.email || null, error: null };
  } catch (err) {
    return {
      email: null,
      error: err as AuthError,
    };
  }
}
