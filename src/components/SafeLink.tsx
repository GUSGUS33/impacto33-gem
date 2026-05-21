import { Link, LinkProps } from 'wouter';
import { normalizeUrl } from '@/utils/url';

/**
 * Wrapper de wouter Link que normaliza URLs automáticamente
 * Asegura que todos los links internos tengan trailing slash (SEO)
 * 
 * Uso: Reemplazar <Link> por <SafeLink> en toda la app
 * 
 * @example
 * // ANTES
 * <Link href="/camisetas-personalizadas">Ver camisetas</Link>
 * 
 * // DESPUÉS (automático)
 * <SafeLink href="/camisetas-personalizadas">Ver camisetas</SafeLink>
 * // → href normalizado a "/camisetas-personalizadas/"
 */
export function SafeLink({ href, ...props }: LinkProps) {
  // Normalizar href para añadir trailing slash
  const normalizedHref = typeof href === 'string' ? normalizeUrl(href) : href;

  return <Link to={normalizedHref as string} {...(props as any)} />;
}
