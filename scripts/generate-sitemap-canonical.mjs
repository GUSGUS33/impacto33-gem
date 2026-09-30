import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE_URL = "https://impacto33.com";
const GRAPHQL_URL = process.env.WP_GRAPHQL_URL || "https://creativu.es/graphql";
const PUBLIC_DIR = path.join(ROOT, "public");
const SITEMAP_DIR = path.join(PUBLIC_DIR, "sitemaps");
const REPORT_DIR = path.join(ROOT, "reports");

const seoRoutes = readJson("src/data/seo-sitemap.json");
const extraRoutes = readJson("src/data/sitemap-extra-routes.json");
const excludedRoutes = new Set(
  readJson("src/data/sitemap-excluded-routes.json").map(normalizePath),
);

const LOCAL_PAGES = new Map([
  ["/", "Artículos promocionales y regalos de empresa personalizados"],
  ["/contacto", "Contacto"],
  ["/presupuesto-rapido", "Presupuesto rápido"],
  ["/provincias", "Productos personalizados por provincia"],
  ["/quienes-somos", "¿Quiénes Somos?"],
  ["/plazos-de-entrega", "Plazos de Entrega"],
  ["/enviar-archivos", "Guía para Enviar Archivos"],
  ["/formas-de-pago", "Formas de Pago Seguras"],
  ["/tarifa-portes", "Tarifa de Portes"],
  ["/precios", "Precios y Tarifas"],
  ["/garantia-de-calidad", "Garantía de Calidad"],
  ["/trabajos-realizados", "Trabajos Realizados"],
  ["/marcas", "Nuestras Marcas"],
  ["/condiciones-generales", "Condiciones Generales de Venta"],
  ["/politica-privacidad", "Política de Privacidad"],
  ["/cookies", "Política de Cookies"],
  ["/aviso-legal", "Aviso Legal"],
  ["/preguntas-frecuentes", "Preguntas Frecuentes"],
  ["/blog", "Blog de Personalización Textil"],
  ["/servicios/serigrafia", "Serigrafía Textil"],
  ["/servicios/bordado", "Bordado Textil"],
  ["/servicios/sublimacion", "Sublimación"],
  ["/servicios/impresion-digital", "Impresión Digital Textil"],
  ["/servicios/vinilo", "Vinilo Textil"],
]);

const PAGE_QUERY = `
  query SitemapPages($after: String) {
    pages(where: { status: PUBLISH, hasPassword: false }, first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId title slug uri modified modifiedGmt
        template { templateName __typename }
        heroPageSeo { tituloPrincipal intro }
        seoMeta { canonicalUrl indexConfig { index follow } }
      }
    }
  }
`;

const PRODUCT_QUERY = `
  query SitemapProducts($after: String) {
    products(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id slug name image { sourceUrl }
        ... on ContentNode { modified }
      }
    }
  }
`;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function normalizePath(value) {
  if (!value || value === "/") return "/";
  const pathname = value.startsWith("/") ? value : `/${value}`;
  return pathname.replace(/\/+$/, "");
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function realLastmod(value) {
  if (!value || typeof value !== "string") return undefined;
  const candidate = /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

async function graphql(query, variables) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.errors?.length) throw new Error(payload.errors[0].message);
      return payload.data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function fetchConnection(query, key) {
  const nodes = [];
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const data = await graphql(query, after ? { after } : {});
    const connection = data?.[key];
    if (!connection) throw new Error(`GraphQL no devolvió la conexión ${key}`);
    nodes.push(...(connection.nodes || []));
    hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
    after = connection.pageInfo?.endCursor || null;
  }
  return nodes;
}

function sitemapXml(entries, { images = false } = {}) {
  const namespaces = images
    ? ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<urlset${namespaces}>`];
  for (const entry of entries) {
    lines.push("  <url>", `    <loc>${escapeXml(`${BASE_URL}${entry.path}`)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    if (entry.image) {
      lines.push(
        "    <image:image>",
        `      <image:loc>${escapeXml(entry.image.url)}</image:loc>`,
        `      <image:title>${escapeXml(entry.image.title)}</image:title>`,
        "    </image:image>",
      );
    }
    lines.push("  </url>");
  }
  lines.push("</urlset>", "");
  return lines.join("\n");
}

function sitemapIndexXml() {
  const children = [
    "/sitemaps/pages.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/discovery.xml",
    "/sitemap-products.xml",
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...children.flatMap((child) => [
      "  <sitemap>",
      `    <loc>${BASE_URL}${child}</loc>`,
      "  </sitemap>",
    ]),
    "</sitemapindex>",
    "",
  ].join("\n");
}

function classify(pathname, provinceSlugs) {
  if (
    pathname === "/provincias" ||
    provinceSlugs.has(pathname.slice(1)) ||
    pathname === "/sector" || pathname.startsWith("/sector/") ||
    pathname === "/ocasiones" || pathname.startsWith("/ocasiones/")
  ) return "discovery";
  if (LOCAL_PAGES.has(pathname) || pathname === "/servicios") return "pages";
  return "categories";
}

function addUnique(map, entry) {
  if (!map.has(entry.path)) map.set(entry.path, entry);
}

