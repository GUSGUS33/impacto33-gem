import { readFileSync } from "node:fs";

const BASE_URL = (
  process.env.REDIRECT_BASE_URL || "http://127.0.0.1:3000"
).replace(/\/$/, "");
const CONCURRENCY = Number(process.env.REDIRECT_VERIFY_CONCURRENCY || 4);
const REQUEST_HOST = process.env.REDIRECT_REQUEST_HOST;
const rules = JSON.parse(
  readFileSync(
    new URL("../src/data/legacy-redirects.json", import.meta.url),
    "utf8"
  )
);

function normalizePath(pathname) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

async function mapConcurrent(items, concurrency, callback) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await callback(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

const failures = [];
const sources = new Set();
const destinations = new Set();
let highConfidence = 0;
let mediumConfidence = 0;

for (const rule of rules) {
  const source = normalizePath(rule.source);
  const destination = normalizePath(rule.destination);

  if (sources.has(source)) {
    failures.push({ source, problem: "duplicate source" });
  }
  sources.add(source);
  destinations.add(destination);

  if (source === destination) {
    failures.push({ source, problem: "redirect loop" });
  }
  if (!source.startsWith("/") || !destination.startsWith("/")) {
    failures.push({ source, destination, problem: "paths must be relative" });
  }
  if (rule.confidence === "Alta") highConfidence += 1;
  else if (rule.confidence === "Media") mediumConfidence += 1;
  else
    failures.push({
      source,
      problem: `unsupported confidence: ${rule.confidence}`,
    });
}

if (
  rules.length !== 353 ||
  highConfidence !== 232 ||
  mediumConfidence !== 121
) {
  failures.push({
    problem: "unexpected audited inventory",
    actual: { total: rules.length, highConfidence, mediumConfidence },
    expected: { total: 353, highConfidence: 232, mediumConfidence: 121 },
  });
}

const redirectResults = await mapConcurrent(rules, CONCURRENCY, async rule => {
  const sourceUrl = new URL(rule.source, BASE_URL);
  if (rule.sourceQuery) sourceUrl.search = rule.sourceQuery;

  try {
    const response = await fetch(sourceUrl, {
      headers: REQUEST_HOST ? { host: REQUEST_HOST } : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const location = response.headers.get("location");
    const resolvedLocation = location ? new URL(location, BASE_URL) : null;
    const expectedPath = normalizePath(rule.destination);
    const actualPath = resolvedLocation
      ? normalizePath(resolvedLocation.pathname)
      : null;
    const legacyQueryWasRemoved =
      !rule.sourceQuery ||
      (resolvedLocation?.search === "" &&
        resolvedLocation.protocol === "https:" &&
        resolvedLocation.hostname === "impacto33.com");
    const canonicalHostWasUsed =
      resolvedLocation?.protocol === "https:" &&
      resolvedLocation.hostname === "impacto33.com";

    if (
      response.status !== 301 ||
      actualPath !== expectedPath ||
      !legacyQueryWasRemoved ||
      !canonicalHostWasUsed
    ) {
      return {
        source: sourceUrl.pathname + sourceUrl.search,
        expected: rule.destination,
        status: response.status,
        location,
      };
    }
  } catch (error) {
    return { source: rule.source, problem: error.message };
  }

  return null;
});

failures.push(...redirectResults.filter(Boolean));

const destinationResults = await mapConcurrent(
  [...destinations],
  CONCURRENCY,
  async destination => {
    try {
      const response = await fetch(new URL(destination, BASE_URL), {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status !== 200) {
        return {
          destination,
          status: response.status,
          location: response.headers.get("location"),
        };
      }
    } catch (error) {
      return { destination, problem: error.message };
    }

    return null;
  }
);

failures.push(...destinationResults.filter(Boolean));

console.log(
  JSON.stringify(
    {
      baseUrl: BASE_URL,
      requestHost: REQUEST_HOST || null,
      rules: rules.length,
      highConfidence,
      mediumConfidence,
      uniqueSources: sources.size,
      uniqueDestinations: destinations.size,
      failures,
    },
    null,
    2
  )
);

if (failures.length > 0) process.exitCode = 1;
