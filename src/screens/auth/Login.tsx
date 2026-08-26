'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail, resendConfirmationEmail } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/hooks/useNotification';

export default function Login() {
  const router = useRouter();
  const { success, error: notifyError, warning } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);
    setLoading(true);

    try {
      const { user, error: authError } = await signInWithEmail(email, password);

      if (authError) {
        // Detectar si el email no está confirmado
        const isNotConfirmed =
          authError.message?.includes('Email not confirmed') ||
          authError.message?.includes('email_not_confirmed') ||
          authError.status === 422; // Supabase returns 422 for unconfirmed emails

        if (isNotConfirmed) {
          setIsEmailNotConfirmed(true);
          setError(
            'Tu cuenta aún no está verificada. Revisa tu correo y haz clic en el enlace de confirmación.'
          );
        } else if (authError.message === 'Invalid login credentials') {
          setIsEmailNotConfirmed(false);
          setError('Email o contraseña incorrectos.');
        } else {
          setIsEmailNotConfirmed(false);
          setError('No hemos podido iniciar sesión. Revisa tu email y contraseña e inténtalo de nuevo.');
        }
        setLoading(false);
        return;
      }

      if (user) {
        // Redirigir a la home personalizada o a la ruta guardada
        success('Sesion iniciada correctamente');
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/inicio';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error inesperado. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setResendSuccess(false);
    const { error: resendError } = await resendConfirmationEmail(email);
    setResendingEmail(false);

    if (resendError) {
      notifyError('No pudimos reenviar el email. Inténtalo de nuevo.');
      setError('No pudimos reenviar el email. Inténtalo de nuevo.');
    } else {
      success('Email de confirmacion reenviado');
      setResendSuccess(true);
      setError(null);
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  return (
    <>
      

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12" style={{ minHeight: '70vh' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="IMPACTO33"
                className="h-16 mx-auto mb-4 cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
            <p className="text-slate-600 mt-2">
              Accede a tu cuenta para ver tus pedidos y favoritos
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  Te hemos enviado de nuevo el enlace de confirmación. Revisa tu bandeja de entrada y la carpeta de spam.
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Botón de reenvío de confirmación */}
              {isEmailNotConfirmed && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendingEmail}
                    className="w-full text-blue-600 hover:text-blue-700 font-semibold py-2 text-sm disabled:opacity-50"
                  >
                    {resendingEmail ? 'Reenviando...' : 'Reenviar email de confirmación'}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                    Regístrate aquí
                  </span>
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                ¿Olvidaste tu contraseña?{' '}
                <Link href="/auth/forgot-password">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                    Recupérala aquí
                  </span>
                </Link>
              </p>
            </div>
          </div>

          {/* Volver a inicio */}
          <div className="mt-6 text-center">
            <Link href="/">
              <span className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                ← Volver al inicio
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
