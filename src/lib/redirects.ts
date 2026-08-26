import { permanentRedirect } from "next/navigation";
import { explicitRedirects } from "@/config/redirects";

// Memoria caché para evitar sobrecargar las consultas en peticiones sucesivas
const redirectCache = new Map<string, { destination: string | null; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutos

/**
 * Normaliza una ruta para comparación consistente (elimina slashes iniciales y finales)
 */
function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, "").trim().toLowerCase();
}

/**
 * Busca si existe una redirección 301 legítima y comprobada para una URL solicitada.
 *
 * Principios estrictos:
 * 1. NUNCA inventa URLs ni utiliza heurísticas aproximadas/fuzzy.
 * 2. Comprueba primero la lista de redirecciones explícitas registradas (`explicitRedirects`).
 * 3. Si no existe en la lista, consulta directamente con el backend de WordPress/WooCommerce:
 *    - Si WordPress tiene registrado un cambio de slug (ej. _wp_old_slug o plugin Redirection)
 *      y responde con cabecera HTTP 301/302 a una nueva URL válida diferente, se adopta esa ruta exacta.
 * 4. Si la ruta responde 404 o no tiene redirección en WordPress, retorna `null` para que
 *    Next.js muestre la página 404 correspondiente sin inventar destinos.
 */
export async function getVerifiedRedirect(path: string): Promise<string | null> {
  const normalizedSource = normalizePath(path);
  if (!normalizedSource) return null;

  // 1. Comprobar tabla de redirecciones explícitas
  const explicit = explicitRedirects.find(
    (rule) => normalizePath(rule.source) === normalizedSource
  );
  if (explicit) {
    const dest = explicit.destination.startsWith("/")
      ? explicit.destination
      : `/${explicit.destination}`;
    return dest;
  }

  // 2. Comprobar caché en memoria
  const cached = redirectCache.get(normalizedSource);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.destination;
  }

  // 3. Consultar cabeceras reales del backend de WordPress (donde reside el histórico de slugs)
  try {
    const wpBaseUrl = (
      process.env.VITE_WP_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
      "https://creativu.es/graphql"
    ).replace(/\/graphql\/?$/, "");

    const targetUrl = `${wpBaseUrl}/${normalizedSource}/`;
    const res = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "manual",
      next: { revalidate: 3600 },
    });

    if (res.status === 301 || res.status === 302 || res.status === 308) {
      const location = res.headers.get("location");
      if (location) {
        try {
          const parsed = new URL(location, wpBaseUrl);
          const destNormalized = normalizePath(parsed.pathname);

          // Debe ser un destino real y distinto del origen solicitado (no solo trailing slash)
          if (destNormalized && destNormalized !== normalizedSource) {
            // Preservar estructura si es producto o categoría
            const isProduct = normalizedSource.startsWith("producto/") || destNormalized.startsWith("producto/");
            let finalPath = `/${destNormalized}`;
            
            if (isProduct && !finalPath.startsWith("/producto/")) {
              finalPath = `/producto/${destNormalized.replace(/^producto\//, "")}`;
            }

            redirectCache.set(normalizedSource, { destination: finalPath, timestamp: Date.now() });
            return finalPath;
          }
        } catch {
          // URL devuelta no válida
        }
      }
    }

    // Sin redirección válida en WordPress -> guardar null para no repetir consulta en vano
    redirectCache.set(normalizedSource, { destination: null, timestamp: Date.now() });
    return null;
  } catch (error) {
    console.error("[getVerifiedRedirect] Error al consultar backend WordPress:", error);
    return null;
  }
}

/**
 * Si existe una redirección 301 verificada para la ruta, la ejecuta inmediatamente.
 * Si no existe, no hace nada y devuelve false para que la página proceda con notFound() o su flujo habitual.
 */
export async function handleVerifiedRedirect(path: string): Promise<boolean> {
  const destination = await getVerifiedRedirect(path);
  if (destination) {
    permanentRedirect(destination);
  }
  return false;
}
