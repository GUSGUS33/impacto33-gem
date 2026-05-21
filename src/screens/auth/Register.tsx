'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmail } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar fuerza de contraseña
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('La contraseña debe contener mayúscula, minúscula y número');
      return;
    }

    setLoading(true);

    try {
      const { user, error: authError } = await signUpWithEmail(email, password);

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email ya está registrado. Inicia sesión en su lugar.');
        } else {
          setError('Error al crear la cuenta. Inténtalo de nuevo.');
        }
        setLoading(false);
        return;
      }

      if (user) {
        // Mostrar mensaje de éxito
        setSuccess(true);
        setRegisteredEmail(email);
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Error inesperado. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        

        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/">
                <img
                  src="/images/logo-impacto33.png"
                  alt="IMPACTO33"
                  className="h-16 mx-auto mb-4 cursor-pointer"
                />
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">¡Cuenta Creada!</h1>
              <p className="text-slate-600 mt-2">
                Casi listo para comenzar
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
                <p className="font-semibold mb-2">Te hemos enviado un correo de confirmación</p>
                <p>Revisa tu bandeja de entrada en <strong>{registeredEmail}</strong> y haz clic en el enlace para verificar tu cuenta.</p>
                <p className="mt-2 text-xs">Si no ves el correo, revisa también la carpeta de spam.</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  Una vez confirmado tu email, podrás iniciar sesión
                </p>
                <Link href="/auth/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                    Ir a Iniciar Sesión
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Redirigiendo automáticamente en 3 segundos...
                </p>
              </div>
            </div>

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

  return (
    <>
      

      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <img
                src="/images/logo-impacto33.png"
                alt="IMPACTO33"
                className="h-16 mx-auto mb-4 cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta</h1>
            <p className="text-slate-600 mt-2">
              Regístrate para guardar tus favoritos y hacer pedidos
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
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Requisitos: 8+ caracteres, mayúscula, minúscula, número
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirmar Contraseña
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
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
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                    Inicia sesión aquí
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
