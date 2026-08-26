import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUpWithEmail, signInWithEmail, resendConfirmationEmail, resetPasswordForEmail, updatePassword, signInWithGoogle } from './authService';
import * as supabaseModule from '@/lib/supabaseClient';

// Mock del cliente de Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('debe registrar un usuario correctamente', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('debe retornar error si el email ya está registrado', async () => {
      const mockError = {
        message: 'User already registered',
        status: 422,
      };

      vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signUpWithEmail('existing@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithEmail', () => {
    it('debe iniciar sesión correctamente', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('debe retornar error si las credenciales son inválidas', async () => {
      const mockError = {
        message: 'Invalid login credentials',
        status: 401,
      };

      vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('debe retornar error si el email no está confirmado', async () => {
      const mockError = {
        message: 'Email not confirmed',
        status: 422,
      };

      vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signInWithEmail('unconfirmed@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error?.message).toContain('Email not confirmed');
    });
  });

  describe('resendConfirmationEmail', () => {
    it('debe reenviar el email de confirmación correctamente', async () => {
      vi.mocked(supabaseModule.supabase.auth.resend).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any);

      const result = await resendConfirmationEmail('test@example.com');

      expect(result.error).toBeNull();
      expect(supabaseModule.supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });

    it('debe retornar error si el email no existe', async () => {
      const mockError = {
        message: 'User not found',
        status: 404,
      };

      vi.mocked(supabaseModule.supabase.auth.resend).mockResolvedValueOnce({
        data: {},
        error: mockError,
      } as any);

      const result = await resendConfirmationEmail('nonexistent@example.com');

      expect(result.error).toEqual(mockError);
    });

    it('debe retornar error si hay un problema con Supabase', async () => {
      const mockError = {
        message: 'Service temporarily unavailable',
        status: 503,
      };

      vi.mocked(supabaseModule.supabase.auth.resend).mockResolvedValueOnce({
        data: {},
        error: mockError,
      } as any);

      const result = await resendConfirmationEmail('test@example.com');

      expect(result.error).toEqual(mockError);
    });
  });
});

describe('resetPasswordForEmail', () => {
  it('debe enviar email de recuperación de contraseña', async () => {
    vi.mocked(supabaseModule.supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: null,
    } as any);

    const result = await resetPasswordForEmail('test@example.com');

    expect(result.error).toBeNull();
    expect(supabaseModule.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/reset-password'),
      })
    );
  });
});

describe('updatePassword', () => {
  it('debe actualizar la contraseña correctamente', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    vi.mocked(supabaseModule.supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    const result = await updatePassword('NewPassword123');

    expect(result.user).toEqual(mockUser);
    expect(result.error).toBeNull();
    expect(supabaseModule.supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewPassword123',
    });
  });
});

describe('signInWithGoogle', () => {
  it('debe iniciar OAuth con Google', async () => {
    vi.mocked(supabaseModule.supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: {},
      error: null,
    } as any);

    const result = await signInWithGoogle();

    expect(result.error).toBeNull();
    expect(supabaseModule.supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/inicio'),
        }),
      })
    );
  });
});
