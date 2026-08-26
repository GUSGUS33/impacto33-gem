import { PriceCalculationResult } from '../hooks/usePriceCalculation';
import { trpc } from '@/lib/trpc';

export interface QuoteData {
  customer: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    image: string;
    selectedColor: string;
    quantities: Record<string, number>;
    selectedZones: string[];
  };
  pricing: PriceCalculationResult;
}

// Esta función ya no se usa directamente, el componente usa tRPC
// Se mantiene por compatibilidad con el tipo QuoteData
export const sendQuoteEmail = async (data: QuoteData): Promise<boolean> => {
  throw new Error('Use trpc.quote.submit.useMutation() instead');
};
