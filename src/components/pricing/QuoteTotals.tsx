import type { QuoteSnapshot } from '@/lib/quoteSnapshot';
import { formatEuroPrice } from '@/services/pricingService';

export function QuoteTotals({ quote, sku }: { quote: QuoteSnapshot; sku: string }) {
  return <div data-testid="quote-popup-totals" className="bg-blue-50 rounded-xl p-4 space-y-2">
    <div className="border-b border-blue-200 pb-4 mb-4" data-testid="quote-popup-primary-total">
      <p className="text-sm font-semibold text-slate-700">Total IVA incluido</p>
      <p className="text-3xl sm:text-4xl font-bold text-slate-900">{formatEuroPrice(quote.totalIncVat)}</p>
      <p className="text-xs text-slate-600">IVA del 21% y plazo seleccionado incluidos</p>
    </div>
    <h3 className="font-semibold text-slate-900">Desglose del presupuesto</h3>
    <p>SKU: {sku || 'No disponible'}</p>
    <p>Plazo: {quote.delivery.label} ({quote.delivery.percent}%)</p>
    <p className="font-semibold text-green-700">Entrega: {quote.delivery.dateLabel} · {quote.delivery.date}</p>
    <p>Técnica: {quote.technique.label}</p>
    <p>Subtotal: {formatEuroPrice(quote.subtotal)}</p>
    <p>Recargo {quote.delivery.label} ({quote.delivery.percent}%): {formatEuroPrice(quote.surcharge)}</p>
    <p>Total sin IVA: {formatEuroPrice(quote.totalExVat)}</p>
    <p>IVA (21%): {formatEuroPrice(quote.vat)}</p>
  </div>;
}
