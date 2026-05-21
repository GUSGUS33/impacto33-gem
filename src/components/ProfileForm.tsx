import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateUserProfile, changePassword, type UserProfileData } from '@/services/profileService';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfileData;
  onSuccess?: () => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfileData>>({
    email: profile.email,
    is_newsletter_subscribed: profile.is_newsletter_subscribed,
    company_type: profile.company_type,
    merch_usage: profile.merch_usage,
    order_volume: profile.order_volume,
    priority_focus: profile.priority_focus || [],
    extra_notes: profile.extra_notes,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Calcular fuerza de contraseña
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswordData((prev) => ({ ...prev, newPassword }));
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handlePriorityFocusChange = (value: string) => {
    setFormData((prev) => {
      const current = prev.priority_focus || [];
      if (current.includes(value)) {
        return {
          ...prev,
          priority_focus: current.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          priority_focus: [...current, value],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await updateUserProfile(user.id, formData);

      if (error) {
        toast.error('Error al actualizar el perfil: ' + error.message);
      } else {
        toast.success('Perfil actualizado correctamente');
        onSuccess?.();
      }
    } catch (err) {
      toast.error('Error inesperado al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validaciones
    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength < 3) {
      toast.error('La contraseña es muy débil. Debe incluir mayúsculas, minúsculas y números');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await changePassword(passwordData.newPassword);

      if (error) {
        toast.error('Error al cambiar la contraseña: ' + error.message);
      } else {
        toast.success('Contraseña actualizada correctamente');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setPasswordStrength(0);
      }
    } catch (err) {
      toast.error('Error inesperado al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Débil';
    if (passwordStrength <= 3) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tus datos de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">El email no puede ser modificado desde aquí</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="newsletter"
                checked={formData.is_newsletter_subscribed || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_newsletter_subscribed: checked as boolean }))
                }
              />
              <Label htmlFor="newsletter" className="font-normal cursor-pointer">
                Suscribirse a nuestro newsletter
              </Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Datos de Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Información de tu Empresa</CardTitle>
          <CardDescription>Ayúdanos a personalizar IMPACTO33 para ti</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_type">Tipo de empresa</Label>
              <Select
                value={formData.company_type || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, company_type: value as any }))
                }
              >
                <SelectTrigger id="company_type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeña empresa (1-50 empleados)</SelectItem>
                  <SelectItem value="medium">Empresa mediana (50-500 empleados)</SelectItem>
                  <SelectItem value="agency">Agencia/Consultoría</SelectItem>
                  <SelectItem value="ngo">ONG/Asociación</SelectItem>
                  <SelectItem value="individual">Autónomo/Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merch_usage">¿Para qué usarás el merchandising?</Label>
              <Select
                value={formData.merch_usage || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, merch_usage: value as any }))
                }
              >
                <SelectTrigger id="merch_usage">
                  <SelectValue placeholder="Selecciona un uso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Regalos corporativos</SelectItem>
                  <SelectItem value="uniforms">Uniformes/Vestuario laboral</SelectItem>
                  <SelectItem value="gifts">Regalos para clientes</SelectItem>
                  <SelectItem value="welcome">Bienvenida de empleados</SelectItem>
                  <SelectItem value="ecommerce">Venta en ecommerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_volume">Volumen de pedidos típico</Label>
              <Select
                value={formData.order_volume || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, order_volume: value as any }))
                }
              >
                <SelectTrigger id="order_volume">
                  <SelectValue placeholder="Selecciona un volumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeño (1-100 unidades)</SelectItem>
                  <SelectItem value="medium">Medio (100-500 unidades)</SelectItem>
                  <SelectItem value="large">Grande (500+ unidades)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>¿Qué es lo más importante para ti?</Label>
              <div className="space-y-2">
                {[
                  { id: 'quality', label: 'Calidad del producto' },
                  { id: 'price', label: 'Mejor precio' },
                  { id: 'speed', label: 'Rapidez en entrega' },
                  { id: 'design', label: 'Diseño personalizado' },
                  { id: 'support', label: 'Atención al cliente' },
                ].map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={option.id}
                      checked={(formData.priority_focus || []).includes(option.id)}
                      onCheckedChange={() => handlePriorityFocusChange(option.id)}
                    />
                    <Label htmlFor={option.id} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra_notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="extra_notes"
                placeholder="Cuéntanos algo más sobre tu empresa o tus necesidades..."
                value={formData.extra_notes || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, extra_notes: e.target.value }))}
                className="min-h-24"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cambiar Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Gestiona tu contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
              className="w-full"
            >
              Cambiar contraseña
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Fuerza: <span className="font-semibold">{getPasswordStrengthText()}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar contraseña
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                    setPasswordStrength(0);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
