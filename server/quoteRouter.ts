import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { sendQuoteEmail } from './emailService';

const money = z.number().finite().nonnegative();
const shortText = z.string().max(200);
export const quoteSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    company: z.string().max(300).optional(),
    phone: z.string().max(80).optional(),
    message: z.string().max(10000).optional(),
  }),
  product: z.object({
    id: shortText,
    name: z.string().max(1000),
    sku: shortText,
    image: z.string().max(3000),
    selectedColor: shortText,
    quantities: z.record(shortText, z.number().finite().int().positive()),
    selectedZones: z.array(shortText).max(30),
  }),
  pricing: z.object({
    precioUnitarioBase: money,
    precioPersonalizacion: money,
    precioUnitarioFinal: money,
    precioTotalSinIVA: money,
    precioTotalConIVA: money,
    cantidadTotal: z.number().finite().int().positive(),
    cantidadMinima: z.number().finite().int().positive(),
    cumpleCantidadMinima: z.boolean(),
    escalado: z.number().finite().positive(),
    zonasSeleccionadas: z.array(shortText).max(30),
  }),
  quoteSnapshot: z.object({
    subtotal: money,
    surcharge: money,
    totalExVat: money,
    vat: money,
    totalIncVat: money,
    unitExVat: money,
    delivery: z.object({
      option: z.enum(['sin_prisa', 'normal', 'urgente']),
      label: shortText,
      percent: z.number().finite().min(0).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      dateLabel: shortText,
    }),
    technique: z.object({ id: shortText, label: shortText }),
  }).optional(),
}).superRefine((data, ctx) => {
  const quantities = Object.values(data.product.quantities);
  const total = quantities.reduce((sum, quantity) => sum + quantity, 0);
  if (!quantities.length || !Number.isSafeInteger(total) || total !== data.pricing.cantidadTotal) {
    ctx.addIssue({ code: 'custom', path: ['product', 'quantities'], message: 'La suma de cantidades debe coincidir con el pedido.' });
  }
  if (total < data.pricing.cantidadMinima || !data.pricing.cumpleCantidadMinima) {
    ctx.addIssue({ code: 'custom', path: ['pricing', 'cantidadMinima'], message: 'No se alcanza el mínimo enviado por la configuración.' });
  }
});
// Pending new pricing system: resolve minimum/tariff from trusted data and recalculate server-side.
// Current validation deliberately does not reconstruct or certify any monetary amount.
function parseQuote(raw: unknown) {
  const result = quoteSchema.safeParse(raw);
  if (!result.success) {
    console.info('[quote.audit]', JSON.stringify({
      event: 'rejected', requestId: randomUUID(),
      issues: result.error.issues.map(issue => ({ path: issue.path, code: issue.code })),
    }));
    throw result.error;
  }
  return result.data;
}

export const quoteRouter = router({
  submit: publicProcedure.input(parseQuote).mutation(async ({ input }) => {
    const requestId = randomUUID();
    // Explicit allowlist: no customer name/email/phone/message, image URL or network identifiers.
    console.info('[quote.audit]', JSON.stringify({
      event: 'received', requestId,
      payload: {
        product: {
          id: input.product.id, sku: input.product.sku,
          selectedColor: input.product.selectedColor,
          quantities: input.product.quantities, selectedZones: input.product.selectedZones,
        },
        pricing: input.pricing, quoteSnapshot: input.quoteSnapshot,
      },
    }));
    try {
      await sendQuoteEmail(input);
      console.info('[quote.audit]', JSON.stringify({ event: 'sent', requestId }));
      return { success: true, message: 'Presupuesto enviado correctamente' };
    } catch {
      console.error('[quote.audit]', JSON.stringify({ event: 'send_failed', requestId }));
      throw new Error('Error al enviar el presupuesto. Por favor, inténtalo de nuevo o contacta directamente con nosotros.');
    }
  }),
});
