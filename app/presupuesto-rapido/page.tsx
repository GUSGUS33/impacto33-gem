import QuotePage from '@/screens/QuotePage'
import { readQuoteProduct } from '@/lib/quoteLinks'

export const metadata = {
  title: "Presupuesto Rápido | IMPACTO33",
  description: "Solicita un presupuesto rápido sin compromiso para tus regalos de empresa."
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const product = readQuoteProduct(typeof params.producto === 'string' ? params.producto : undefined, typeof params.ruta === 'string' ? params.ruta : undefined);
  return <QuotePage product={product} />;
}
