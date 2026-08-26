import { describe, it, expect } from 'vitest';
import { validateAddressForm, type AddressFormData } from './addressService';

const validAddress: AddressFormData = {
  label: 'Casa',
  address_type: 'both',
  is_default_billing: true,
  is_default_shipping: true,
  customer_type: 'particular',
  first_name: 'Juan',
  last_name: 'García',
  email: 'juan@test.com',
  phone: '+34600000000',
  address: 'Calle Mayor 1',
  postal_code: '28001',
  city: 'Madrid',
  province: 'Madrid',
  country: 'España',
};

describe('addressService - validateAddressForm', () => {
  it('should return no errors for valid particular address', () => {
    const errors = validateAddressForm(validAddress);
    expect(errors).toHaveLength(0);
  });

  it('should return no errors for valid empresa address', () => {
    const empresaAddress: AddressFormData = {
      ...validAddress,
      customer_type: 'empresa',
      company_name: 'Empresa SL',
      cif: 'B12345678',
    };
    const errors = validateAddressForm(empresaAddress);
    expect(errors).toHaveLength(0);
  });

  it('should require label', () => {
    const errors = validateAddressForm({ ...validAddress, label: '' });
    expect(errors).toContain('El nombre de la dirección es obligatorio');
  });

  it('should require first_name', () => {
    const errors = validateAddressForm({ ...validAddress, first_name: '' });
    expect(errors).toContain('El nombre es obligatorio');
  });

  it('should require last_name', () => {
    const errors = validateAddressForm({ ...validAddress, last_name: '' });
    expect(errors).toContain('Los apellidos son obligatorios');
  });

  it('should require email', () => {
    const errors = validateAddressForm({ ...validAddress, email: '' });
    expect(errors).toContain('El email es obligatorio');
  });

  it('should validate email format', () => {
    const errors = validateAddressForm({ ...validAddress, email: 'invalid-email' });
    expect(errors).toContain('El email no es válido');
  });

  it('should require phone', () => {
    const errors = validateAddressForm({ ...validAddress, phone: '' });
    expect(errors).toContain('El teléfono es obligatorio');
  });

  it('should require address', () => {
    const errors = validateAddressForm({ ...validAddress, address: '' });
    expect(errors).toContain('La dirección es obligatoria');
  });

  it('should require postal_code', () => {
    const errors = validateAddressForm({ ...validAddress, postal_code: '' });
    expect(errors).toContain('El código postal es obligatorio');
  });

  it('should validate postal_code format (5 digits)', () => {
    const errors = validateAddressForm({ ...validAddress, postal_code: '123' });
    expect(errors).toContain('El código postal debe tener 5 dígitos');
  });

  it('should require city', () => {
    const errors = validateAddressForm({ ...validAddress, city: '' });
    expect(errors).toContain('La ciudad es obligatoria');
  });

  it('should require province', () => {
    const errors = validateAddressForm({ ...validAddress, province: '' });
    expect(errors).toContain('La provincia es obligatoria');
  });

  it('should require company_name for empresa type', () => {
    const errors = validateAddressForm({
      ...validAddress,
      customer_type: 'empresa',
      company_name: '',
      cif: 'B12345678',
    });
    expect(errors).toContain('La razón social es obligatoria para empresas');
  });

  it('should require cif for empresa type', () => {
    const errors = validateAddressForm({
      ...validAddress,
      customer_type: 'empresa',
      company_name: 'Empresa SL',
      cif: '',
    });
    expect(errors).toContain('El CIF/NIF es obligatorio para empresas');
  });

  it('should not require company fields for particular type', () => {
    const errors = validateAddressForm({
      ...validAddress,
      customer_type: 'particular',
      company_name: '',
      cif: '',
    });
    expect(errors).toHaveLength(0);
  });

  it('should return multiple errors for completely empty form', () => {
    const emptyForm: AddressFormData = {
      label: '',
      address_type: 'both',
      is_default_billing: false,
      is_default_shipping: false,
      customer_type: 'particular',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      province: '',
      country: 'España',
    };
    const errors = validateAddressForm(emptyForm);
    expect(errors.length).toBeGreaterThanOrEqual(7);
  });
});
