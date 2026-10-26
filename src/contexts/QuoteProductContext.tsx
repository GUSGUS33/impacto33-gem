"use client";

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { QuoteProduct } from '@/lib/quoteLinks';

const QuoteProductContext = createContext<{
  product: QuoteProduct | null;
  setProduct: Dispatch<SetStateAction<QuoteProduct | null>>;
}>({ product: null, setProduct: () => {} });

export function QuoteProductProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<QuoteProduct | null>(null);
  return <QuoteProductContext.Provider value={{ product, setProduct }}>{children}</QuoteProductContext.Provider>;
}

export const useQuoteProduct = () => useContext(QuoteProductContext);
