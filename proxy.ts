import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_ORIGIN = "https://impacto33.com";
const LEGACY_QUERY_PATH = "/bolsas-ferias-eventos/bolsa-sea-roly";
const LEGACY_QUERY_DESTINATION = "/bolsas-personalizadas";

function normalizedPathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function requestHostname(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",", 1)[0]
    .trim();
  const host = forwardedHost || request.headers.get("host") || "";

  return host.split(":", 1)[0].toLowerCase();
}

export function proxy(request: NextRequest) {
  const hostname = requestHostname(request);

  if (hostname !== "www.impacto33.com") {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    CANONICAL_ORIGIN
  );

  if (normalizedPathname(request.nextUrl.pathname) === LEGACY_QUERY_PATH) {
    destination.pathname = LEGACY_QUERY_DESTINATION;
    destination.search = "";
  }

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
