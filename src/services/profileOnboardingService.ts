import { supabase } from '@/lib/supabaseClient';
import { getSiteId } from '@/lib/siteConfig';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

export interface OnboardingData {
  company_type: 'small' | 'medium' | 'agency' | 'ngo' | 'individual';
  merch_usage: 'corporate' | 'uniforms' | 'gifts' | 'welcome' | 'ecommerce';
  order_volume: 'small' | 'medium' | 'large';
  priority_focus: string[];
  extra_notes?: string;
}

export interface OnboardingStatus {
  isCompleted: boolean;
  data?: OnboardingData;
  error?: PostgrestError | null;
}

/**
 * Obtiene el estado del onboarding del usuario para este site
 */
export async function getOnboardingStatus(
  supabaseUserId: string
): Promise<OnboardingStatus> {
  try {
    const siteId = await getSiteId();

    const { data, error } = await supabase
      .from('user_personalization')
      .select(
        'profile_onboarding_completed, company_type, merch_usage, order_volume, priority_focus, extra_notes'
      )
      .eq('supabase_user_id', supabaseUserId)
      .eq('site_id', siteId)
      .single();

    if (error) {
      return { isCompleted: false, error };
    }

    if (!data) {
      return { isCompleted: false };
    }

    return {
      isCompleted: data.profile_onboarding_completed || false,
      data: data.profile_onboarding_completed
        ? {
            company_type: data.company_type,
            merch_usage: data.merch_usage,
            order_volume: data.order_volume,
            priority_focus: data.priority_focus || [],
            extra_notes: data.extra_notes,
          }
        : undefined,
    };
  } catch (err) {
    return { isCompleted: false };
  }
}

/**
 * Guarda los datos del onboarding y marca como completado para este site
 */
export async function saveOnboardingData(
  supabaseUserId: string,
  data: OnboardingData
): Promise<{ success: boolean; error: PostgrestError | null }> {
  try {
    const siteId = await getSiteId();

    const { error } = await supabase
      .from('user_personalization')
      .update({
        company_type: data.company_type,
        merch_usage: data.merch_usage,
        order_volume: data.order_volume,
        priority_focus: data.priority_focus,
        extra_notes: data.extra_notes || null,
        profile_onboarding_completed: true,
      })
      .eq('supabase_user_id', supabaseUserId)
      .eq('site_id', siteId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as PostgrestError };
  }
}

/**
 * Marca el onboarding como saltado sin guardar datos para este site
 */
export async function skipOnboarding(
  supabaseUserId: string
): Promise<{ success: boolean; error: PostgrestError | null }> {
  try {
    const siteId = await getSiteId();

    const { error } = await supabase
      .from('user_personalization')
      .update({
        profile_onboarding_completed: true,
      })
      .eq('supabase_user_id', supabaseUserId)
      .eq('site_id', siteId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as PostgrestError };
  }
}
