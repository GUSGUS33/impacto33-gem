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
  // Obtener los primeros 4 tramos de cantidad que EXISTEN en factores_escalado
  const quantities = Object.keys(pricingData.factores_escalado)
    .map(Number)
    .sort((a, b) => a - b)
    .slice(0, 4); // Solo los primeros 4 tramos

  // Si no hay datos de escalado, no mostrar
  if (Object.keys(pricingData.factores_escalado).length === 0) return null;

  // Calcular precio base CON personalización incluida (sin escalado)
  // Usar TODAS las zonas seleccionadas, no solo frontal
  const precioProndaBase = regularPrice / 2;
  const costoPersonalizacion = selectedZones.reduce((total, zona) => {
    return total + (pricingData.coste_personalizacion[zona] || 0);
  }, 0);
  const costeBaseTotal = precioProndaBase + costoPersonalizacion;

  // Calcular precios para cada cantidad
  const priceScales = quantities.map(cantidad => {
    // Usar getEscaladoMultiplier para encontrar el tramo más cercano (igual que calculateScaledPrice)
    const escalado = getEscaladoMultiplier(cantidad, pricingData.factores_escalado);
    let precioUnitario = costeBaseTotal * escalado;
    
    // Aplicar recargo de entrega si existe
    if (deliverySurchargePercent > 0) {
      precioUnitario = precioUnitario * (1 + deliverySurchargePercent / 100);
    }
    
    return {
      cantidad,
      precioUnitario
    };
  });

  return (
    <div className="mt-6 mb-6">
      {/* Título */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          📊 PRECIOS POR CANTIDAD
        </span>
        <span className="text-xs text-slate-500 italic">
          (con personalización frontal, sin IVA)
        </span>
      </div>
      
      {/* Grid horizontal simple - 4 columnas */}
      <div className="grid grid-cols-4 gap-4">
        {priceScales.map((scale) => (
          <div
            key={scale.cantidad}
            className="flex flex-col items-center"
          >
            {/* Cantidad */}
            <p className="text-xs font-medium text-slate-600 mb-1">
              {scale.cantidad} uds
            </p>

            {/* Precio unitario */}
            <p className="text-base font-bold text-slate-900">
              {formatEuroPrice(scale.precioUnitario)}/ud
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceScaleTable;
