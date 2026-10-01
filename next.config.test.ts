// @vitest-environment node

import { describe, expect, it } from "vitest";

import nextConfig from "./next.config.js";

describe("legacy sitemap redirects", () => {
  it("redirects obsolete sport leaves directly to their canonical pages", async () => {
    const redirects = await nextConfig.redirects?.();
    const destinations = new Map(
      (redirects ?? []).map((redirect) => [redirect.source, redirect.destination]),
    );

    expect(destinations.get("/deporte-personalizado/equipaciones/camisetas")).toBe(
      "/deportes-personalizados/equipaciones-personalizadas",
    );
    expect(destinations.get("/deporte-personalizado/equipaciones/pantalones")).toBe(
      "/deportes-personalizados/equipaciones-personalizadas",
    );
    expect(destinations.get("/deporte-personalizado/accesorios/botellas")).toBe(
      "/deportes-personalizados/accesorios-deportivos-personalizados",
    );
    expect(destinations.get("/deporte-personalizado/accesorios/toallas")).toBe(
      "/deportes-personalizados/accesorios-deportivos-personalizados",
    );
  });
});
