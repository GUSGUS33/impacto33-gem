import { describe, expect, it } from "vitest";
import {
  buildProductFaqs,
  formatProductOptionLabel,
  getProductAttributeGroups,
  getUniqueProductSummary,
  normalizeProductText,
} from "./productContent";

describe("contenido editorial de producto", () => {
  it("normaliza HTML y entidades para comparar el contenido real", () => {
    expect(normalizeProductText("<p>Algodón&nbsp;&amp; poliéster</p>"))
      .toBe("algodón & poliéster");
  });

  it("omite un resumen duplicado dentro de la descripción larga", () => {
    expect(getUniqueProductSummary(
      "<p>Antifaz cómodo para viajes.</p>",
      "<p>Antifaz cómodo para viajes.</p><p>Disponible en varios colores.</p>",
    )).toBeNull();
  });

  it("conserva un resumen breve cuando aporta texto distinto", () => {
    const summary = "<p>Personalízalo para tu próximo evento.</p>";

    expect(getUniqueProductSummary(
      summary,
      "<p>Antifaz de microfibra con doble elástico.</p>",
    )).toBe(summary);
  });

  it("omite textos largos de la zona reservada a la calculadora", () => {
    const longSummary = `<p>${"Descripción extensa ".repeat(30)}</p>`;

    expect(getUniqueProductSummary(longSummary, "<p>Otra descripción.</p>"))
      .toBeNull();
  });

  it("convierte etiquetas internas de talla en texto natural", () => {
    expect(formatProductOptionLabel("TALLA-UNICA-ADULTO")).toBe("Talla única");
    expect(formatProductOptionLabel("xxl")).toBe("XXL");
  });

  it("prepara únicamente atributos con valores útiles", () => {
    expect(getProductAttributeGroups([
      { name: "pa_material", options: ["microfibra", "microfibra"] },
      { name: "pa_composicion", options: ["algodón"] },
      { name: "vacío", options: [] },
    ])).toEqual([
      { label: "Material", values: ["Microfibra"] },
      { label: "Composición", values: ["Algodón"] },
    ]);
  });

  it("genera preguntas específicas con la cantidad mínima real", () => {
    const faqs = buildProductFaqs("Antifaz de viaje", 50);

    expect(faqs).toHaveLength(3);
    expect(faqs[0]).toEqual(expect.objectContaining({
      question: "¿Cuál es la cantidad mínima de Antifaz de viaje?",
      answer: expect.stringContaining("50 unidades"),
    }));
  });
});
