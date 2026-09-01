import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const expressPort = process.env.EXPRESS_PORT || "3001";

  try {
    const apiResponse = await fetch(`http://127.0.0.1:${expressPort}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    const apiHealthy = apiResponse.ok;

    return NextResponse.json(
      {
        status: apiHealthy ? "ok" : "degraded",
        web: "ok",
        api: apiHealthy ? "ok" : "unavailable",
      },
      {
        status: apiHealthy ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", web: "ok", api: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
