import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRestoredProductConfig } from "./useRestoredProductConfig";

const mockLoadProductConfig = vi.fn();

vi.mock("@/services/productConfigService", () => ({
  loadProductConfig: (...args: unknown[]) => mockLoadProductConfig(...args),
}));

describe("restauración de configuración después de hidratar", () => {
  beforeEach(() => {
    mockLoadProductConfig.mockReset();
    mockLoadProductConfig.mockReturnValue(null);
  });

  it("no consulta localStorage durante el render SSR", () => {
    const Probe = () => {
      const { isReady } = useRestoredProductConfig("producto-prueba");
      return <span>{isReady ? "ready" : "pending"}</span>;
    };

    expect(renderToStaticMarkup(<Probe />)).toContain("pending");
    expect(mockLoadProductConfig).not.toHaveBeenCalled();
  });

  it("carga la configuración tras el montaje del cliente", async () => {
    mockLoadProductConfig.mockReturnValue({ productSlug: "producto-prueba" });

    const { result } = renderHook(() => useRestoredProductConfig("producto-prueba"));

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(mockLoadProductConfig).toHaveBeenCalledWith("producto-prueba");
    expect(result.current.config).toEqual({ productSlug: "producto-prueba" });
  });
});
