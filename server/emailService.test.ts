import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuoteData } from '../src/services/emailService';

const mailMocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
  verify: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mailMocks.createTransport,
  },
}));

import { sendQuoteEmail } from './emailService';

const quoteData: QuoteData = {
  customer: {
    name: 'Cliente <script>alert(1)</script>\r\nBcc: attacker@example.com',
    email: 'cliente@example.com',
    company: 'Empresa & Asociados',
    phone: '+34 600 000 000',
    message: '<img src=x onerror=alert(1)>',
  },
  product: {
    id: 'product-1',
    name: 'Camiseta\r\nBcc: attacker@example.com',
    sku: 'SKU-1',
    image: 'https://example.com/product.jpg',
    selectedColor: 'Azul <oscuro>',
    quantities: { 'M<script>': 10 },
    selectedZones: ['Frontal <script>'],
  },
  pricing: {
    precioUnitarioBase: 8,
    precioPersonalizacion: 2,
    precioUnitarioFinal: 10,
    precioTotalSinIVA: 100,
    precioTotalConIVA: 121,
    cantidadTotal: 10,
    cantidadMinima: 10,
    cumpleCantidadMinima: true,
    escalado: 1,
    zonasSeleccionadas: ['frontal'],
  },
};

describe('sendQuoteEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'info@example.com';
    process.env.SMTP_PASS = 'secret';
    mailMocks.createTransport.mockReturnValue({
      sendMail: mailMocks.sendMail,
      verify: mailMocks.verify,
    });
    mailMocks.verify.mockResolvedValue(true);
    mailMocks.sendMail.mockResolvedValue({ messageId: 'message-1' });
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it('requires authenticated TLS and disables file and URL access', async () => {
    await sendQuoteEmail(quoteData);

    expect(mailMocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      secure: false,
      requireTLS: true,
      tls: { minVersion: 'TLSv1.2' },
      disableFileAccess: true,
      disableUrlAccess: true,
    }));
    expect(mailMocks.createTransport.mock.calls[0][0].tls).not.toHaveProperty('rejectUnauthorized');
  });

  it('escapes user content in HTML and removes line breaks from generated subjects', async () => {
    await sendQuoteEmail(quoteData);

    const [customerEmail, companyEmail] = mailMocks.sendMail.mock.calls.map(([message]) => message);
    expect(customerEmail.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(customerEmail.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(customerEmail.html).not.toContain('<script>');
    expect(companyEmail.subject).not.toMatch(/[\r\n]/);
    expect(companyEmail.subject).toContain('Bcc: attacker@example.com');
  });

  it('uses implicit TLS on port 465', async () => {
    process.env.SMTP_PORT = '465';

    await sendQuoteEmail(quoteData);

    expect(mailMocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      secure: true,
      requireTLS: false,
    }));
  });
});
