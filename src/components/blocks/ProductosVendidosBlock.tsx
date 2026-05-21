import { PageBlock } from '@/queries/seoPageComplete';

export function ProductosVendidosBlock({ data }: { data: PageBlock }) {
  if (!data.productosVendidosTitulo) return null;
  
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
        {data.productosVendidosTitulo}
      </h2>
      <div className="text-center text-slate-600">
        <p>Bloque de productos más vendidos (próximamente)</p>
      </div>
    </div>
  );
}
