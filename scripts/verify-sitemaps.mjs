import { JSDOM } from "jsdom";

const LOCAL_BASE = process.env.SITEMAP_VERIFY_BASE || "http://127.0.0.1:3400";
const CONCURRENCY = Number(process.env.SITEMAP_VERIFY_CONCURRENCY || 10);

function parseXml(xml, expectedRoot) {
  const document = new JSDOM(xml, { contentType: "text/xml" }).window.document;
  const parserError = document.querySelector("parsererror");
  if (parserError) throw new Error(parserError.textContent || "XML inválido");
  if (document.documentElement.localName !== expectedRoot) {
    throw new Error(`Raíz XML inesperada: ${document.documentElement.localName}`);
  }
  return document;
}

function localUrl(canonicalUrl) {
  const parsed = new URL(canonicalUrl);
  return `${LOCAL_BASE}${parsed.pathname}${parsed.search}`;
}

async function fetchWithRetry(url) {
  let lastResult;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
      });
      lastResult = { status: response.status, location: response.headers.get("location") };
      if (response.status < 500) return lastResult;
    } catch (error) {
      lastResult = { status: 0, error: error instanceof Error ? error.message : String(error) };
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
  }
  return lastResult;
}

async function mapLimit(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
      if ((index + 1) % 100 === 0 || index + 1 === items.length) {
        console.log(`  comprobadas ${index + 1}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

const indexResponse = await fetch(`${LOCAL_BASE}/sitemap.xml`, { redirect: "manual" });
if (indexResponse.status !== 200) throw new Error(`/sitemap.xml devolvió ${indexResponse.status}`);
const indexDocument = parseXml(await indexResponse.text(), "sitemapindex");
const sitemapUrls = [...indexDocument.querySelectorAll("loc")].map((node) => node.textContent.trim());

const summary = [];
const allFailures = [];
for (const sitemapUrl of sitemapUrls) {
  const pathname = new URL(sitemapUrl).pathname;
  const response = await fetch(localUrl(sitemapUrl), { redirect: "manual" });
  if (response.status !== 200) throw new Error(`${pathname} devolvió ${response.status}`);
  const document = parseXml(await response.text(), "urlset");
  const urls = [...document.querySelectorAll("url > loc")].map((node) => node.textContent.trim());
  console.log(`${pathname}: ${urls.length} URLs`);
  const checks = await mapLimit(urls, async (url) => ({ url, ...(await fetchWithRetry(localUrl(url))) }));
  const failures = checks.filter((check) => check.status !== 200);
  summary.push({ sitemap: pathname, total: urls.length, ok: urls.length - failures.length, failures: failures.length });
  allFailures.push(...failures.map((failure) => ({ sitemap: pathname, ...failure })));
}

console.log("SITEMAP_CRAWL_SUMMARY", JSON.stringify(summary));
console.log("SITEMAP_CRAWL_FAILURES", JSON.stringify(allFailures));
if (allFailures.length) process.exitCode = 1;
