import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingData } from '@/services/profileOnboardingService';
import { toast } from 'sonner';

interface ProfileOnboardingProps {
  onSave: (data: OnboardingData) => Promise<any>;
  onSkip: () => Promise<any>;
  saving: boolean;
}

export function ProfileOnboarding({
  onSave,
  onSkip,
  saving,
}: ProfileOnboardingProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    company_type: 'small',
    merch_usage: 'corporate',
    order_volume: 'small',
    priority_focus: [],
    extra_notes: '',
  });

  const priorityOptions = [
    { id: 'price', label: 'Mejor precio' },
    { id: 'speed', label: 'Entrega rápida' },
    { id: 'quality', label: 'Calidad / imagen premium' },
    { id: 'sustainable', label: 'Opciones sostenibles' },
    { id: 'advice', label: 'Asesoramiento personalizado' },
  ];

  const handlePriorityToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      priority_focus: prev.priority_focus.includes(id)
        ? prev.priority_focus.filter((item) => item !== id)
        : [...prev.priority_focus, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.priority_focus.length === 0) {
      toast.error('Por favor selecciona al menos una prioridad');
      return;
    }

    const result = await onSave(formData);
    if (result.success) {
      toast.success('¡Preferencias guardadas! Gracias por tu información.');
    } else {
      toast.error('Error al guardar las preferencias. Inténtalo de nuevo.');
    }
  };

  const handleSkip = async () => {
    await onSkip();
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            🧩 Ayúdanos a personalizar IMPACTO33 para tu empresa
          </h2>
          <p className="text-slate-600 text-base">
            Cuéntanos un poco sobre tu empresa. Guardaremos esta información solo para uso interno y así podremos recomendarte mejor productos, ideas y promociones.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              ¿Qué tipo de empresa eres?
            </label>
            <div className="space-y-2">
              {[
                { value: 'small', label: 'Empresa pequeña (1–10 personas)' },
                { value: 'medium', label: 'Empresa mediana (11–50)' },
                { value: 'agency', label: 'Agencia / estudio' },
                { value: 'ngo', label: 'ONG / asociación' },
                { value: 'individual', label: 'Particular' },
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="company_type"
                    value={option.value}
                    checked={formData.company_type === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company_type: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Merch Usage */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              ¿Para qué usarás principalmente nuestros productos?
            </label>
            <div className="space-y-2">
              {[
                { value: 'corporate', label: 'Eventos corporativos' },
                { value: 'uniforms', label: 'Uniformes / ropa de equipo' },
                { value: 'gifts', label: 'Regalos a clientes' },
                { value: 'welcome', label: 'Packs de bienvenida / onboarding' },
                { value: 'ecommerce', label: 'Venta en tienda / ecommerce propio' },
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="merch_usage"
                    value={option.value}
                    checked={formData.merch_usage === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        merch_usage: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Volume */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              ¿Cuál es tu volumen típico de pedidos?
            </label>
            <div className="space-y-2">
              {[
                { value: 'small', label: 'Hasta 50 unidades' },
                { value: 'medium', label: '50 – 200 unidades' },
                { value: 'large', label: 'Más de 200 unidades' },
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="order_volume"
                    value={option.value}
                    checked={formData.order_volume === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order_volume: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Focus */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              ¿Cuáles son tus prioridades? (Selecciona al menos una)
            </label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <label key={option.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.priority_focus.includes(option.id)}
                    onChange={() => handlePriorityToggle(option.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Extra Notes */}
          <div>
            <label htmlFor="extra_notes" className="block text-sm font-semibold text-slate-900 mb-2">
              Algo más que quieras contarnos (opcional)
            </label>
            <textarea
              id="extra_notes"
              value={formData.extra_notes || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  extra_notes: e.target.value,
                }))
              }
              placeholder="Cuéntanos más sobre tu negocio..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              disabled={saving}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 mb-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              {saving ? 'Guardando...' : 'Guardar preferencias'}
            </Button>
            <Button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              variant="outline"
              className="px-6 py-2"
            >
              Ahora no
            </Button>
          </div>

          {/* Trust message */}
          <p className="text-xs text-slate-500 text-center">
            Nunca compartiremos estos datos con terceros. Solo los usamos para mejorar tu experiencia y asesorarte mejor.
          </p>
        </form>
      </div>
    </div>
  );
}
