'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Página de callback para procesar tokens de autenticación de Supabase.
 * 
 * Supabase redirige aquí después de:
 * - Confirmación de email (signup)
 * - Recuperación de contraseña
 * - OAuth login
 * 
 * Los tokens llegan en el hash fragment de la URL:
 * /auth/callback#access_token=...&refresh_token=...&type=signup
 * 
 * O como query params después del redirect de Supabase:
 * /auth/callback?token_hash=...&type=signup
 */
export default function AuthCallback() {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Caso 1: Tokens en el hash fragment (OAuth, magic link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[AuthCallback] Error setting session from hash:', error);
            setStatus('error');
            setMessage('Error al verificar tu cuenta. El enlace puede haber expirado.');
            setTimeout(() => navigate('/auth/login'), 3000);
            return;
          }

          if (data.session) {
            setStatus('success');
            if (type === 'recovery') {
              setMessage('Sesión verificada. Redirigiendo para cambiar contraseña...');
              setTimeout(() => navigate('/auth/reset-password'), 1500);
            } else {
              setMessage('¡Cuenta verificada correctamente! Redirigiendo...');
              setTimeout(() => navigate('/inicio'), 1500);
            }
            return;
          }
        }

        // Caso 2: Token hash en query params (email confirmation link de Supabase)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get('token_hash');
        const urlType = urlParams.get('type');

        if (tokenHash && urlType) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: urlType as any,
          });

          if (error) {
            console.error('[AuthCallback] Error verifying OTP:', error);
            setStatus('error');
            setMessage('Error al verificar tu cuenta. El enlace puede haber expirado.');
            setTimeout(() => navigate('/auth/login'), 3000);
            return;
          }

          if (data.session) {
            setStatus('success');
            if (urlType === 'recovery') {
              setMessage('Sesión verificada. Redirigiendo para cambiar contraseña...');
              setTimeout(() => navigate('/auth/reset-password'), 1500);
            } else {
              setMessage('¡Cuenta verificada correctamente! Redirigiendo...');
              setTimeout(() => navigate('/inicio'), 1500);
            }
            return;
          }
        }

        // Caso 3: Supabase detectSessionInUrl ya procesó los tokens automáticamente
        // Verificar si ya hay sesión activa
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setStatus('success');
          setMessage('¡Sesión iniciada correctamente! Redirigiendo...');
          setTimeout(() => navigate('/inicio'), 1500);
          return;
        }

        // Si no hay tokens ni sesión, algo falló
        setStatus('error');
        setMessage('No se encontraron datos de verificación. Intenta iniciar sesión manualmente.');
        setTimeout(() => navigate('/auth/login'), 3000);

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setStatus('error');
        setMessage('Error inesperado. Redirigiendo al inicio de sesión...');
        setTimeout(() => navigate('/auth/login'), 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Verificando...</h1>
            <p className="text-slate-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Verificación completada</h1>
            <p className="text-slate-500">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Error de verificación</h1>
            <p className="text-slate-500">{message}</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Ir a Iniciar Sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
