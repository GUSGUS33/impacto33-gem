import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { OptionalPrice, stockLabel, Step, QuantityGrid } from "./Presentation";
import Summary from "./Summary";
import { captureQuoteSnapshot } from "@/lib/quoteSnapshot";
import { calculateScaledPrice } from "@/services/pricingService";
import pricing from "@/data/pricing/_default.json";

afterEach(cleanup);
describe("Presentación aislada del presupuesto", () => {
  it.each([undefined, null, 0, NaN, Infinity])(
    "no fabrica precio para %s",
    amount => {
      const { container } = render(<OptionalPrice amount={amount} />);
      expect(container.textContent).toBe("");
    }
  );
  it("presenta un precio real positivo", () => {
    const { container } = render(<OptionalPrice amount={12.5} suffix="/ud" />);
    expect(container.textContent).toContain("12,50");
  });
  it("oculta números sintéticos y conserva stock real", () => {
    expect(stockLabel(9999, true, false)).toBe("En stock");
    expect(stockLabel(999, false, false)).toBe("En stock");
    expect(stockLabel(501, true, false)).toBe("Stock: 501 uds");
    expect(stockLabel(12, true, false)).toBe("Quedan 12");
    expect(stockLabel(0, true, true)).toBe("Agotado");
  });
  it("mantiene visible y bloqueado un paso pendiente", () => {
    const { container } = render(
      <Step number={2} title="Cantidad" locked>
        <button>Prueba</button>
      </Step>
    );
    expect(container.querySelector("fieldset")?.disabled).toBe(true);
    expect(container.querySelector("fieldset")?.hasAttribute("inert")).toBe(
      true
    );
    expect(container.querySelector("section")?.dataset.locked).toBe("true");
  });
  it("talla única delega al callback y avisa sobre stock sin alterar el cálculo", () => {
    const onQuantityChange = vi.fn(),
      onWarning = vi.fn();
    render(
      <QuantityGrid
        sizeOptions={[
          {
            size: "Única",
            price: 10,
            stockQuantity: 12,
            stockStatus: "IN_STOCK",
          },
        ]}
        quantities={{}}
        selectedColor="naranja-fuego"
        stockKnown={() => true}
        onQuantityChange={onQuantityChange}
        onWarning={onWarning}
      />
    );
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "20" },
    });
    expect(onQuantityChange).toHaveBeenCalledWith("Única", 20);
    expect(onWarning.mock.calls[0][0]).toContain("Solo quedan 12");
    expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
  });
  it("bloquea CTA bajo mínimo y abre el popup por el callback existente al alcanzarlo", () => {
    const onRequestQuote = vi.fn();
    const { rerender } = render(
      <Summary
        priceCalculation={calculateScaledPrice(10, 1, [], pricing)}
        quoteSnapshot={captureQuoteSnapshot(calculateScaledPrice(10, 1, [], pricing), 0, 'sin_prisa', new Date(), 'DTF')}
        selectedColor="negro"
        modalOpen={false}
        onRequestQuote={onRequestQuote}
      />
    );
    expect(
      (screen.getAllByRole("button")[0] as HTMLButtonElement).disabled
    ).toBe(true);
    expect(screen.getAllByRole("button")[0].textContent).toContain(
      "AÑADE 9 UDS"
    );
    rerender(
      <Summary
        priceCalculation={calculateScaledPrice(10, 10, [], pricing)}
        quoteSnapshot={captureQuoteSnapshot(calculateScaledPrice(10, 10, [], pricing), 0, 'sin_prisa', new Date(), 'DTF')}
        selectedColor="negro"
        modalOpen={false}
        onRequestQuote={onRequestQuote}
      />
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "SOLICITAR PRESUPUESTO" })[0]
    );
    expect(onRequestQuote).toHaveBeenCalledOnce();
    expect(screen.queryByText("Desglose de precios")).toBeNull();
  });
});
