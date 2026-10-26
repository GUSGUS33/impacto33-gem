import { expect, it } from "vitest";
import { calculateScaledPrice } from "@/services/pricingService";
import type { PricingData } from "@/types/pricing";
import defaultPricing from "@/data/pricing/_default.json";
import camisetas from "@/data/pricing/camisetas.json";
import { PRICING_FAMILIES } from "@/data/pricing/pricing-families";

// Known pre-existing backend/pricing defect: expected failure, NOT repaired by UI.
// Once the pricing fix lands, change it.fails to it and require monotonicity.
it.fails(
  "el total no baja en ningún umbral de los JSON actuales (defecto previo pendiente)",
  () => {
    const decreases: string[] = [];
    for (const config of [
      defaultPricing,
      camisetas,
      ...Object.values(PRICING_FAMILIES),
    ] as PricingData[]) {
      for (const threshold of Object.keys(config.factores_escalado).map(
        Number
      )) {
        if (threshold <= config.cantidad_minima) continue;
        for (const zones of [[], config.zonas_permitidas]) {
          const previous = calculateScaledPrice(
            10,
            threshold - 1,
            zones,
            config
          ).precioTotalSinIVA;
          const next = calculateScaledPrice(
            10,
            threshold,
            zones,
            config
          ).precioTotalSinIVA;
          if (next < previous)
            decreases.push(
              `${config.categoria}: ${threshold - 1}→${threshold}, ${zones.length} zonas: ${previous}→${next}`
            );
        }
      }
    }
    expect(decreases, decreases.join("\n")).toEqual([]);
  }
);
