import MiCuenta from '@/screens/MiCuenta';

export const metadata = {
  title: 'Mi cuenta | Impacto33',
  description: 'Gestiona tu cuenta, direcciones y pedidos.',
};

export default function MiCuentaPage() {
  return <MiCuenta initialTab="resumen" />;
}
