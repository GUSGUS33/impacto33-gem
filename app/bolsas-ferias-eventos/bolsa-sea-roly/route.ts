const CANONICAL_DESTINATION = "https://impacto33.com/bolsas-personalizadas";

function cleanLegacyRedirect() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: CANONICAL_DESTINATION,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export function GET() {
  return cleanLegacyRedirect();
}

export function HEAD() {
  return cleanLegacyRedirect();
}
