import { NextResponse } from 'next/server';

const UPSTREAM_URL =
  process.env.VITE_WP_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
  "https://creativu.es/graphql";

async function fetchFromUpstream(body: any, attempt = 1): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://creativu.es",
        "Referer": "https://creativu.es/",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // If 5xx status and first attempt, retry once after 500ms
    if (!res.ok && res.status >= 500 && attempt < 2) {
      console.warn(`[WP GraphQL Proxy] Upstream status ${res.status}, retrying (attempt ${attempt + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return fetchFromUpstream(body, attempt + 1);
    }

    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (attempt < 2) {
      console.warn(`[WP GraphQL Proxy] Fetch error (${err?.message}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return fetchFromUpstream(body, attempt + 1);
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const text = await req.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { query: text };
    }

    const response = await fetchFromUpstream(body);

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    // Upstream returned non-JSON (HTML/plaintext error)
    const errText = await response.text();
    console.error(
      `[WP GraphQL Proxy] Upstream returned status ${response.status} with non-JSON body:`,
      errText.slice(0, 200)
    );

    return NextResponse.json(
      {
        data: null,
        errors: [
          {
            message: `WordPress GraphQL returned HTTP ${response.status}: ${response.statusText}`,
            extensions: { status: response.status },
          },
        ],
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[WP GraphQL Proxy] Error handling request:", error?.message);
    return NextResponse.json(
      {
        data: null,
        errors: [
          {
            message: error?.message || "Internal server error connecting to GraphQL",
          },
        ],
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

