import styles from "./calculator.module.css";
import React from "react";
import {
  formatEuroPrice,
  calculateScaledPrice,
} from "@/services/pricingService";
import type { PricingData } from "@/types/pricing";
import { includedZones } from './includedZones';
import { formatProductOptionLabel } from '@/lib/productContent';

interface PriceScaleTableProps {
  pricingData: PricingData;
  regularPrice: number;
  selectedZones: string[];
  currentQuantity: number;
  deliverySurchargePercent?: number;
  currentUnitPrice?: number;
}

const PriceScaleTable: React.FC<PriceScaleTableProps> = ({
  pricingData,
  regularPrice,
  selectedZones,
  currentQuantity,
  deliverySurchargePercent = 0,
  currentUnitPrice,
}) => {
  // Memoizar el cálculo de precios por cantidad
  const priceScales = React.useMemo(() => {
    if (
      !pricingData?.factores_escalado ||
      Object.keys(pricingData.factores_escalado).length === 0
    ) {
      return [];
    }

    const quantities = Object.keys(pricingData.factores_escalado)
      .map(Number)
      .filter(quantity => quantity <= 1000)
      .sort((a, b) => a - b);

    const zones = includedZones(pricingData, selectedZones);
    if (!zones.length) return [];

    return quantities.map(cantidad => {
      let precioUnitario = calculateScaledPrice(regularPrice, cantidad, zones, pricingData).precioUnitarioFinal;

      if (deliverySurchargePercent > 0) {
        precioUnitario = precioUnitario * (1 + deliverySurchargePercent / 100);
      }

      return {
        cantidad,
        precioUnitario,
      };
    });
  }, [pricingData, regularPrice, selectedZones, deliverySurchargePercent]);

  // Si no hay datos de escalado, no mostrar
  if (priceScales.length === 0) return null;
  const activeIndex = Math.max(
    0,
    priceScales.findLastIndex(scale => scale.cantidad <= currentQuantity)
  );
  const visibleIndexes = new Set([
    0,
    Math.max(0, activeIndex - 1),
    activeIndex,
    Math.min(priceScales.length - 1, activeIndex + 1),
    priceScales.length - 1,
  ]);
  // Fill deduplicated edge positions using existing tiers, never invented prices.
  for (let index = 0; visibleIndexes.size < Math.min(5, priceScales.length) && index < priceScales.length; index++) {
    visibleIndexes.add(index);
  }

  return (
    <div className={styles.tiers}>
      <h4>Precio por unidad según cantidad · impresión incluida</h4>
      <p>Incluye: {includedZones(pricingData, selectedZones).map(formatProductOptionLabel).join(' + ')}</p>
      <p>
        {currentQuantity} uds
        {currentUnitPrice != null &&
          ` · Tu precio: ${formatEuroPrice(currentUnitPrice)}/ud`}{" "}
        · sin IVA
      </p>
      <div
        className={styles.tierGrid}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${visibleIndexes.size}, minmax(0, 1fr))`,
          overflow: "visible",
        }}
      >
        {priceScales
          .filter((_, index) => visibleIndexes.has(index))
          .map(scale => {
            const nextThreshold = Object.keys(pricingData.factores_escalado)
              .map(Number)
              .sort((a, b) => a - b)
              .find(value => value > scale.cantidad);
            const isSelectedTier =
              currentQuantity >= scale.cantidad &&
              (nextThreshold == null || currentQuantity < nextThreshold);
            const next = priceScales.find(
              item => item.cantidad > currentQuantity
            );
            return (
              <div
                key={scale.cantidad}
                data-current={isSelectedTier}
                data-past={currentQuantity >= scale.cantidad}
              >
                <span className={styles.segment} />
                {isSelectedTier && <small>▼ {currentQuantity} uds</small>}
                <span>{scale.cantidad}+ uds</span>
                <strong>{formatEuroPrice(scale.precioUnitario)}</strong>
              </div>
            );
          })}
      </div>
      <p>
        {currentQuantity < pricingData.cantidad_minima
          ? `Te faltan ${pricingData.cantidad_minima - currentQuantity} uds para el mínimo (${pricingData.cantidad_minima})`
          : priceScales.find(item => item.cantidad > currentQuantity)
            ? `Te faltan ${priceScales.find(item => item.cantidad > currentQuantity)!.cantidad - currentQuantity} uds para bajar a ${formatEuroPrice(priceScales.find(item => item.cantidad > currentQuantity)!.precioUnitario)}/ud`
            : "Mejor tramo mostrado · hasta 1000 uds"}
      </p>
    </div>
  );
};
export default PriceScaleTable;
