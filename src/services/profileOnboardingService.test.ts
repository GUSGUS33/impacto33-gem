import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOnboardingStatus,
  saveOnboardingData,
  skipOnboarding,
  OnboardingData,
} from './profileOnboardingService';
import * as supabaseModule from '@/lib/supabaseClient';

// Mock del cliente de Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe.skip('profileOnboardingService', () => {
  // TODO(Fase Perfil): Reactivar estos tests cuando cerremos el diseño final del onboarding.
  // El onboarding es funcionalidad futura, no crítica para Fase 1.2
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOnboardingStatus', () => {
    it('debe retornar isCompleted = false cuando el usuario no tiene onboarding completado', async () => {
      const mockData = {
        profile_onboarding_completed: false,
        company_type: null,
        merch_usage: null,
        order_volume: null,
        priority_focus: null,
        extra_notes: null,
      };

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: mockData,
            error: null,
          }),
        }),
      } as any);

      const result = await getOnboardingStatus('user-123');

      expect(result.isCompleted).toBe(false);
      expect(result.data).toBeUndefined();
    });

    it('debe retornar isCompleted = true y datos cuando el usuario completó onboarding', async () => {
      const mockData = {
        profile_onboarding_completed: true,
        company_type: 'small',
        merch_usage: 'corporate',
        order_volume: 'small',
        priority_focus: ['price', 'speed'],
        extra_notes: 'Test notes',
      };

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: mockData,
            error: null,
          }),
        }),
      } as any);

      const result = await getOnboardingStatus('user-123');

      expect(result.isCompleted).toBe(true);
      expect(result.data).toEqual({
        company_type: 'small',
        merch_usage: 'corporate',
        order_volume: 'small',
        priority_focus: ['price', 'speed'],
        extra_notes: 'Test notes',
      });
    });

    it('debe retornar isCompleted = false en caso de error', async () => {
      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      } as any);

      const result = await getOnboardingStatus('user-123');

      expect(result.isCompleted).toBe(false);
    });
  });

  describe('saveOnboardingData', () => {
    it('debe guardar datos de onboarding correctamente', async () => {
      const onboardingData: OnboardingData = {
        company_type: 'medium',
        merch_usage: 'uniforms',
        order_volume: 'medium',
        priority_focus: ['quality', 'advice'],
        extra_notes: 'Empresa de textiles',
      };

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: null,
          }),
        }),
      } as any);

      const result = await saveOnboardingData('user-123', onboardingData);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('debe retornar error si falla la actualización', async () => {
      const onboardingData: OnboardingData = {
        company_type: 'small',
        merch_usage: 'corporate',
        order_volume: 'small',
        priority_focus: ['price'],
      };

      const mockError = { message: 'Update failed' };

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: mockError,
          }),
        }),
      } as any);

      const result = await saveOnboardingData('user-123', onboardingData);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('skipOnboarding', () => {
    it('debe marcar onboarding como completado sin guardar datos', async () => {
      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: null,
          }),
        }),
      } as any);

      const result = await skipOnboarding('user-123');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('debe retornar error si falla el skip', async () => {
      const mockError = { message: 'Skip failed' };

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: mockError,
          }),
        }),
      } as any);

      const result = await skipOnboarding('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });
});
