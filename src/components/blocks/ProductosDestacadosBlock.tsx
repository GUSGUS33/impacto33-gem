import { PageBlock } from '@/queries/seoPageComplete';
export function ProductosDestacadosBlock({ data }: { data: PageBlock }) {
  if (!data.productosDestacadosTitulo) return null;
  return <div className="max-w-6xl mx-auto"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">{data.productosDestacadosTitulo}</h2><p className="text-center text-slate-600">Bloque de productos destacados (próximamente)</p></div>;
}
