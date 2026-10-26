import React from "react";
import type { QuoteSnapshot } from "@/lib/quoteSnapshot";
import type PriceCalculator from "../PriceCalculator";
import { formatEuroPrice } from "@/services/pricingService";
import { formatProductOptionLabel } from "@/lib/productContent";
import { PRINTING_METHODS } from "@/data/pricing/printing-methods";
import type { PrintingMethodId } from "@/types/printing";
import PriceScaleTable from "./PriceScaleTable";
import styles from "./calculator.module.css";
import FloatingSummary from "./FloatingSummary";
import ScalePlacement from "./ScalePlacement";

export default function Summary({
  priceCalculation,
  quoteSnapshot,
  selectedColor,
  isValid = true,
  isCalculating = false,
  quantities = {},
  selectedZones = [],
  selectedPrintingMethod = "DTF",
  pricingData,
  regularPrice = 0,
  deliverySurchargePercent = 0,
  showDetailedBreakdown = false,
  onRequestQuote,
  modalOpen,
  selectedDeliveryOption = "sin_prisa",
}: React.ComponentProps<typeof PriceCalculator> & {
  modalOpen: boolean;
  quoteSnapshot: QuoteSnapshot | null;
  selectedDeliveryOption?: "sin_prisa" | "normal" | "urgente";
}) {
  if (!priceCalculation || !quoteSnapshot)
    return (
      <p className={styles.notice}>
        Selecciona cantidades para ver tu presupuesto.
      </p>
    );
  const {
    precioUnitarioFinal,
    precioTotalSinIVA,
    cantidadTotal,
    cantidadMinima,
    cumpleCantidadMinima,
  } = priceCalculation;
  const {
    surcharge: deliverySurcharge,
    totalExVat: precioTotalSinIVAConEntrega,
    totalIncVat: precioTotalConIVAConEntrega,
    unitExVat: precioUnitarioFinalConEntrega,
  } = quoteSnapshot;
  const cta = isCalculating
    ? "Calculando presupuesto…"
    : !cumpleCantidadMinima
      ? `AÑADE ${Math.max(0, cantidadMinima - cantidadTotal)} UDS PARA SOLICITAR`
      : "SOLICITAR PRESUPUESTO";
  const disabled = !isValid || isCalculating || !cumpleCantidadMinima;
  return (
    <>
      {pricingData && (
        <ScalePlacement>
        <PriceScaleTable
          currentUnitPrice={precioUnitarioFinalConEntrega}
          pricingData={pricingData}
          regularPrice={regularPrice}
          selectedZones={selectedZones}
          currentQuantity={cantidadTotal}
          deliverySurchargePercent={deliverySurchargePercent}
        />
        </ScalePlacement>
      )}
      <div className={styles.orderRecap}>
        <p><strong>{formatProductOptionLabel(selectedColor)}</strong> · {cantidadTotal} uds</p>
        <p><span>Tallas: </span>{Object.entries(quantities).filter(([, value]) => value > 0).map(([size, value]) => `${formatProductOptionLabel(size)} ${value}`).join(" · ")}</p>
        <p>
        {selectedZones.length > 0 &&
          `${selectedZones.map(formatProductOptionLabel).join(" + ")}`}{" "}
        ·{" "}
        {
          { sin_prisa: "Estándar", normal: "Rápido", urgente: "Urgente" }[
            selectedDeliveryOption
          ]
        }
        </p>
      </div>
      {!cumpleCantidadMinima && (
        <p className={styles.help}>Pedido mínimo {cantidadMinima} uds</p>
      )}
      <div
        className={styles.totals}
        data-below-minimum={!cumpleCantidadMinima}
        aria-live="polite"
      >
        <div>
          <span>{cantidadTotal} uds · Total IVA incluido</span>
          <strong>{formatEuroPrice(precioTotalConIVAConEntrega)}</strong>
          <small>
            {formatEuroPrice(precioTotalSinIVAConEntrega)} sin IVA · IVA 21%
          </small>
        </div>
        <div>
          <span>Por unidad</span>
          <b>{formatEuroPrice(precioUnitarioFinalConEntrega)}</b>
          <small>Sin IVA · plazo seleccionado incluido</small>
        </div>
      </div>
      {showDetailedBreakdown && (
        <div className={styles.breakdown}>
          <h4>Desglose de precios</h4>
          <p>
            {formatProductOptionLabel(selectedColor)} · {cantidadTotal} uds
          </p>
          <p>
            {Object.entries(quantities)
              .filter(([, quantity]) => quantity > 0)
              .map(
                ([size, quantity]) =>
                  `${formatProductOptionLabel(size)}: ${quantity}`
              )
              .join(" · ")}
          </p>
          <p>
            {PRINTING_METHODS[selectedPrintingMethod as PrintingMethodId]
              ?.label || formatProductOptionLabel(selectedPrintingMethod)}
            {selectedZones.length > 0 &&
              ` · ${selectedZones.map(formatProductOptionLabel).join(" + ")}`}
          </p>
          <dl>
            <div>
              <dt>Subtotal sin IVA, antes del plazo</dt>
              <dd>{formatEuroPrice(precioTotalSinIVA)}</dd>
            </div>
            {deliverySurchargePercent > 0 && (
              <div>
                <dt>Plazo seleccionado (+{deliverySurchargePercent}%)</dt>
                <dd>{formatEuroPrice(deliverySurcharge)}</dd>
              </div>
            )}
            <div>
              <dt>Total sin IVA</dt>
              <dd>{formatEuroPrice(precioTotalSinIVAConEntrega)}</dd>
            </div>
            <div>
              <dt>IVA (21%)</dt>
              <dd>
                {formatEuroPrice(
                  quoteSnapshot.vat
                )}
              </dd>
            </div>
            <div>
              <dt>Total con IVA</dt>
              <dd>{formatEuroPrice(precioTotalConIVAConEntrega)}</dd>
            </div>
          </dl>
        </div>
      )}
      <button
        type="button"
        disabled={disabled}
        className={styles.cta}
        onClick={onRequestQuote}
      >
        {cta}
      </button>
      <p className={styles.disclaimer}>
        Sin compromiso y sin pago ahora · Revisamos tu solicitud y te pediremos
        tu diseño al confirmar el presupuesto
      </p>
      {!modalOpen && (
        <FloatingSummary
          quantity={cantidadTotal}
          minimum={cantidadMinima}
          total={precioTotalConIVAConEntrega}
          unit={precioUnitarioFinalConEntrega}
        />
      )}
    </>
  );
}
