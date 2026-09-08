import { describe, expect, it } from "vitest";
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateProductSchema,
  getCanonicalUrl,
} from "./seo";

describe("SEO structured data", () => {
  it("publica una Organization sin datos de local físico inventados", () => {
    const schema = generateOrganizationSchema() as Record<string, unknown>;

    expect(schema["@type"]).toBe("Organization");
    expect(schema).not.toHaveProperty("address");
    expect(schema).not.toHaveProperty("geo");
    expect(schema).not.toHaveProperty("openingHoursSpecification");
    expect(schema).not.toHaveProperty("priceRange");
  });

  it("no inventa valoraciones en Product", () => {
    const schema = generateProductSchema(
      { id: 1, name: "Producto", price: "10", inStock: true },
      "https://impacto33.com/producto/producto",
    ) as Record<string, unknown>;

    expect(schema).not.toHaveProperty("aggregateRating");
  });

  it("normaliza canónicas y elementos de BreadcrumbList sin barra final", () => {
    expect(getCanonicalUrl("/")).toBe("https://impacto33.com");
    expect(getCanonicalUrl("/escritura-personalizada/?utm_source=test")).toBe(
      "https://impacto33.com/escritura-personalizada",
    );

    const schema = generateBreadcrumbSchema([
      { name: "Inicio", item: "https://impacto33.com/" },
      { name: "Escritura", item: "/escritura-personalizada/" },
    ]);

    expect(schema.itemListElement.map((item) => item.item)).toEqual([
      "https://impacto33.com",
      "https://impacto33.com/escritura-personalizada",
    ]);
  });
});
