'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tag, Check, Copy, Sparkles, Mail } from 'lucide-react';

export function Newsletter({ data }: { data?: any }) {
  const titulo = data?.titulo || '¡Consigue un 10% de descuento en tu primera compra!';
  const subtitulo = data?.subtitulo || 'Suscríbete a nuestra newsletter y recibe al instante un cupón exclusivo de 10% de dto (máximo 10€ de ahorro).';
  const placeholderEmail = data?.placeholderEmail || 'Tu correo electrónico';
  const textoBoton = data?.textoBoton || 'Obtener 10% Dto';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Ocurrió un error al procesar tu solicitud');
      }

      setStatus('success');
      setDiscountCode(json.discountCode || 'BIENVENIDA10');
    } catch (err: any) {
      console.error('Error suscribiendo a newsletter:', err);
      setStatus('error');
      setErrorMessage(err.message || 'No se pudo completar la suscripción.');
    }
  };

  const copyToClipboard = () => {
    if (!discountCode) return;
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="w-full bg-[#1e293b] text-white py-12 md:py-14 border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          
          {/* Contenido Izquierda */}
          <div className="flex-1 text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={13} className="text-blue-400" />
              <span>Oferta de Bienvenida</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {titulo}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {subtitulo}
            </p>
          </div>

          {/* Formulario Derecha */}
          <div className="w-full lg:w-auto shrink-0 min-w-[300px] sm:min-w-[420px]">
            {status === 'success' ? (
              <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs sm:text-sm">
                  <Check className="w-4 h-4 bg-emerald-500/20 rounded-full p-0.5 text-emerald-400" />
                  ¡Te hemos enviado el cupón a tu correo!
                </div>
                
                <div className="flex items-center justify-between bg-slate-950 border border-dashed border-blue-400/50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-lg font-bold text-blue-400 tracking-wider">
                      {discountCode}
                    </span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    type="button"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={13} /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholderEmail}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-white outline-none text-xs sm:text-sm transition-all placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-70 text-xs sm:text-sm shrink-0 whitespace-nowrap shadow-md"
                >
                  {status === 'loading' ? 'Enviando...' : textoBoton}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-xs text-red-400 mt-1.5">{errorMessage}</p>
            )}

            <div className="flex items-center justify-center lg:justify-start gap-3 text-[11px] text-slate-400 mt-2.5">
              <span>✓ Sin spam</span>
              <span>•</span>
              <span>✓ Descuento aplicable inmediatamente</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

