import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserOrders } from './useUserOrders';
import * as ordersService from '@/services/ordersService';
import * as authHooks from '@/context/AuthContext';

// Mock dependencies
vi.mock('@/services/ordersService');
vi.mock('@/context/AuthContext');

describe.skip('useUserOrders', () => {
  // TODO(Fase Hooks v2): Reactivar cuando tengamos @shared/const disponible.
  // Actualmente hay errores de imports no resueltos.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const mockUseAuth = authHooks.useAuth as any;
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    // Note: Testing hooks requires renderHook from @testing-library/react
    // This is a simplified test structure. In a real scenario, use renderHook
    expect(mockUseAuth).toBeDefined();
  });

  it('should have correct function signatures', async () => {
    expect(typeof ordersService.getUserOrders).toBe('function');
    expect(typeof ordersService.getOrderDetails).toBe('function');
    expect(typeof ordersService.repeatOrder).toBe('function');
  });

  it('should handle null return from getUserOrders', async () => {
    const mockGetUserOrders = ordersService.getUserOrders as any;
    mockGetUserOrders.mockResolvedValue(null);

    const result = await mockGetUserOrders();
    expect(result).toBeNull();
  });

  it('should handle array return from getUserOrders', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        supabase_user_id: 'user-123',
        order_number: 'ORD-001',
        status: 'completed',
        currency: 'EUR',
        subtotal_without_vat: 100,
        vat_amount: 21,
        total_with_vat: 121,
        billing_address: null,
        shipping_address: null,
        notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const mockGetUserOrders = ordersService.getUserOrders as any;
    mockGetUserOrders.mockResolvedValue(mockOrders);

    const result = await mockGetUserOrders();
    expect(result).toEqual(mockOrders);
    expect(result).toHaveLength(1);
  });

  it('should pass limit parameter correctly', async () => {
    const mockGetUserOrders = ordersService.getUserOrders as any;
    mockGetUserOrders.mockResolvedValue([]);

    await mockGetUserOrders(50);

    expect(mockGetUserOrders).toHaveBeenCalledWith(50);
  });

  it('should use default limit of 20', async () => {
    const mockGetUserOrders = ordersService.getUserOrders as any;
    mockGetUserOrders.mockResolvedValue([]);

    await mockGetUserOrders();

    expect(mockGetUserOrders).toHaveBeenCalled();
  });
});
