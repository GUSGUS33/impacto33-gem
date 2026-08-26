import React from 'react';
import Link from "next/link";
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      

      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          
          {/* Imagen Principal */}
          <div className="mb-6 md:mb-8 relative inline-block">
            <img 
              src="/images/smartphone-ICON.png" 
              alt="Página no encontrada - Regalos Personalizados" 
              width={160}
              height={160}
              className="max-w-full h-auto max-h-[200px] object-contain mx-auto opacity-50"
            />
          </div>

          {/* Mensaje de Error */}
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
            ¡Vaya! Parece que te has perdido
          </h1>
          <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            La página que buscas no existe o ha sido movida. Pero no te preocupes, 
            tenemos miles de productos personalizados esperando por ti.
          </p>

          {/* Botón Principal */}
          <div className="mb-8 md:mb-12">
            <Link href="/">
              <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
                <Home size={20} />
                Volver al Inicio
              </span>
            </Link>
          </div>

          {/* Sugerencias de Categorías */}
          <div className="border-t border-slate-100 pt-12">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
              Quizás buscabas alguna de estas categorías populares
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Link href="/ropa-personalizada/camisetas">
                <span className="group flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <img src="/images/categoria-camisetas.webp" alt="Camisetas" width={40} height={40} className="w-10 h-10 object-contain opacity-80" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-blue-600">Camisetas</span>
                </span>
              </Link>

              <Link href="/bolsas-mochilas/bolsas">
                <span className="group flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <img src="/images/categoria-bolsas.webp" alt="Bolsas" width={40} height={40} className="w-10 h-10 object-contain opacity-80" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-green-600">Bolsas de Tela</span>
                </span>
              </Link>

              <Link href="/tazas-botellas/tazas">
                <span className="group flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <img src="/images/categoria-tazas.webp" alt="Tazas" width={40} height={40} className="w-10 h-10 object-contain opacity-80" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-orange-600">Tazas</span>
                </span>
              </Link>

              <Link href="/tecnologia/memorias-usb">
                <span className="group flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <img src="/images/categoria-memorias-usb.webp" alt="Tecnología" width={40} height={40} className="w-10 h-10 object-contain opacity-80" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-purple-600">Tecnología</span>
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default NotFound;
