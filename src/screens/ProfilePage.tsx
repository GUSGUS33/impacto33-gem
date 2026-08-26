'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, type UserProfileData } from '@/services/profileService';
import { ProfileForm } from '@/components/ProfileForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadProfile();
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading profile for user:', user.id);
      const { data, error: fetchError } = await getUserProfile(user.id);

      if (fetchError) {
        console.error('Error loading profile:', fetchError);
        const errorMsg = fetchError.message || 'Error desconocido';
        setError(`Error al cargar el perfil: ${errorMsg}`);
        toast.error('Error al cargar el perfil');
      } else if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setError(null);
      } else {
        console.warn('No profile data returned');
        setError('No se encontraron datos del perfil');
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      setError('Error inesperado al cargar el perfil');
      toast.error('Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-red-600 font-semibold">{error}</p>
          <Button onClick={() => loadProfile()} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-gray-600">No se pudo cargar el perfil</p>
          <Button onClick={() => loadProfile()} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/inicio')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Actualiza tu información personal y preferencias
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm
          profile={profile}
          onSuccess={() => {
            toast.success('Perfil actualizado correctamente');
            loadProfile();
          }}
        />
      </div>
    </div>
  );
}
