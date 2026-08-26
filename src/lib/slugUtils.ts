/**
 * Normaliza slugs eliminando caracteres invisibles y whitespace
 * 
 * @param slug - Slug potencialmente sucio con tabs, espacios, newlines
 * @returns Slug limpio o null si está vacío
 * 
 * @example
 * ```ts
 * normalizeSlug("camisetas-manga-corta\t") // "camisetas-manga-corta"
 * normalizeSlug(" camisetas-manga-corta ") // "camisetas-manga-corta"
 * normalizeSlug("camisetas \n manga-corta") // "camisetasmanga-corta"
 * normalizeSlug("") // null
 * normalizeSlug(null) // null
 * normalizeSlug(undefined) // null
 * ```
 */
export function normalizeSlug(slug: string | null | undefined): string | null {
  // Si es null, undefined o no es string, retornar null
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Eliminar todos los caracteres de whitespace (espacios, tabs, newlines, etc.)
  // y convertir a minúsculas
  const cleaned = slug
    .replace(/\s+/g, '') // Eliminar todos los espacios en blanco
    .trim()
    .toLowerCase();

  // Si después de limpiar queda vacío, retornar null
  if (cleaned.length === 0) {
    return null;
  }

  // En desarrollo, loggear warning si el slug original tenía whitespace
  if (process.env.NODE_ENV === 'development' && slug !== cleaned) {
    console.warn(
      `[slugUtils] Slug con whitespace detectado:`,
      `Original: "${slug}"`,
      `Limpio: "${cleaned}"`
    );
  }

  return cleaned;
}

/**
 * Normaliza un array de slugs
 * 
 * @param slugs - Array de slugs potencialmente sucios
 * @returns Array de slugs limpios (sin nulls)
 */
export function normalizeSlugs(slugs: (string | null | undefined)[]): string[] {
  return slugs
    .map(normalizeSlug)
    .filter((slug): slug is string => slug !== null);
}
