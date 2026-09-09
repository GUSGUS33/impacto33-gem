import { describe, expect, it } from "vitest";
import {
  getProductBreadcrumbChain,
  getTransactionalUrl,
  sanitizeBreadcrumbUrl,
} from "./slugMap";

describe("transactional category URLs", () => {
  it.each(["pencils", "lapices", "ball_pens", "notebooks", "diaries_calendars", "office_accessories"])(
    "mapea %s a la categoría de escritura real",
    (slug) => {
      expect(getTransactionalUrl(slug)).toBe("/escritura-personalizada");
    },
  );

  it("elimina la barra final de breadcrumbs", () => {
    expect(sanitizeBreadcrumbUrl("/camisetas-personalizadas/")).toBe(
      "/camisetas-personalizadas",
    );
  });

  it("asigna el producto TRALEM a escritura sin barra final", () => {
    expect(
      getProductBreadcrumbChain({ productSlug: "tralem", productName: "Bolígrafo TRALEM" }),
    ).toEqual([
      expect.objectContaining({ url: "/escritura-personalizada" }),
    ]);
  });
});
