"use client";
import { useEffect, useState } from "react";
import type { PricingData } from '@/types/pricing';
import { includedZones } from './includedZones';
import { formatProductOptionLabel } from '@/lib/productContent';
import { loadPricingData, calculateScaledPrice, formatEuroPrice } from "@/services/pricingService";

// The server supplies the same configuration used by the calculator.
// Client-only consumers retain the existing asynchronous loading fallback.
export default function FromPrice({
  regularPrice, categorySlug, initialPricingData,
}: {
  regularPrice: number;
  categorySlug: string;
  initialPricingData?: PricingData;
}) {
  const [loaded, setLoaded] = useState<{ category: string; data: PricingData } | null>(null);
  useEffect(() => {
    if (initialPricingData) return;
    let active = true;
    loadPricingData(categorySlug)
      .then(data => { if (active) setLoaded({ category: categorySlug, data }); })
      .catch(() => { if (active) setLoaded(null); });
    return () => { active = false; };
  }, [categorySlug, initialPricingData]);
  const data = initialPricingData || (loaded?.category === categorySlug ? loaded.data : null);
  if (!data || !Number.isFinite(regularPrice) || regularPrice <= 0) return null;
  const zones = includedZones(data);
  if (!zones.length) return null;
  const quantity = Math.max(...Object.keys(data.factores_escalado).map(Number).filter(quantity => quantity <= 1000));
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const amount = calculateScaledPrice(regularPrice, quantity, zones, data).precioUnitarioFinal;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return (
    <>
      <span>Desde {formatEuroPrice(amount)}/ud</span>
      <small className="block text-sm font-medium text-slate-600">
        + IVA · en {quantity}+ uds · impresión incluida ({formatProductOptionLabel(zones[0])})
      </small>
    </>
  );
}
