import { describe, expect, it } from "vitest";
import { resolveProductPricingCategory } from "./productPricingCategory";

describe("categoría de precios del producto", () => {
  it("prioriza una categoría reconocida aunque no sea la primera", () => {
    expect(resolveProductPricingCategory([
      { slug: "accessories_travel" },
      { slug: "travel_accessories" },
    ])).toBe("travel_accessories");
  });

  it("conserva la primera categoría cuando todavía no está mapeada", () => {
    expect(resolveProductPricingCategory([{ slug: "categoria-nueva" }]))
      .toBe("categoria-nueva");
  });

  it("usa default únicamente cuando el producto no tiene categorías", () => {
    expect(resolveProductPricingCategory([])).toBe("default");
  });
});
