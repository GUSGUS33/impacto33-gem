import { PageBlock } from '@/queries/seoPageComplete';
import { Shield, Truck, CreditCard, Headphones, Award, Clock } from 'lucide-react';

/**
 * TrustBadgesBlock - Sellos de confianza para aumentar credibilidad
 * Muestra badges con iconos que transmiten seguridad y profesionalidad
 */
export function TrustBadgesBlock({ data }: { data: PageBlock }) {
  // Badges por defecto (se pueden reemplazar con datos de GraphQL cuando estén disponibles)
  const defaultBadges = [
    {
      icon: Shield,
      title: 'Garantía de Calidad',
      description: 'Productos certificados con garantía de 2 años'
    },
    {
      icon: Truck,
      title: 'Envío Rápido',
      description: 'Entrega en 24-48h en toda España'
    },
    {
      icon: CreditCard,
      title: 'Pago Seguro',
      description: 'Transacciones 100% seguras y encriptadas'
    },
    {
      icon: Headphones,
      title: 'Soporte Experto',
      description: 'Asesoramiento personalizado sin compromiso'
    },
    {
      icon: Award,
      title: 'Calidad Premium',
      description: 'Más de 15 años de experiencia en el sector'
    },
    {
      icon: Clock,
      title: 'Producción Rápida',
      description: 'Plazos de entrega ajustados a tus necesidades'
    }
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {defaultBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg border border-slate-200 bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
