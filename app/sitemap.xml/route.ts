const BASE_URL = "https://impacto33.com";

const CHILD_SITEMAPS = [
  "/sitemaps/pages.xml",
  "/sitemaps/categories.xml",
  "/sitemaps/discovery.xml",
  "/sitemap-products.xml",
];

export const dynamic = "force-static";

export function GET() {
  const children = CHILD_SITEMAPS.map(
    (path) => `  <sitemap>\n    <loc>${BASE_URL}${path}</loc>\n  </sitemap>`,
  ).join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    children,
    "</sitemapindex>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
