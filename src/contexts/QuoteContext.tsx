"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { QuoteData } from '../services/emailService';
import { trpc } from '@/lib/trpc';

interface QuoteContextType {
  submitQuote: (data: QuoteData) => Promise<void>;
  lastQuote: QuoteData | null;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastQuote, setLastQuote] = useState<QuoteData | null>(null);
  const submitMutation = trpc.quote.submit.useMutation();

  const submitQuote = async (data: QuoteData) => {
    try {
      await submitMutation.mutateAsync(data);
      setLastQuote(data);
    } catch (error) {
      console.error('Error al enviar presupuesto:', error);
      throw error;
    }
  };

  return (
    <QuoteContext.Provider value={{ submitQuote, lastQuote }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};
