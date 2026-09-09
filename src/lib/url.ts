/**
 * Normaliza enlaces internos al formato canónico de Next.js sin barra final.
 * Mantiene intactos los enlaces externos y los protocolos especiales.
 */
export function normalizeInternalHref(uri: string | null | undefined): string {
  if (!uri || typeof uri !== "string") return "/";

  const value = uri.trim();
  if (!value) return "/";
  if (value.startsWith("#") || /^(?:mailto|tel):/i.test(value)) return value;

  let pathname = value;
  let search = "";
  let hash = "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
      const internalHosts = new Set(["impacto33.com", "creativu.es", "localhost", "127.0.0.1"]);
      if (!internalHosts.has(hostname)) return value;
      pathname = parsed.pathname;
      search = parsed.search;
      hash = parsed.hash;
    } catch {
      return value;
    }
  } else {
    const hashIndex = pathname.indexOf("#");
    if (hashIndex >= 0) {
      hash = pathname.slice(hashIndex);
      pathname = pathname.slice(0, hashIndex);
    }
    const queryIndex = pathname.indexOf("?");
    if (queryIndex >= 0) {
      search = pathname.slice(queryIndex);
      pathname = pathname.slice(0, queryIndex);
    }
  }

  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");

  return `${pathname || "/"}${search}${hash}`;
}

export const normalizeUri = normalizeInternalHref;
