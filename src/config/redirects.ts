/**
 * Registro de redirecciones 301 explícitas y confirmadas.
 * 
 * Regla de Oro: NUNCA inventarse URLs. Solo añadir pares (source -> destination)
 * que hayan sido formalmente migrados, renombrados o verificados.
 */

export interface RedirectRule {
  source: string;
  destination: string;
  permanent?: boolean;
}

export const explicitRedirects: RedirectRule[] = [
  // Ejemplos de normalización / migraciones verificadas si las hubiera
  { source: '/inicio', destination: '/', permanent: true },
  { source: '/home', destination: '/', permanent: true },
];
