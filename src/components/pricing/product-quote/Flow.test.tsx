import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ProductQuoteCalculator from "./ProductQuoteCalculator";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  saved: null as null | Record<string, unknown>,
  colors: [
    { id: "black", name: "negro", stockStatus: "IN_STOCK" },
    { id: "white", name: "blanco", stockStatus: "IN_STOCK" },
  ],
  selected: "",
  quantity: 0,
}));
vi.mock("@/hooks/useProductPricing", () => ({
  useProductPricing: () => ({
    availableColors: mocks.colors,
    sizeOptions: [],
    pricingData: null,
    selectedColor: mocks.selected,
    quantities: {},
    selectedZones: [],
    priceCalculation: null,
    hasSelectedColor: !!mocks.selected,
    canEnterQuantities: !!mocks.selected,
    isReadyForPricing: mocks.quantity > 0,
    isValid: false,
    isCalculating: false,
    totalQuantity: mocks.quantity,
    colorVariations: [],
    selectColor: mocks.select,
    updateQuantity: vi.fn(),
    toggleZone: vi.fn(),
    restoreConfiguration: mocks.restore,
    resetConfiguration: vi.fn(),
  }),
}));
vi.mock("@/hooks/useProductConfig", () => ({
  useProductConfig: (value: unknown) => mocks.save(value),
}));
vi.mock("@/hooks/useRestoredProductConfig", () => ({
  useRestoredProductConfig: () => ({ config: mocks.saved, isReady: true }),
}));
vi.mock("../QuoteRequestModal", () => ({ QuoteRequestModal: () => null }));
vi.mock("./Delivery", () => ({
  default: ({ defaultOption }: { defaultOption: string }) => (
    <span data-testid="delivery">{defaultOption}</span>
  ),
}));

const product = {
  id: "123",
  slug: "test",
  name: "Prueba",
  price: "10",
} as React.ComponentProps<typeof ProductQuoteCalculator>["product"];
beforeEach(() => {
  vi.clearAllMocks();
  mocks.saved = null;
  mocks.selected = "";
  mocks.quantity = 0;
  mocks.colors = [
    { id: "black", name: "negro", stockStatus: "IN_STOCK" },
    { id: "white", name: "blanco", stockStatus: "IN_STOCK" },
  ];
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("con varios colores mantiene 2–5 bloqueados", () => {
  const { container } = render(<ProductQuoteCalculator product={product} />);
  expect(
    container.querySelectorAll('section[data-locked="true"]')
  ).toHaveLength(4);
  expect(mocks.select).not.toHaveBeenCalled();
});
it("preselecciona el único color disponible usando selectColor existente", () => {
  mocks.colors = mocks.colors.slice(0, 1);
  render(<ProductQuoteCalculator product={product} />);
  expect(mocks.select).toHaveBeenCalledWith("negro");
});
it("no restaura urgente ni su recargo aunque recupere color y cantidades", () => {
  mocks.saved = {
    selectedColor: "negro",
    quantities: { M: 25 },
    activeZones: ["frontal"],
    printingMethod: "DTF",
    deliveryOption: "urgente",
  };
  render(<ProductQuoteCalculator product={product} />);
  expect(mocks.restore).toHaveBeenCalledWith({
    selectedColor: "negro",
    quantities: { M: 25 },
    selectedZones: ["frontal"],
  });
  expect(screen.getByTestId("delivery").textContent).toBe("sin_prisa");
  expect(mocks.save.mock.lastCall?.[0].deliveryOption).toBe("sin_prisa");
});
it("cancelar cambio conserva configuración; aceptar llama selectColor sin modificarlo", () => {
  mocks.selected = "negro";
  mocks.quantity = 25;
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<ProductQuoteCalculator product={product} />);
  fireEvent.click(screen.getByRole("button", { name: "Blanco" }));
  expect(confirm).toHaveBeenCalledOnce();
  expect(mocks.select).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "Blanco" }));
  expect(mocks.select).toHaveBeenCalledWith("blanco");
});
