import { Tag, Phone, Factory, Truck } from 'lucide-react';

export function FranjaValor() {
  const items = [
    {
      icon: <Tag className="w-8 h-8 text-slate-900 group-hover:text-brand transition-colors mb-4" />,
      title: 'Precios Mayoristas',
      description: 'Presupuestos optimizados para grandes volúmenes.',
    },
    {
      icon: <Phone className="w-8 h-8 text-slate-900 group-hover:text-brand transition-colors mb-4" />,
      title: 'Atención Personalizada',
      description: 'Asesoramiento por expertos en cada proyecto.',
    },
    {
      icon: <Factory className="w-8 h-8 text-slate-900 group-hover:text-brand transition-colors mb-4" />,
      title: 'Talleres Propios',
      description: 'Controlamos la calidad de cada estampación.',
    },
    {
      icon: <Truck className="w-8 h-8 text-slate-900 group-hover:text-brand transition-colors mb-4" />,
      title: 'Entrega Rápida',
      description: 'Tiempos de producción y envíos ágiles.',
    },
  ];

  return (
    <section className="bg-white border-b border-slate-100 py-12 md:py-16 lg:py-[100px] px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group cursor-default">
              {item.icon}
              <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
