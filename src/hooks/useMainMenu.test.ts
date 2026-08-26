import { describe, it, expect } from "vitest";
import {
  cleanLabel,
  slugify,
  normalizeUri,
  mapWPMenuToSections,
} from "./useMainMenu";
import type { WPMenuItem } from "./useMainMenu";

describe("cleanLabel", () => {
  it("removes text after pipe separator", () => {
    expect(
      cleanLabel(
        "Sudaderas con Capucha Personalizadas | Hoodies con Logo desde 7,95€"
      )
    ).toBe("Sudaderas con Capucha Personalizadas");
  });

  it("returns full label when no pipe exists", () => {
    expect(cleanLabel("Ropa Personalizada")).toBe("Ropa Personalizada");
  });

  it("trims whitespace around pipe", () => {
    expect(cleanLabel("Polos Personalizados  |  Bordado y Serigrafía")).toBe(
      "Polos Personalizados"
    );
  });

  it("handles empty string", () => {
    expect(cleanLabel("")).toBe("");
  });

  it("handles label with multiple pipes", () => {
    expect(cleanLabel("A | B | C")).toBe("A");
  });
});

describe("slugify", () => {
  it("converts to lowercase kebab-case", () => {
    expect(slugify("Ropa Personalizada")).toBe("ropa-personalizada");
  });

  it("removes accents", () => {
    expect(slugify("Tazas y Botellas")).toBe("tazas-y-botellas");
  });

  it("handles special characters", () => {
    expect(slugify("Merchandising & Más")).toBe("merchandising-mas");
  });

  it("handles accented characters", () => {
    expect(slugify("Serigrafía")).toBe("serigrafia");
  });
});

describe("normalizeUri", () => {
  it("returns # as-is", () => {
    expect(normalizeUri("#")).toBe("#");
  });

  it("removes trailing slash", () => {
    expect(normalizeUri("/camisetas-personalizadas/")).toBe(
      "/camisetas-personalizadas"
    );
  });

  it("keeps root slash", () => {
    expect(normalizeUri("/")).toBe("/");
  });

  it("adds leading slash if missing", () => {
    expect(normalizeUri("servicios/serigrafia")).toBe("/servicios/serigrafia");
  });

  it("extracts path from full URL", () => {
    expect(
      normalizeUri("https://creativu.es/camisetas-personalizadas/")
    ).toBe("/camisetas-personalizadas");
  });

  it("handles nested paths", () => {
    expect(
      normalizeUri("/camisetas-personalizadas/camisetas-manga-corta/")
    ).toBe("/camisetas-personalizadas/camisetas-manga-corta");
  });
});

describe("mapWPMenuToSections", () => {
  const mockWPItems: WPMenuItem[] = [
    {
      id: "1",
      label: "Ropa Personalizada",
      uri: "#",
      childItems: {
        nodes: [
          {
            id: "2",
            label: "Camisetas Personalizadas",
            uri: "/camisetas-personalizadas/",
            childItems: {
              nodes: [
                {
                  id: "3",
                  label: "Camisetas Manga Corta Personalizadas",
                  uri: "/camisetas-personalizadas/camisetas-manga-corta/",
                },
                {
                  id: "4",
                  label: "Camisetas Manga Larga Personalizadas",
                  uri: "/camisetas-personalizadas/camisetas-manga-larga/",
                },
              ],
            },
          },
          {
            id: "5",
            label: "Sudaderas Personalizadas con Logo | Serigrafía y Bordado",
            uri: "/sudaderas-personalizadas/",
            childItems: {
              nodes: [
                {
                  id: "6",
                  label:
                    "Sudaderas con Capucha Personalizadas | Hoodies desde 7,95€",
                  uri: "/sudaderas-personalizadas/sudaderas-con-capucha/",
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "10",
      label: "Servicios",
      uri: "/servicios/",
      childItems: {
        nodes: [
          {
            id: "11",
            label: "Impresión DTF",
            uri: "/servicios/impresion-dtf/",
          },
          {
            id: "12",
            label: "Serigrafía",
            uri: "/servicios/serigrafia/",
          },
        ],
      },
    },
  ];

  it("creates correct number of sections", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    expect(Object.keys(sections)).toHaveLength(2);
  });

  it("uses slugified section title as key", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    expect(sections["ropa-personalizada"]).toBeDefined();
    expect(sections["servicios"]).toBeDefined();
  });

  it("maps section title correctly", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    expect(sections["ropa-personalizada"].title).toBe("Ropa Personalizada");
    expect(sections["servicios"].title).toBe("Servicios");
  });

  it("maps columns (level 2) correctly", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const ropa = sections["ropa-personalizada"];
    expect(ropa.columns).toHaveLength(2);
    expect(ropa.columns[0].title).toBe("CAMISETAS PERSONALIZADAS");
    expect(ropa.columns[0].href).toBe("/camisetas-personalizadas");
  });

  it("cleans column labels by removing pipe content", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const ropa = sections["ropa-personalizada"];
    expect(ropa.columns[1].title).toBe(
      "SUDADERAS PERSONALIZADAS CON LOGO"
    );
  });

  it("maps sub-items (level 3) correctly", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const ropa = sections["ropa-personalizada"];
    const camisetas = ropa.columns[0];
    expect(camisetas.items).toHaveLength(2);
    expect(camisetas.items![0].label).toBe(
      "Camisetas Manga Corta Personalizadas"
    );
    expect(camisetas.items![0].href).toBe(
      "/camisetas-personalizadas/camisetas-manga-corta"
    );
  });

  it("cleans sub-item labels by removing pipe content", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const ropa = sections["ropa-personalizada"];
    const sudaderas = ropa.columns[1];
    expect(sudaderas.items![0].label).toBe(
      "Sudaderas con Capucha Personalizadas"
    );
  });

  it("handles leaf columns without sub-items", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const servicios = sections["servicios"];
    expect(servicios.columns).toHaveLength(2);
    expect(servicios.columns[0].title).toBe("IMPRESIÓN DTF");
    expect(servicios.columns[0].items).toBeUndefined();
  });

  it("normalizes URIs removing trailing slashes", () => {
    const sections = mapWPMenuToSections(mockWPItems);
    const servicios = sections["servicios"];
    expect(servicios.columns[0].href).toBe("/servicios/impresion-dtf");
    expect(servicios.columns[1].href).toBe("/servicios/serigrafia");
  });

  it("handles empty menu items array", () => {
    const sections = mapWPMenuToSections([]);
    expect(Object.keys(sections)).toHaveLength(0);
  });

  it("handles section with no children", () => {
    const items: WPMenuItem[] = [
      { id: "1", label: "Empty Section", uri: "#" },
    ];
    const sections = mapWPMenuToSections(items);
    expect(sections["empty-section"].columns).toHaveLength(0);
  });
});
