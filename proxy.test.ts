import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

function wwwRequest(path: string) {
  return new NextRequest(`https://www.impacto33.com${path}`, {
    headers: { host: "www.impacto33.com" },
  });
}

describe("canonical host proxy", () => {
  it("redirects www pages directly to HTTPS without www and preserves legitimate queries", () => {
    const response = proxy(wwwRequest("/busqueda?q=camisetas&pagina=2"));

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://impacto33.com/busqueda?q=camisetas&pagina=2"
    );
  });

  it("removes the obsolete query from the exact legacy URL", () => {
    const response = proxy(
      wwwRequest(
        "/bolsas-ferias-eventos/bolsa-sea-roly?IDPRO=2979&ID_MENU_NIVEL_1=156&idi_lang=1"
      )
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://impacto33.com/bolsas-personalizadas"
    );
  });

  it("does not redirect the canonical host", () => {
    const request = new NextRequest("https://impacto33.com/contacto", {
      headers: { host: "impacto33.com" },
    });
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("uses the forwarded host supplied by the Plesk proxy chain", () => {
    const request = new NextRequest("http://127.0.0.1:3000/contacto", {
      headers: {
        host: "127.0.0.1:3000",
        "x-forwarded-host": "www.impacto33.com",
      },
    });
    const response = proxy(request);

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://impacto33.com/contacto"
    );
  });
});
