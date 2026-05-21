import { describe, it, expect } from 'vitest';
import {
  validateBillingData,
  validateShippingData,
  SPANISH_PROVINCES,
  type BillingData,
  type ShippingData,
} from './checkoutService';

describe('checkoutService', () => {
  describe('validateBillingData', () => {
    const validParticular: BillingData = {
      customerType: 'particular',
      firstName: 'Juan',
      lastName: 'García López',
      email: 'juan@example.com',
      phone: '+34 600 123 456',
      address: 'Calle Mayor 10, 2ºA',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'España',
    };

    const validEmpresa: BillingData = {
      ...validParticular,
      customerType: 'empresa',
      companyName: 'Acme S.L.',
      cif: 'B12345678',
    };

    it('valida correctamente datos de particular completos', () => {
      const errors = validateBillingData(validParticular);
      expect(errors).toHaveLength(0);
    });

    it('valida correctamente datos de empresa completos', () => {
      const errors = validateBillingData(validEmpresa);
      expect(errors).toHaveLength(0);
    });

    it('detecta campos obligatorios vacíos', () => {
      const errors = validateBillingData({
        customerType: 'particular',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
      });
      expect(errors.length).toBeGreaterThanOrEqual(7);
      expect(errors).toContain('El nombre es obligatorio');
      expect(errors).toContain('Los apellidos son obligatorios');
      expect(errors).toContain('El email es obligatorio');
      expect(errors).toContain('El teléfono es obligatorio');
      expect(errors).toContain('La dirección es obligatoria');
      expect(errors).toContain('El código postal es obligatorio');
      expect(errors).toContain('La ciudad es obligatoria');
    });

    it('detecta email inválido', () => {
      const errors = validateBillingData({
        ...validParticular,
        email: 'no-es-un-email',
      });
      expect(errors).toContain('El email no es válido');
    });

    it('detecta código postal inválido', () => {
      const errors = validateBillingData({
        ...validParticular,
        postalCode: '123',
      });
      expect(errors).toContain('El código postal debe tener 5 dígitos');
    });

    it('detecta campos de empresa vacíos cuando customerType es empresa', () => {
      const errors = validateBillingData({
        ...validParticular,
        customerType: 'empresa',
        companyName: '',
        cif: '',
      });
      expect(errors).toContain('La razón social es obligatoria para empresas');
      expect(errors).toContain('El CIF/NIF es obligatorio para empresas');
    });

    it('no exige campos de empresa para particulares', () => {
      const errors = validateBillingData({
        ...validParticular,
        customerType: 'particular',
        companyName: '',
        cif: '',
      });
      expect(errors).not.toContain('La razón social es obligatoria para empresas');
      expect(errors).not.toContain('El CIF/NIF es obligatorio para empresas');
    });
  });

  describe('validateShippingData', () => {
    it('no valida nada si sameAsBilling es true', () => {
      const errors = validateShippingData({
        sameAsBilling: true,
      });
      expect(errors).toHaveLength(0);
    });

    it('valida campos obligatorios cuando sameAsBilling es false', () => {
      const errors = validateShippingData({
        sameAsBilling: false,
        firstName: '',
        lastName: '',
        address: '',
        postalCode: '',
        city: '',
        province: '',
      });
      expect(errors.length).toBeGreaterThanOrEqual(5);
      expect(errors).toContain('El nombre de envío es obligatorio');
      expect(errors).toContain('La dirección de envío es obligatoria');
    });

    it('valida correctamente datos de envío completos', () => {
      const errors = validateShippingData({
        sameAsBilling: false,
        firstName: 'María',
        lastName: 'López',
        address: 'Calle Secundaria 5',
        postalCode: '08001',
        city: 'Barcelona',
        province: 'Barcelona',
        country: 'España',
      });
      expect(errors).toHaveLength(0);
    });

    it('detecta código postal de envío inválido', () => {
      const errors = validateShippingData({
        sameAsBilling: false,
        firstName: 'María',
        lastName: 'López',
        address: 'Calle Secundaria 5',
        postalCode: 'ABC',
        city: 'Barcelona',
        province: 'Barcelona',
      });
      expect(errors).toContain('El código postal de envío debe tener 5 dígitos');
    });
  });

  describe('SPANISH_PROVINCES', () => {
    it('contiene las 52 provincias españolas', () => {
      expect(SPANISH_PROVINCES.length).toBe(52);
    });

    it('incluye provincias principales', () => {
      expect(SPANISH_PROVINCES).toContain('Madrid');
      expect(SPANISH_PROVINCES).toContain('Barcelona');
      expect(SPANISH_PROVINCES).toContain('Sevilla');
      expect(SPANISH_PROVINCES).toContain('Valencia');
    });

    it('incluye Ceuta y Melilla', () => {
      expect(SPANISH_PROVINCES).toContain('Ceuta');
      expect(SPANISH_PROVINCES).toContain('Melilla');
    });

    it('está ordenada alfabéticamente', () => {
      const sorted = [...SPANISH_PROVINCES].sort((a, b) => a.localeCompare(b, 'es'));
      expect(SPANISH_PROVINCES).toEqual(sorted);
    });
  });
});
