"use client";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useExternalScripts } from "@/hooks/useExternalScripts";
import { Button } from "@/components/ui/button";

export default function QuotePage() {
  const scriptsLoaded = useExternalScripts();
  return (
    <>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="relative mb-12">
            <div className="absolute left-0 top-0 hidden md:block">
              <Button 
                variant="ghost" 
                className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={20} />
                Volver
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 md:mb-4 font-['Montserrat'] uppercase">Solicitar Presupuesto</h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
                Cuéntanos qué necesitas y te prepararemos una propuesta a medida con los mejores precios del mercado.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Benefits Banner */}
            <div className="bg-blue-600 text-white p-4 md:p-6 rounded-t-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-200 w-5 h-5" />
                <span className="font-bold text-sm md:text-base">Respuesta en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-200 w-5 h-5" />
                <span className="font-bold text-sm md:text-base">Sin compromiso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-200 w-5 h-5" />
                <span className="font-bold text-sm md:text-base">Mejor precio garantizado</span>
              </div>
            </div>

            {/* Quote Form */}
            <div className="bg-white rounded-b-xl shadow-lg border border-slate-100 overflow-hidden min-h-[600px]">
              {scriptsLoaded ? (
                <iframe
                  id="JotFormIFrame-203603626827052"
                  title="Formulario pedido de presupuesto"
                  src="https://form.jotform.com/203603626827052"
                  style={{ width: "100%", minHeight: "2000px", border: "0" }}
                  scrolling="no"
                  allowFullScreen={true}
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-slate-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Cargando formulario...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
