// Extracted unchanged from useProductPricing: one decimal-normalization source.
export const normalizeProductPrice = (value: string | number): number =>
  parseFloat(
    String(value)
      .replace(/[^0-9.,]/g, "")
      .replace(",", ".")
  );
