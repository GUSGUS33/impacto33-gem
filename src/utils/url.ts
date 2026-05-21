/**
 * Utilidades para manejo de URLs
 * Asegura consistencia en trailing slashes para SEO
 */

/**
 * Normaliza una URL para que siempre termine con /
 * Importante para SEO: evita contenido duplicado
 * 
 * @param url - URL a normalizar (puede ser relativa o absoluta)
 * @returns URL normalizada con trailing slash
 * 
 * @example
 * normalizeUrl('/camisetas-personalizadas') → '/camisetas-personalizadas/'
 * normalizeUrl('/camisetas-personalizadas/') → '/camisetas-personalizadas/'
 * normalizeUrl('/') → '/'
 * normalizeUrl('') → '/'
 */
export function normalizeUrl(url: string): string {
  // Si está vacío, retornar home
  if (!url || url === '') {
    return '/';
  }

  // Si ya termina con /, retornar tal cual
  if (url.endsWith('/')) {
    return url;
  }

  // Si tiene query params o hash, añadir / antes de ellos
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  
  if (queryIndex !== -1) {
    // Tiene query params: /path?query → /path/?query
    return url.slice(0, queryIndex) + '/' + url.slice(queryIndex);
  }
  
  if (hashIndex !== -1) {
    // Tiene hash: /path#hash → /path/#hash
    return url.slice(0, hashIndex) + '/' + url.slice(hashIndex);
  }

  // Caso simple: añadir / al final
  return url + '/';
}

/**
 * Verifica si una URL necesita redirección por falta de trailing slash
 * 
 * @param pathname - Pathname de la URL (window.location.pathname)
 * @returns true si necesita redirección
 */
export function needsTrailingSlash(pathname: string): boolean {
  // Excluir archivos estáticos (tienen extensión)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return false;
  }

  // Si ya termina con /, no necesita redirección
  if (pathname.endsWith('/')) {
    return false;
  }

  return true;
}

/**
 * Obtiene la URL normalizada para redirección
 * Preserva query params y hash
 * 
 * @param pathname - Pathname actual
 * @param search - Query string (window.location.search)
 * @param hash - Hash (window.location.hash)
 * @returns URL completa normalizada
 */
export function getRedirectUrl(pathname: string, search: string, hash: string): string {
  const normalizedPath = normalizeUrl(pathname);
  return normalizedPath + search + hash;
}
