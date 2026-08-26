import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getCurrentUserEmail,
  type UserProfileData,
} from './profileService';
import { supabase } from '@/lib/supabaseClient';

// Mock supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

// Mock siteConfig
vi.mock('@/lib/siteConfig', () => ({
  getSiteId: vi.fn().mockResolvedValue('6321b8a8-976f-49b3-84f1-05b427f8e138'),
  getSiteIdSync: vi.fn().mockReturnValue('6321b8a8-976f-49b3-84f1-05b427f8e138'),
  SITE_SLUG: 'impacto33',
  SITE_ID_FALLBACK: '6321b8a8-976f-49b3-84f1-05b427f8e138',
}));

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfileData = {
        email: 'test@example.com',
        is_newsletter_subscribed: true,
        company_type: 'medium',
        merch_usage: 'corporate',
        order_volume: 'large',
        priority_focus: ['quality', 'speed'],
        extra_notes: 'Test notes',
      };

      // Chain: .from().select().eq('supabase_user_id').eq('site_id').single()
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getUserProfile('user-123');

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getUserProfile('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle network errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await getUserProfile('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        is_newsletter_subscribed: false,
        company_type: 'small' as const,
      };

      const mockUpdatedProfile: UserProfileData = {
        email: 'test@example.com',
        is_newsletter_subscribed: false,
        company_type: 'small',
      };

      // Chain: .from().update().eq('supabase_user_id').eq('site_id').select().single()
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUpdatedProfile,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await updateUserProfile('user-123', updates);

      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const mockError = { message: 'Update failed' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: mockError,
                }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await updateUserProfile('user-123', {
        is_newsletter_subscribed: true,
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await changePassword('newPassword123');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });

    it('should handle password change errors', async () => {
      const mockError = { message: 'Password update failed' };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: mockError,
      } as any);

      const result = await changePassword('newPassword123');

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it('should handle network errors during password change', async () => {
      vi.mocked(supabase.auth.updateUser).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await changePassword('newPassword123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getCurrentUserEmail', () => {
    it('should get current user email successfully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: {
            email: 'current@example.com',
          },
        },
        error: null,
      } as any);

      const result = await getCurrentUserEmail();

      expect(result.email).toBe('current@example.com');
      expect(result.error).toBeNull();
    });

    it('should handle auth errors', async () => {
      const mockError = { message: 'Auth error' };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError,
      } as any);

      const result = await getCurrentUserEmail();

      expect(result.email).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle missing user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await getCurrentUserEmail();

      expect(result.email).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle network errors', async () => {
      vi.mocked(supabase.auth.getUser).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await getCurrentUserEmail();

      expect(result.email).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
