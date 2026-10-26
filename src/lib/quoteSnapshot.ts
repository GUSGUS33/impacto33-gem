import type { PriceCalculation } from '../types/pricing';
import deliveryConfig from '../../shared/config/delivery-times.json';
import { addBusinessDays, formatDeliveryDate } from '../../shared/utils/businessDays';
import { PRINTING_METHODS } from '../data/pricing/printing-methods';

export type DeliveryOption = 'sin_prisa' | 'normal' | 'urgente';
export type DeliveryDates = Record<DeliveryOption, Date>;
export const deliveryLabels = { sin_prisa: 'Estándar', normal: 'Rápido', urgente: 'Urgente' };

export interface QuoteSnapshot {
  subtotal: number;
  surcharge: number;
  totalExVat: number;
  vat: number;
  totalIncVat: number;
  unitExVat: number;
  delivery: { option: DeliveryOption; label: string; percent: number; date: string; dateLabel: string };
  technique: { id: string; label: string };
}

// Existing selector date operations, shared so the popup cannot show a different day.
export function getDeliveryDates(categorySlug: string, today = new Date()): DeliveryDates {
  const options = deliveryConfig.categories[categorySlug as keyof typeof deliveryConfig.categories]
    || deliveryConfig.categories.default;
  return {
    sin_prisa: addBusinessDays(today, options.sin_prisa.businessDays),
    normal: addBusinessDays(today, options.normal.businessDays),
    urgente: addBusinessDays(today, options.urgente.businessDays),
  };
}

// Moved verbatim from Summary: same operations and order, no pricing rule changed.
// Called once by the product flow. Consumers transmit/render the result, never recalculate it.
export function captureQuoteSnapshot(
  priceCalculation: PriceCalculation,
  deliverySurchargePercent: number,
  selectedDeliveryOption: DeliveryOption,
  date: Date,
  technique: string,
): QuoteSnapshot {
  const { precioTotalSinIVA, precioUnitarioFinal } = priceCalculation;
  const deliverySurcharge =
    deliverySurchargePercent > 0
      ? (precioTotalSinIVA * deliverySurchargePercent) / 100
      : 0;
  const precioTotalSinIVAConEntrega = precioTotalSinIVA + deliverySurcharge;
  const precioTotalConIVAConEntrega = precioTotalSinIVAConEntrega * 1.21;
  const precioUnitarioFinalConEntrega =
    precioUnitarioFinal * (1 + deliverySurchargePercent / 100);
  return {
    subtotal: precioTotalSinIVA,
    surcharge: deliverySurcharge,
    totalExVat: precioTotalSinIVAConEntrega,
    vat: precioTotalConIVAConEntrega - precioTotalSinIVAConEntrega,
    totalIncVat: precioTotalConIVAConEntrega,
    unitExVat: precioUnitarioFinalConEntrega,
    delivery: {
      option: selectedDeliveryOption,
      label: deliveryLabels[selectedDeliveryOption],
      percent: deliverySurchargePercent,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      dateLabel: formatDeliveryDate(date),
    },
    technique: { id: technique, label: PRINTING_METHODS[technique as keyof typeof PRINTING_METHODS]?.label || technique },
  };
}
