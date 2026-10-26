import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { calculateScaledPrice, formatEuroPrice } from '../src/services/pricingService';
import { PRICING_FAMILIES } from '../src/data/pricing/pricing-families';
import { captureQuoteSnapshot, getDeliveryDates } from '../src/lib/quoteSnapshot';
import type { QuoteData } from '../src/services/emailService';
import type { TrpcContext } from './_core/context';

const mocks = vi.hoisted(() => ({ sendMail: vi.fn(), verify: vi.fn(), submit: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail: mocks.sendMail, verify: mocks.verify }) } }));
vi.mock('../src/contexts/QuoteContext', () => ({ useQuote: () => ({ submitQuote: mocks.submit }) }));
// No persistence or network side effects; the pricing hook, modal, router and email renderer are real.
vi.mock('../src/hooks/useProductConfig', () => ({ useProductConfig: () => ({}) }));
import { quoteRouter, quoteSchema } from './quoteRouter';
import ProductQuoteCalculator from '../src/components/pricing/product-quote/ProductQuoteCalculator';

const ctx = { user: null, req: {}, res: {} } as TrpcContext;
function data(): QuoteData {
  const pricing = calculateScaledPrice(6, 50, ['frontal'], PRICING_FAMILIES.ropa);
  const dates = getDeliveryDates('t_shirts', new Date('2026-10-24T12:00:00'));
  return {
    customer: { name: 'Prueba privada', email: 'no-send@example.invalid', phone: 'privado', message: 'mensaje privado' },
    product: { id: 'dribe-test', sku: 'CA6709', name: 'DRIBE', image: '', selectedColor: 'negro', quantities: { M: 50 }, selectedZones: ['frontal'] },
    pricing,
    quoteSnapshot: captureQuoteSnapshot(pricing, 50, 'urgente', dates.urgente, 'DTF'),
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SMTP_HOST', 'smtp.example.invalid');
  vi.stubEnv('SMTP_USER', 'test@example.invalid');
  vi.stubEnv('SMTP_PASS', 'test-only');
  mocks.sendMail.mockResolvedValue({ messageId: 'fake' });
  mocks.verify.mockResolvedValue(true);
  mocks.submit.mockImplementation((payload: QuoteData) => quoteRouter.createCaller(ctx).submit(payload));
  localStorage.clear();
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('validación sin reconstruir precios', () => {
  it.each([0, -1, 1.5, NaN, Infinity])('rechaza cantidad %s antes de enviar', async quantity => {
    const payload = data(); payload.product.quantities.M = quantity;
    await expect(quoteRouter.createCaller(ctx).submit(payload)).rejects.toThrow();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
  it('rechaza pedido vacío, suma inconsistente y mínimo incumplido', () => {
    const p = data(); p.product.quantities = {};
    expect(quoteSchema.safeParse(p).success).toBe(false);
    p.product.quantities = { M: 49 };
    expect(quoteSchema.safeParse(p).success).toBe(false);
    p.product.quantities = { M: 24 }; p.pricing.cantidadTotal = 24;
    expect(quoteSchema.safeParse(p).success).toBe(false);
    p.product.quantities = { M: 50 }; p.pricing.cantidadTotal = 50; p.pricing.cantidadMinima = 51;
    expect(quoteSchema.safeParse(p).success).toBe(false);
  });
  it.each([NaN, Infinity, -Infinity, -1])('rechaza total inválido %s en ambos bloques', value => {
    const p = data(); p.pricing.precioTotalSinIVA = value;
    expect(quoteSchema.safeParse(p).success).toBe(false);
    const n = data(); n.quoteSnapshot!.totalIncVat = value;
    expect(quoteSchema.safeParse(n).success).toBe(false);
  });
  it('acepta el payload antiguo sin snapshot, conservando sus importes', async () => {
    const p = data(); delete p.quoteSnapshot;
    await quoteRouter.createCaller(ctx).submit(p);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.sendMail.mock.calls[0][0].html).toContain(formatEuroPrice(p.pricing.precioTotalConIVA));
  });
  it('registra payload técnico sin contacto, mensaje ni imagen', async () => {
    const logs = vi.spyOn(console, 'info').mockImplementation(() => {});
    await quoteRouter.createCaller(ctx).submit(data());
    const text = JSON.stringify(logs.mock.calls);
    expect(text).toContain('CA6709');
    expect(text).toContain('received');
    expect(text).toContain('sent');
    expect(text).not.toContain('no-send@example.invalid');
    expect(text).not.toContain('Prueba privada');
    expect(text).not.toContain('mensaje privado');
  });
  it('no reconstruye importes monetarios en el servidor o en los emails', async () => {
    const p = data(); p.quoteSnapshot!.totalIncVat = 1234.56;
    await quoteRouter.createCaller(ctx).submit(p);
    for (const [mail] of mocks.sendMail.mock.calls) expect(mail.html).toContain(formatEuroPrice(1234.56));
  });
  it('escapa también los nuevos metadatos en ambas plantillas', async () => {
    const p = data();
    p.product.sku = '<script>sku</script>';
    p.quoteSnapshot!.technique.label = '<img onerror=alert(1)>';
    p.quoteSnapshot!.delivery.label = '<b>Urgente</b>';
    await quoteRouter.createCaller(ctx).submit(p);
    for (const [mail] of mocks.sendMail.mock.calls) {
      expect(mail.html).toContain('&lt;script&gt;sku&lt;/script&gt;');
      expect(mail.html).toContain('&lt;img onerror=alert(1)&gt;');
      expect(mail.html).not.toContain('<script>');
    }
  });
});

it('usa el formateador único es-ES incluso en límites de redondeo', () => {
  expect(formatEuroPrice(1.005)).toBe(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1.005));
  expect(formatEuroPrice(1234.5)).toContain('1234,50');
});

it('50 DRIBE Frontal Urgente: UI → popup → payload → router → dos emails idénticos, sin SMTP real', async () => {
  const product = {
    __typename: 'VariableProduct', id: 'dribe-test', sku: 'CA6709', slug: 'dribe', name: 'DRIBE', price: '6,00 €',
    productCategories: { nodes: [{ slug: 't_shirts' }] }, attributes: { nodes: [] },
    featuredImage: { node: { sourceUrl: '/test.png' } },
    variations: { nodes: [{ id: 'v1', price: '6,00 €', stockStatus: 'IN_STOCK', stockQuantity: 500,
      attributes: { nodes: [{ name: 'pa_color', value: 'negro' }, { name: 'pa_size', value: 'M' }] } }] },
  } as unknown as React.ComponentProps<typeof ProductQuoteCalculator>['product'];
  const { container } = render(<ProductQuoteCalculator product={product} />);
  await waitFor(() => expect(screen.getByRole('spinbutton')).toBeTruthy());
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } });
  await waitFor(() => expect(screen.getByRole('button', { name: /Urgente/ })).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: /Urgente/ }));
  const expected = data().quoteSnapshot!;
  await waitFor(() => expect(container.textContent).toContain(formatEuroPrice(expected.totalIncVat)));
  expect(container.textContent).toContain(formatEuroPrice(expected.totalExVat));
  expect(container.textContent).toContain(formatEuroPrice(expected.unitExVat));
  const primaryTotal = Array.from(container.querySelectorAll('strong')).find(node => node.textContent === formatEuroPrice(expected.totalIncVat));
  expect(primaryTotal?.parentElement?.textContent).toContain('Total IVA incluido');
  fireEvent.click(screen.getByRole('switch', { name: /Ver desglose/ }));
  for (const key of ['subtotal', 'surcharge', 'totalExVat', 'vat', 'totalIncVat'] as const) {
    expect(container.textContent).toContain(formatEuroPrice(expected[key]));
  }
  fireEvent.click(screen.getByRole('button', { name: 'SOLICITAR PRESUPUESTO' }));
  const popup = screen.getAllByTestId('quote-popup-totals');
  for (const panel of popup) {
    expect(panel.firstElementChild?.getAttribute('data-testid')).toBe('quote-popup-primary-total');
    expect(panel.firstElementChild?.textContent).toContain('Total IVA incluido');
    expect(panel.firstElementChild?.textContent).toContain(formatEuroPrice(expected.totalIncVat));
  }
  for (const panel of popup) for (const key of ['subtotal', 'surcharge', 'totalExVat', 'vat', 'totalIncVat'] as const) {
    expect(panel.textContent).toContain(formatEuroPrice(expected[key]));
  }
  // Changing delivery inside the popup must update the SAME snapshot in the parent.
  fireEvent.click(screen.getByRole('button', { name: /RÁPIDO/ }));
  const rapid = captureQuoteSnapshot(data().pricing, 20, 'normal', new Date(), 'DTF');
  await waitFor(() => expect(screen.getAllByTestId('quote-popup-totals')[0].textContent).toContain(formatEuroPrice(rapid.totalIncVat)));
  fireEvent.click(screen.getByRole('button', { name: /URGENTE/ }));
  await waitFor(() => expect(screen.getAllByTestId('quote-popup-totals')[0].textContent).toContain(formatEuroPrice(expected.totalIncVat)));
  fireEvent.change(document.querySelector('#name')!, { target: { value: 'Prueba privada' } });
  fireEvent.change(document.querySelector('#email')!, { target: { value: 'no-send@example.invalid' } });
  fireEvent.submit(document.querySelector('#name')!.closest('form')!);
  await waitFor(() => expect(mocks.sendMail).toHaveBeenCalledTimes(2));
  const payload = mocks.submit.mock.calls[0][0] as QuoteData;
  expect(payload.product.sku).toBe('CA6709');
  expect(payload.product.quantities).toEqual({ M: 50 });
  expect(payload.product.selectedColor).toBe('negro');
  expect(payload.product.selectedZones).toEqual(['frontal']);
  expect(payload.quoteSnapshot!.delivery).toMatchObject({ option: 'urgente', percent: 50, label: 'Urgente' });
  expect(payload.quoteSnapshot!.technique.id).toBe('DTF');
  expect(screen.getAllByTestId('quote-popup-totals')[0].textContent).toContain(payload.quoteSnapshot!.delivery.dateLabel);
  for (const key of ['subtotal', 'surcharge', 'totalExVat', 'vat', 'totalIncVat', 'unitExVat'] as const) expect(payload.quoteSnapshot![key]).toBe(expected[key]);
  for (const [mail] of mocks.sendMail.mock.calls) {
    for (const key of ['subtotal', 'surcharge', 'totalExVat', 'vat', 'totalIncVat'] as const) expect(mail.html).toContain(formatEuroPrice(payload.quoteSnapshot![key]));
    for (const text of ['CA6709', 'Urgente', '50%', 'DTF Full Color', 'frontal', 'negro', 'Talla M', '50 uds.', payload.quoteSnapshot!.delivery.dateLabel]) expect(mail.html).toContain(text);
  }
});
