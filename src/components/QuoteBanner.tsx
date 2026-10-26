"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useQuoteProduct } from '@/contexts/QuoteProductContext';
import { quoteFormLink, quoteMessage } from '@/lib/quoteLinks';

export function QuoteBanner() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const { product } = useQuoteProduct();
  // Never carry a previous product into another route during client navigation.
  const currentProduct = product?.path === pathname ? product : null;
  if (!visible) return null;
  const linkClass = 'inline-block py-2 font-semibold underline underline-offset-4 decoration-slate-400 hover:decoration-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 touch-manipulation';
  return (
    <div className="relative border-b border-violet-200 bg-[#EFEDFF] px-4 py-1 text-sm leading-6 text-slate-900">
      <p className="mx-auto max-w-7xl pr-10 text-center">
        <strong className="font-semibold text-slate-900">Pide tu presupuesto sin compromiso</strong>{' '}
        en el <Link href={quoteFormLink(currentProduct)} className={linkClass}>formulario</Link>{' '}
        o por <a href={`https://wa.me/34690906027?text=${encodeURIComponent(quoteMessage(currentProduct))}`} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a>.{' '}
        <span className="inline-block">Te respondemos en menos de 24 h.</span>
      </p>
      <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar información de presupuesto" className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded text-slate-600 hover:bg-violet-200 focus-visible:outline-2 touch-manipulation active:bg-violet-200">
        <X size={18} />
      </button>
    </div>
  );
}
