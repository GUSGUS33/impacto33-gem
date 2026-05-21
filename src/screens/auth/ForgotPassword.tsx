'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordForEmail } from '@/services/authService';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPasswordForEmail(email);

      if (error) {
        toast.error(error.message || 'Error al enviar el email de recuperación');
        return;
      }

      setIsSubmitted(true);
      toast.success('Email de recuperación enviado correctamente');
    } catch (err) {
      toast.error('Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Email enviado</h1>
            <p className="text-muted-foreground mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
              <p className="font-semibold mb-2">Próximos pasos:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Revisa tu email (incluida la carpeta de spam)</li>
                <li>Haz clic en el enlace de recuperación</li>
                <li>Crea una nueva contraseña</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              El enlace expirará en 24 horas
            </p>

            <Link href="/auth/login">
              <Button className="w-full">
                Volver al login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Recuperar contraseña</h1>
          <p className="text-center text-muted-foreground mb-8">
            Ingresa tu email y te enviaremos un enlace para resetear tu contraseña
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Recuerdas tu contraseña?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
