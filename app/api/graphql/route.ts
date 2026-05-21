import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = { query: text };
    }
    
    // Always call the upstream WP API securely on the server side
    const url = process.env.VITE_WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || "https://creativu.es/graphql";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
        console.error("WP GraphQL Error Status:", response.status, response.statusText);
        const errText = await response.text();
        return NextResponse.json({ error: "Failed to fetch from upstream", status: response.status, details: errText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API GraphQL Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
