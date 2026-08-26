"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentSession, onAuthStateChange } from '@/services/authService';
import {
  getOrCreateUserProfile,
  type UserProfile,
} from '@/services/userProfileService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga el perfil del usuario desde user_personalization
   */
  const loadUserProfile = async (currentUser: User) => {
    try {
      const { profile: userProfile, error: profileError } =
        await getOrCreateUserProfile(currentUser.id, currentUser.email || '');

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        setError('Error al cargar el perfil del usuario');
        setProfile(null);
      } else {
        setProfile(userProfile);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      setError('Error inesperado al cargar el perfil');
      setProfile(null);
    }
  };

  /**
   * Función para refrescar el perfil manualmente
   */
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  /**
   * Inicializar sesión al montar el componente
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { session, error: sessionError } = await getCurrentSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError('Error al obtener la sesión');
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Error al inicializar autenticación');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Suscribirse a cambios en el estado de autenticación
   */
  useEffect(() => {
    const { data: authListener } = onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación.
 * En Next.js SSR, el contexto puede no estar disponible durante el renderizado
 * del servidor, por lo que devolvemos valores por defecto en vez de lanzar error.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // SSR fallback: devolver estado "no autenticado" seguro
    return {
      user: null,
      profile: null,
      loading: true,
      error: null,
      refreshProfile: async () => {},
    };
  }
  return context;
}
