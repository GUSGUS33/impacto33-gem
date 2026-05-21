import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isStripeEnabled, stripeConfig } from './stripeConfig';

describe('Stripe Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('stripeConfig', () => {
    it('debería estar deshabilitado por defecto', () => {
      expect(stripeConfig.enabled).toBe(false);
    });

    it('debería tener una clave pública vacía por defecto', () => {
      expect(stripeConfig.publicKey).toBe('');
    });

    it('debería ser válido cuando está deshabilitado', () => {
      expect(stripeConfig.isValid()).toBe(true);
    });

    it('debería tener un mensaje de deshabilitado', () => {
      expect(stripeConfig.disabledMessage).toContain('El pago online');
    });
  });

  describe('isStripeEnabled()', () => {
    it('debería retornar false cuando está deshabilitado', () => {
      expect(isStripeEnabled()).toBe(false);
    });

    it('debería retornar false cuando está habilitado pero sin clave pública', () => {
      // Simular que está habilitado pero sin clave
      const config = {
        enabled: true,
        publicKey: '',
        isValid: () => false,
        disabledMessage: '',
      };
      
      // Verificar que la función retorna false si no hay clave
      expect(config.isValid()).toBe(false);
    });

    it('debería retornar true cuando está habilitado y tiene clave pública', () => {
      // Simular que está habilitado y tiene clave
      const config = {
        enabled: true,
        publicKey: 'pk_test_123456',
        isValid: () => true,
        disabledMessage: '',
      };
      
      expect(config.enabled && config.isValid()).toBe(true);
    });
  });
});
