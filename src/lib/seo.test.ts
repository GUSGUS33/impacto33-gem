import { describe, expect, it } from "vitest";
import {
  generateBreadcrumbSchema,
  generateSeoMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateProductSchema,
  generateItemListSchema,
  generateServiceSchema,
  getCanonicalUrl,
} from "./seo";

describe("SEO structured data", () => {
  it("normaliza canonical y Open Graph recibidos de WordPress", () => {
    const metadata = generateSeoMetadata({
      title: "Categoría", description: "Descripción",
      url: "https://impacto33.com/camisetas-personalizadas/?utm_source=test",
    });
    expect(metadata.alternates?.canonical).toBe("https://impacto33.com/camisetas-personalizadas");
    expect(metadata.openGraph?.url).toBe("https://impacto33.com/camisetas-personalizadas");
  });
  it("delega la marca al template del layout y elimina sufijos duplicados", () => {
    const metadata = generateSeoMetadata({
      title: "Mochila personalizada | IMPACTO33 | IMPACTO33",
      description: "Descripción",
    });

    expect(metadata.title).toBe("Mochila personalizada");
    expect(metadata.openGraph?.title).toBe("Mochila personalizada | IMPACTO33");
  });

  it("publica una OnlineStore sin datos de local físico inventados", () => {
    const schema = generateOrganizationSchema() as Record<string, unknown>;

    expect(schema["@type"]).toBe("OnlineStore");
    expect(schema["@id"]).toBe("https://impacto33.com/#organization");
    expect(schema).not.toHaveProperty("address");
    expect(schema).not.toHaveProperty("geo");
    expect(schema).not.toHaveProperty("openingHoursSpecification");
    expect(schema).not.toHaveProperty("priceRange");
  });

  it("conecta WebSite con la entidad comercial", () => {
    const schema = generateWebSiteSchema();

    expect(schema["@id"]).toBe("https://impacto33.com/#website");
    expect(schema.publisher["@id"]).toBe("https://impacto33.com/#organization");
    expect(schema.alternateName).toContain("impacto33.com");
    expect(schema).not.toHaveProperty("potentialAction");
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

  it("genera ItemList solo con elementos visibles válidos", () => {
    const schema = generateItemListSchema("Relacionados", [
      { name: "Producto A", url: "/producto/a/", image: "https://example.com/a.jpg" },
      { name: "", url: "/producto/invalido" },
    ]);

    expect(schema?.numberOfItems).toBe(1);
    expect(schema?.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Producto A",
      url: "https://impacto33.com/producto/a",
    });
  });

  it("genera Service enlazado con la OnlineStore", () => {
    const schema = generateServiceSchema({
      name: "Serigrafía textil",
      description: "Personalización mediante serigrafía.",
      url: "/servicios/serigrafia/",
      serviceType: "Serigrafía textil",
    });

    expect(schema["@type"]).toBe("Service");
    expect(schema["@id"]).toBe("https://impacto33.com/servicios/serigrafia#service");
    expect(schema.provider["@id"]).toBe("https://impacto33.com/#organization");
  });
});
