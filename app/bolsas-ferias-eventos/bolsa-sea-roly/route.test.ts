import { describe, expect, it } from "vitest";

import { GET, HEAD } from "./route";

describe("legacy bolsa Sea Roly redirect", () => {
  it.each([
    ["GET", GET],
    ["HEAD", HEAD],
  ])("returns a clean permanent redirect for %s", (_method, handler) => {
    const response = handler();

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://impacto33.com/bolsas-personalizadas"
    );
    expect(new URL(response.headers.get("location")!).search).toBe("");
  });
});
