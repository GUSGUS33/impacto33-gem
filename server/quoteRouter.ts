import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { sendQuoteEmail } from './emailService';

const quoteSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Email inválido'),
    company: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().optional(),
  }),
  product: z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    image: z.string(),
    selectedColor: z.string(),
    quantities: z.record(z.string(), z.number()),
    selectedZones: z.array(z.string()),
  }),
  pricing: z.object({
    precioUnitarioBase: z.number(),
    precioPersonalizacion: z.number(),
    precioUnitarioFinal: z.number(),
    precioTotalSinIVA: z.number(),
    precioTotalConIVA: z.number(),
    cantidadTotal: z.number(),
    cantidadMinima: z.number(),
    cumpleCantidadMinima: z.boolean(),
    escalado: z.number(),
    zonasSeleccionadas: z.array(z.string()),
  }),
});

export const quoteRouter = router({
  submit: publicProcedure
    .input(quoteSchema)
    .mutation(async ({ input }) => {
      try {
        await sendQuoteEmail(input);
        return {
          success: true,
          message: 'Presupuesto enviado correctamente',
        };
      } catch (error) {
        console.error('Error al procesar solicitud de presupuesto:', error);
        throw new Error('Error al enviar el presupuesto. Por favor, inténtalo de nuevo o contacta directamente con nosotros.');
      }
    }),
});
