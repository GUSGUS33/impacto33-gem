import { describe, expect, it } from "vitest";
import { normalizeInternalHref, normalizeUri } from "./url";

describe("normalizeInternalHref", () => {
  it("conserva la raíz", () => {
    expect(normalizeInternalHref("/")).toBe("/");
    expect(normalizeInternalHref("")).toBe("/");
    expect(normalizeInternalHref(null)).toBe("/");
  });

  it("elimina la barra final de rutas internas", () => {
    expect(normalizeInternalHref("/camisetas-personalizadas/")).toBe("/camisetas-personalizadas");
    expect(normalizeInternalHref("camisetas-personalizadas/")).toBe("/camisetas-personalizadas");
  });

  it("convierte URLs propias y de WordPress en rutas internas", () => {
    expect(normalizeInternalHref("https://www.impacto33.com/sudaderas-personalizadas/")).toBe("/sudaderas-personalizadas");
    expect(normalizeInternalHref("https://creativu.es/escritura-personalizada/")).toBe("/escritura-personalizada");
  });

  it("mantiene intactas las URLs externas", () => {
    expect(normalizeInternalHref("https://example.com/path/")).toBe("https://example.com/path/");
  });

  it("preserva parámetros y anclas", () => {
    expect(normalizeInternalHref("/camisetas-personalizadas/?color=rojo#modelos")).toBe("/camisetas-personalizadas?color=rojo#modelos");
    expect(normalizeInternalHref("#modelos")).toBe("#modelos");
  });

  it("es idempotente y expone el alias normalizeUri", () => {
    const normalized = normalizeInternalHref("/ropa-laboral/");
    expect(normalizeInternalHref(normalized)).toBe(normalized);
    expect(normalizeUri("/ropa-laboral/")).toBe(normalized);
  });
});
