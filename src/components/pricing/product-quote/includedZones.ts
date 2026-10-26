import type { PricingData } from '@/types/pricing';

// Only configured, priced zones may support an "impression included" claim.
export function includedZones(data: PricingData, selected: string[] = []): string[] {
  const valid = (zone: string) => data.zonas_permitidas?.includes(zone) &&
    Number.isFinite(data.coste_personalizacion?.[zone]) && data.coste_personalizacion[zone] >= 0;
  if (selected.length) return selected.every(valid) ? selected : [];
  const first = data.zonas_permitidas?.find(valid);
  return first ? [first] : [];
}