async function main() {
  const [pages, products] = await Promise.all([
    fetchConnection(PAGE_QUERY, "pages"),
    fetchConnection(PRODUCT_QUERY, "products"),
  ]);
  if (!pages.length) throw new Error("WordPress no devolvió páginas; no se reemplazan los sitemaps.");
  if (!products.length) throw new Error("WooCommerce no devolvió productos; no se reemplaza el sitemap de productos.");

  const provinceSource = fs.readFileSync(path.join(ROOT, "src/data/provincias.ts"), "utf8");
  const provinceSlugs = new Set(
    [...provinceSource.matchAll(/slug:\s*["']([^"']+)["']/g)].map((match) => match[1]),
  );
  const buckets = { pages: new Map(), categories: new Map(), discovery: new Map(), products: new Map() };
  const exclusions = [];

  for (const [pathname, title] of LOCAL_PAGES) {
    addUnique(buckets[classify(pathname, provinceSlugs)], { path: pathname, title });
  }

  const publishedPaths = new Set();
  for (const page of pages) {
    const pathname = normalizePath(page.uri);
    publishedPaths.add(pathname);
    if (pathname === "/" || LOCAL_PAGES.has(pathname)) continue;
    if (excludedRoutes.has(pathname)) {
      exclusions.push({ type: "page", url: pathname, reason: "Ruta excluida porque redirige o es legado" });
      continue;
    }
    if (page.seoMeta?.indexConfig?.index === false) {
      exclusions.push({ type: "page", url: pathname, reason: "WordPress marca la URL como noindex" });
      continue;
    }
    if (!page.title?.trim()) {
      exclusions.push({ type: "page", url: pathname, reason: "Falta title" });
      continue;
    }
    if (!page.heroPageSeo?.tituloPrincipal?.trim()) {
      exclusions.push({ type: "page", url: pathname, reason: "Falta H1 (heroPageSeo.tituloPrincipal)" });
      continue;
    }
    if (!page.heroPageSeo?.intro?.trim()) {
      exclusions.push({ type: "page", url: pathname, reason: "Falta el ACF mínimo heroPageSeo.intro" });
      continue;
    }
    const declaredCanonical = page.seoMeta?.canonicalUrl;
    if (declaredCanonical) {
      let canonicalPath;
      try { canonicalPath = normalizePath(new URL(declaredCanonical, BASE_URL).pathname); } catch { canonicalPath = null; }
      if (canonicalPath !== pathname) {
        exclusions.push({ type: "page", url: pathname, reason: `Canonical apunta a ${declaredCanonical}` });
        continue;
      }
    }
    const depth = pathname.split("/").filter(Boolean).length;
    if (depth > 2) {
      exclusions.push({ type: "page", url: pathname, reason: "La aplicación no publica rutas de más de dos segmentos" });
      continue;
    }
    addUnique(buckets[classify(pathname, provinceSlugs)], {
      path: pathname,
      title: page.title.trim(),
      lastmod: realLastmod(page.modifiedGmt || page.modified),
    });
  }

  const declaredRoutes = new Set([
    ...seoRoutes.map((entry) => normalizePath(entry.url)),
    ...extraRoutes.map(normalizePath),
  ]);
  for (const pathname of [...declaredRoutes].sort()) {
    if (excludedRoutes.has(pathname) || LOCAL_PAGES.has(pathname) || publishedPaths.has(pathname)) continue;
    exclusions.push({ type: classify(pathname, provinceSlugs), url: pathname, reason: "No existe como página publicada en WordPress" });
  }

  for (const product of products) {
    if (!product.slug?.trim()) {
      exclusions.push({ type: "product", url: null, reason: `Producto ${product.id || "sin ID"} sin slug` });
      continue;
    }
    // WPGraphQL ya devuelve los caracteres especiales del slug codificados.
    // Volver a aplicar encodeURIComponent convertiría "%c2%b2" en
    // "%25c2%25b2" y produciría URLs inexistentes.
    const pathname = `/producto/${product.slug.replace(/^\/+|\/+$/g, "")}`;
    if (!product.name?.trim()) {
      exclusions.push({ type: "product", url: pathname, reason: "Falta title/H1 (nombre de producto)" });
      continue;
    }
    addUnique(buckets.products, {
      path: pathname,
      title: product.name.trim(),
      lastmod: realLastmod(product.modified),
      image: product.image?.sourceUrl ? { url: product.image.sourceUrl, title: product.name.trim() } : undefined,
    });
  }

  for (const bucket of Object.values(buckets)) {
    const ordered = [...bucket.entries()].sort(([a], [b]) => a.localeCompare(b));
    bucket.clear();
    for (const [key, value] of ordered) bucket.set(key, value);
  }

  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SITEMAP_DIR, "pages.xml"), sitemapXml([...buckets.pages.values()]));
  fs.writeFileSync(path.join(SITEMAP_DIR, "categories.xml"), sitemapXml([...buckets.categories.values()]));
  fs.writeFileSync(path.join(SITEMAP_DIR, "discovery.xml"), sitemapXml([...buckets.discovery.values()]));
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-products.xml"), sitemapXml([...buckets.products.values()], { images: true }));
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-index.xml"), sitemapIndexXml());
  fs.writeFileSync(path.join(REPORT_DIR, "sitemap-quality-exclusions.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: GRAPHQL_URL,
    counts: Object.fromEntries(Object.entries(buckets).map(([key, value]) => [key, value.size])),
    exclusions: exclusions.sort((a, b) => String(a.url).localeCompare(String(b.url))),
  }, null, 2)}\n`);

  console.log("Sitemaps generated from the canonical WordPress inventory:");
  for (const [name, bucket] of Object.entries(buckets)) console.log(`- ${name}: ${bucket.size}`);
  console.log(`- exclusions: ${exclusions.length} (reports/sitemap-quality-exclusions.json)`);
}

main().catch((error) => {
  console.error("Sitemap generation failed; existing files were not intentionally replaced:", error);
  process.exitCode = 1;
});
