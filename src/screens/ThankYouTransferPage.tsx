import { Link, useSearch } from 'wouter';
import {
  CheckCircle2, Package, Home, FileText, Phone,
  Banknote, Copy, AlertCircle, Clock
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { toast } from 'sonner';

/**
 * Datos bancarios de IMPACTO33
 * TODO: El usuario proporcionará estos datos más adelante
 */
const BANK_DETAILS = {
  bankName: 'Pendiente de configurar',
  iban: 'ES00 0000 0000 0000 0000 0000',
  swift: 'XXXXXXXX',
  beneficiary: 'IMPACTO33',
  concept: 'Número de pedido',
};

export default function ThankYouTransferPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderNumber = params.get('order') || 'N/A';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado al portapapeles`);
    }).catch(() => {
      toast.error('No se pudo copiar');
    });
  };

  return (
    <>
      

      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto py-12 md:py-20 px-4 max-w-2xl">
          {/* Icono de éxito */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Banknote className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Pedido registrado
            </h1>
            <p className="text-lg text-slate-600">
              Tu pedido ha sido registrado. Completa la transferencia para que lo procesemos.
            </p>
          </div>

          {/* Número de pedido */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Tu pedido</h2>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Número de pedido</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-900">{orderNumber}</span>
                  <button
                    onClick={() => copyToClipboard(orderNumber, 'Número de pedido')}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Estado: <strong>Pendiente de pago</strong> — Esperando transferencia bancaria</span>
            </div>
          </div>

          {/* Datos bancarios */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Banknote className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Datos para la transferencia</h2>
            </div>

            <div className="space-y-4">
              {/* Beneficiario */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Beneficiario</span>
                  <p className="font-semibold text-slate-900">{BANK_DETAILS.beneficiary}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.beneficiary, 'Beneficiario')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Banco */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Banco</span>
                  <p className="font-semibold text-slate-900">{BANK_DETAILS.bankName}</p>
                </div>
              </div>

              {/* IBAN */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">IBAN</span>
                  <p className="font-mono font-semibold text-slate-900 text-base">{BANK_DETAILS.iban}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.iban.replace(/\s/g, ''), 'IBAN')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copiar IBAN"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* SWIFT */}
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">SWIFT / BIC</span>
                  <p className="font-mono font-semibold text-slate-900">{BANK_DETAILS.swift}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.swift, 'SWIFT')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copiar SWIFT"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Concepto */}
              <div className="flex justify-between items-center py-3">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Concepto</span>
                  <p className="font-semibold text-slate-900">{orderNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(orderNumber, 'Concepto')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copiar concepto"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Instrucciones importantes */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-amber-800">
                <p className="font-semibold">Instrucciones importantes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Indica como <strong>concepto de la transferencia</strong> tu número de pedido: <strong>{orderNumber}</strong>
                  </li>
                  <li>
                    Tu pedido será procesado una vez recibamos y verifiquemos el pago.
                  </li>
                  <li>
                    El plazo habitual de verificación es de <strong>24-48 horas laborables</strong>.
                  </li>
                  <li>
                    Recibirás un email de confirmación cuando el pago sea verificado.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pasos del proceso */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-bold text-slate-900 mb-4">Próximos pasos</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Pedido registrado</p>
                  <p>Tu pedido ha sido recibido correctamente.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Realiza la transferencia</p>
                  <p>Usa los datos bancarios de arriba con el concepto indicado.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-slate-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Verificación del pago</p>
                  <p>Verificaremos el pago en 24-48h laborables y te notificaremos por email.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-slate-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Preparación y envío</p>
                  <p>Prepararemos tu pedido y te enviaremos el seguimiento.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
            <p className="text-sm text-slate-600 mb-3">
              Si tienes alguna duda sobre la transferencia o tu pedido:
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
