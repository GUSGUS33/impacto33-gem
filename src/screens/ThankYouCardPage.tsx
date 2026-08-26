import { Link, useSearch } from 'wouter';
import { CheckCircle2, Package, ArrowRight, Home, FileText, Phone } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function ThankYouCardPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderNumber = params.get('order') || 'N/A';

  return (
    <>
      

      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto py-12 md:py-20 px-4 max-w-2xl">
          {/* Icono de éxito */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Pedido confirmado
            </h1>
            <p className="text-lg text-slate-600">
              Gracias por tu compra. Tu pedido ha sido registrado correctamente.
            </p>
          </div>

          {/* Detalles del pedido */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Detalles del pedido</h2>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Número de pedido</span>
                <span className="text-lg font-bold text-blue-900">{orderNumber}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Pedido registrado</p>
                  <p>Tu pedido ha sido recibido y está siendo procesado.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Confirmación por email</p>
                  <p>Recibirás un email con los detalles completos de tu pedido en breve.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-slate-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Preparación y envío</p>
                  <p>Prepararemos tu pedido y te notificaremos cuando sea enviado.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nota sobre pago con tarjeta */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Nota sobre el pago:</strong> El pago con tarjeta se activará próximamente. 
              Nuestro equipo se pondrá en contacto contigo para confirmar el método de pago y completar la transacción.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
            <p className="text-sm text-slate-600 mb-3">
              Si tienes alguna duda sobre tu pedido, no dudes en contactarnos:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText className="w-4 h-4" />
                {siteConfig.contactEmail}
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                WhatsApp: {siteConfig.whatsappNumber}
              </a>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/mis-pedidos">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                <Package className="w-5 h-5" />
                Ver mis pedidos
              </button>
            </Link>
            <Link href="/">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                <Home className="w-5 h-5" />
                Volver a la tienda
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
