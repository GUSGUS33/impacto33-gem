import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import defaultMenuData from "@/data/defaultMenuData.json";

import { MegaMenuContent, type MegaMenuSection } from "./MegaMenu";

const TOP_LEVEL_URLS = new Set([
  "/ropa-personalizada",
  "/bolsas-personalizadas",
  "/tazas-personalizadas",
  "/regalos-de-empresa",
  "/servicios",
]);

describe("MegaMenu SSR", () => {
  it("incluye las subcategorías en el HTML inicial sin enlaces vacíos ni miniaturas", () => {
    const html = renderToStaticMarkup(
      <MegaMenuContent
        menuSections={defaultMenuData as Record<string, MegaMenuSection>}
      />
    );

    const hrefs = Array.from(
      html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g),
      match => match[1]
    );
    const uniqueSubcategoryUrls = new Set(
      hrefs.filter(href => href && !TOP_LEVEL_URLS.has(href))
    );

    expect(uniqueSubcategoryUrls.size).toBeGreaterThanOrEqual(100);
    expect(hrefs).toContain("/camisetas-personalizadas/camisetas-manga-corta");
    expect(hrefs).toContain("/vestuario-laboral/industria");
    expect(hrefs).not.toContain("#");
    expect(html).not.toMatch(/<img\b/i);
  });
});
