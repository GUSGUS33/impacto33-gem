import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import FloatingSummary from "./FloatingSummary";

let intersection: (entries: { isIntersecting: boolean }[]) => void;
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof intersection) {
        intersection = callback;
      }
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(quantity: number) {
  return render(
    <div data-quote-calculator>
      <section data-quote-step="5">
        <FloatingSummary
          quantity={quantity}
          minimum={25}
          total={445.05}
          unit={17.8}
        />
      </section>
    </div>
  );
}
it("never shows a bar for zero units", () => {
  mount(0);
  act(() => intersection([{ isIntersecting: false }]));
  expect(screen.queryByRole("button")).toBeNull();
});
it("hides prices below minimum and disappears when step 5 intersects", () => {
  mount(13);
  act(() => intersection([{ isIntersecting: false }]));
  expect(screen.getByText(/Faltan 12/)).toBeTruthy();
  expect(screen.queryByText(/€/)).toBeNull();
  act(() => intersection([{ isIntersecting: true }]));
  expect(screen.queryByRole("button")).toBeNull();
});
it("uses supplied amounts and scrolls to summary without opening a form", () => {
  const { container } = mount(25);
  const scroll = vi.fn();
  container.querySelector("section")!.scrollIntoView = scroll;
  act(() => intersection([{ isIntersecting: false }]));
  expect(screen.getByText(/445,05/)).toBeTruthy();
  expect(screen.getByText(/17,80/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Ver presupuesto" }));
  expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
});
