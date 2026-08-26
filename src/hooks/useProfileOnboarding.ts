import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getOnboardingStatus,
  saveOnboardingData,
  skipOnboarding,
  OnboardingData,
  OnboardingStatus,
} from '@/services/profileOnboardingService';

export function useProfileOnboarding() {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({ isCompleted: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar estado del onboarding
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      const result = await getOnboardingStatus(user.id);
      setStatus(result);
      setLoading(false);
    };

    fetchStatus();
  }, [user?.id]);

  // Guardar datos del onboarding
  const handleSaveOnboarding = async (data: OnboardingData) => {
    if (!user?.id) return;

    setSaving(true);
    const result = await saveOnboardingData(user.id, data);

    if (result.success) {
      setStatus({ isCompleted: true, data });
    }
    setSaving(false);

    return result;
  };

  // Saltar onboarding
  const handleSkipOnboarding = async () => {
    if (!user?.id) return;

    setSaving(true);
    const result = await skipOnboarding(user.id);

    if (result.success) {
      setStatus({ isCompleted: true });
    }
    setSaving(false);

    return result;
  };

  return {
    isCompleted: status.isCompleted,
    data: status.data,
    loading,
    saving,
    saveOnboarding: handleSaveOnboarding,
    skipOnboarding: handleSkipOnboarding,
  };
}
