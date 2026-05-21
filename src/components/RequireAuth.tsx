import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Componente HOC que protege rutas requiriendo autenticación
 * Si el usuario no está logueado, redirige a /auth/login
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Guardar la ruta actual para redirigir después del login
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      setLocation('/auth/login');
    }
  }, [user, loading, setLocation]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Usuario autenticado, renderizar el contenido
  return <>{children}</>;
}
