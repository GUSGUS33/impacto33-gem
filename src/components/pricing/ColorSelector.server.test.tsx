import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ColorSelector from "./ColorSelector";

vi.mock("@/hooks/useNotification", () => ({
  useNotification: () => ({ success: vi.fn() }),
}));

describe("semántica SSR del selector de color", () => {
  it("usa fieldset y legend sin introducir encabezados SEO", () => {
    const html = renderToStaticMarkup(
      <ColorSelector
        availableColors={[{
          id: "negro",
          name: "Negro",
          value: "#000000",
          stockStatus: "IN_STOCK",
        }]}
        selectedColor="Negro"
        onColorSelect={vi.fn()}
      />,
    );
    expect(html).toMatch(/<fieldset[\s\S]*<legend[^>]*>[\s\S]*Selecciona Color[\s\S]*<\/legend>/);
    expect(html).not.toMatch(/<h[1-6]\b/);
    expect(html).toContain('aria-pressed="true"');
  });
});
