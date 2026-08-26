import React from 'react';
import { formatEuroPrice, getEscaladoMultiplier } from '../../services/pricingService';
import type { PricingData } from '../../types/pricing';

interface PriceScaleTableProps {
  pricingData: PricingData;
  regularPrice: number;
  selectedZones: string[];
  currentQuantity: number;
  deliverySurchargePercent?: number;
}

const PriceScaleTable: React.FC<PriceScaleTableProps> = ({
  pricingData,
  regularPrice,
  selectedZones,
  currentQuantity,
  deliverySurchargePercent = 0
}) => {
  // Memoizar el cálculo de precios por cantidad
  const priceScales = React.useMemo(() => {
    if (!pricingData?.factores_escalado || Object.keys(pricingData.factores_escalado).length === 0) {
      return [];
    }

    const quantities = Object.keys(pricingData.factores_escalado)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, 4);

    const precioProndaBase = regularPrice / 2;
    const costoPersonalizacion = selectedZones.reduce((total, zona) => {
      return total + (pricingData.coste_personalizacion[zona] || 0);
    }, 0);
    const costeBaseTotal = precioProndaBase + costoPersonalizacion;

    return quantities.map(cantidad => {
      const escalado = getEscaladoMultiplier(cantidad, pricingData.factores_escalado);
      let precioUnitario = costeBaseTotal * escalado;
      
      if (deliverySurchargePercent > 0) {
        precioUnitario = precioUnitario * (1 + deliverySurchargePercent / 100);
      }
      
      return {
        cantidad,
        precioUnitario
      };
    });
  }, [pricingData, regularPrice, selectedZones, deliverySurchargePercent]);

  // Si no hay datos de escalado, no mostrar
  if (priceScales.length === 0) return null;

  return (
    <div className="mt-4 mb-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
      {/* Título sutil */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Precios por cantidad
        </span>
        <span className="text-[11px] text-slate-400 font-normal">
          Sin IVA
        </span>
      </div>
      
      {/* Grid de precios sutil */}
      <div className="grid grid-cols-4 gap-2">
        {priceScales.map((scale) => {
          const isSelectedTier = currentQuantity >= scale.cantidad;
          return (
            <div
              key={scale.cantidad}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors ${
                isSelectedTier
                  ? 'bg-white border border-slate-200 shadow-2xs text-slate-800'
                  : 'text-slate-600'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-normal">
                {scale.cantidad} uds
              </span>
              <span className="text-xs md:text-sm font-medium text-slate-700 mt-0.5">
                {formatEuroPrice(scale.precioUnitario)}/ud
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceScaleTable;

