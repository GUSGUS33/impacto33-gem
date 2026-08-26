import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { needsTrailingSlash, getRedirectUrl } from '@/utils/url';

/**
 * Componente que redirige automáticamente URLs sin trailing slash
 * Importante para SEO: evita contenido duplicado
 * 
 * Debe montarse en App.tsx antes de las rutas
 */
export function TrailingSlashRedirect() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Obtener pathname, search y hash actuales
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;

    // Verificar si necesita trailing slash
    if (needsTrailingSlash(pathname)) {
      const redirectUrl = getRedirectUrl(pathname, search, hash);
      
      // Usar replace para no añadir entrada al historial
      // Esto es importante para SEO (redirección 301-like en cliente)
      window.history.replaceState(null, '', redirectUrl);
      
      // Actualizar wouter location
      setLocation(redirectUrl, { replace: true });
    }
  }, [location, setLocation]);

  // Este componente no renderiza nada
  return null;
}
