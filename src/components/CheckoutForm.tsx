import { useState } from 'react';
import { AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { isStripeEnabled, stripeConfig } from '@/config/stripeConfig';
import { Cart, CartItem } from '@/services/cartService';

interface CheckoutFormProps {
  cart: Cart | null;
  items: CartItem[];
  loading?: boolean;
}

export function CheckoutForm({ cart, items, loading = false }: CheckoutFormProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripeActive = isStripeEnabled();

  const handleCheckout = async () => {
    if (!stripeActive) {
      setError('El pago online no está disponible en este momento.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Aquí iría la lógica de Stripe cuando esté habilitado
      // Por ahora solo es un placeholder
      console.log('Stripe checkout iniciado (placeholder)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (!stripeActive) {
    return (
      <div className="space-y-6">
        {/* Mensaje informativo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Pago online próximamente</h3>
              <p className="text-amber-800 text-sm mb-3">
                {stripeConfig.disabledMessage}
              </p>
              <p className="text-amber-700 text-xs">
                Tu carrito y favoritos se guardan en tu cuenta. Puedes continuar comprando o contactarnos para un presupuesto personalizado.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        {cart && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Resumen del Pedido</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{cart.subtotal_without_vat.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (21%)</span>
                <span>{cart.vat_amount.toFixed(2)} €</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-600">{cart.total_with_vat.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón deshabilitado */}
        <button
          disabled
          className="w-full px-6 py-3 bg-slate-300 text-slate-600 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Pagar (Próximamente)
        </button>

        {/* Alternativas */}
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-slate-600 text-sm mb-3">
            ¿Necesitas hacer un pedido ahora?
          </p>
          <a
            href="/presupuesto-rapido"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Solicitar Presupuesto
          </a>
        </div>
      </div>
    );
  }

  // Stripe activo (placeholder para implementación futura)
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3 items-center mb-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Información de Pago</h3>
        </div>
        <p className="text-blue-800 text-sm">
          Aquí irá el formulario de Stripe cuando esté habilitado.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {cart && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Resumen del Pedido</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{cart.subtotal_without_vat.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (21%)</span>
              <span>{cart.vat_amount.toFixed(2)} €</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span className="text-blue-600">{cart.total_with_vat.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={processing || loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pagar
          </>
        )}
      </button>
    </div>
  );
}
