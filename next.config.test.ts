// @vitest-environment node

import { describe, expect, it } from "vitest";

import nextConfig from "./next.config.js";
import auditedLegacyRedirects from "./src/data/legacy-redirects.json";

describe("legacy sitemap redirects", () => {
  it("redirects obsolete sport leaves directly to their canonical pages", async () => {
    const redirects = await nextConfig.redirects?.();
    const destinations = new Map(
      (redirects ?? []).map(redirect => [redirect.source, redirect.destination])
    );

    expect(
      destinations.get("/deporte-personalizado/equipaciones/camisetas")
    ).toBe(
      "https://impacto33.com/deportes-personalizados/equipaciones-personalizadas"
    );
    expect(
      destinations.get("/deporte-personalizado/equipaciones/pantalones")
    ).toBe(
      "https://impacto33.com/deportes-personalizados/equipaciones-personalizadas"
    );
    expect(destinations.get("/deporte-personalizado/accesorios/botellas")).toBe(
      "https://impacto33.com/deportes-personalizados/accesorios-deportivos-personalizados"
    );
    expect(destinations.get("/deporte-personalizado/accesorios/toallas")).toBe(
      "https://impacto33.com/deportes-personalizados/accesorios-deportivos-personalizados"
    );
  });
});

describe("audited legacy redirects", () => {
  it("contains only the approved high and medium confidence inventory", () => {
    expect(auditedLegacyRedirects).toHaveLength(353);
    expect(
      auditedLegacyRedirects.filter(rule => rule.confidence === "Alta")
    ).toHaveLength(232);
    expect(
      auditedLegacyRedirects.filter(rule => rule.confidence === "Media")
    ).toHaveLength(121);
    expect(
      auditedLegacyRedirects.some(rule => rule.confidence === "Baja")
    ).toBe(false);
  });

  it("has no duplicate sources, loops, or destinations that create chains", () => {
    const sources = new Map(
      auditedLegacyRedirects.map(rule => [rule.source, rule.destination])
    );

    expect(sources.size).toBe(auditedLegacyRedirects.length);
    for (const rule of auditedLegacyRedirects) {
      expect(rule.destination).not.toBe(rule.source);
      expect(sources.has(rule.destination)).toBe(false);
    }
  });

  it("publishes a direct 301 for both slash variants of every path without a legacy query", async () => {
    const redirects = await nextConfig.redirects?.();
    const redirectMap = new Map(
      (redirects ?? []).map(redirect => [redirect.source, redirect])
    );

    for (const rule of auditedLegacyRedirects.filter(
      rule => !rule.sourceQuery
    )) {
      for (const source of [rule.source, `${rule.source}/`]) {
        expect(redirectMap.get(source)).toMatchObject({
          destination: `https://impacto33.com${rule.destination}`,
          statusCode: 301,
        });
      }
    }
  });

  it("leaves the legacy-query path to its exact route handler", async () => {
    const redirects = await nextConfig.redirects?.();
    const exactSources = new Set(
      (redirects ?? [])
        .filter(redirect => !redirect.source.includes(":"))
        .map(redirect => redirect.source)
    );

    expect(exactSources.has("/bolsas-ferias-eventos/bolsa-sea-roly")).toBe(
      false
    );
    expect(exactSources.has("/bolsas-ferias-eventos/bolsa-sea-roly/")).toBe(
      false
    );
  });

  it("does not redirect excluded low-confidence, current, or 404/410 paths", async () => {
    const redirects = await nextConfig.redirects?.();
    const exactSources = new Set(
      (redirects ?? [])
        .filter(redirect => !redirect.source.includes(":"))
        .map(redirect => redirect.source)
    );

    expect(exactSources.has("/gorras-trucker")).toBe(false);
    expect(exactSources.has("/contacto")).toBe(false);
    expect(exactSources.has("/mascarillas-antivirus")).toBe(false);
  });
});
