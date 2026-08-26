import React from 'react';
import { PRINTING_METHODS } from '../../data/pricing/printing-methods';
import type { PrintingMethodId } from '../../types/printing';
import { Check } from 'lucide-react';

interface PrintingMethodSelectorProps {
  /** Métodos activos disponibles */
  activeMethods: PrintingMethodId[];
  
  /** Método seleccionado actualmente */
  selectedMethod: PrintingMethodId;
  
  /** Callback cuando se selecciona un método */
  onMethodChange: (methodId: PrintingMethodId) => void;
  
  /** Mostrar métodos inactivos como opciones deshabilitadas */
  showInactiveMethods?: boolean;
  
  /** Métodos disponibles (activos + inactivos) */
  availableMethods?: PrintingMethodId[];
}

/**
 * Selector de método de impresión mejorado con tarjetas visuales
 * 
 * Muestra tarjetas seleccionables con imagen, nombre y descripción
 * para cada método de impresión.
 */
const PrintingMethodSelector: React.FC<PrintingMethodSelectorProps> = ({
  activeMethods,
  selectedMethod,
  onMethodChange,
  showInactiveMethods = true,
  availableMethods = []
}) => {
  // Obtener todos los métodos permitidos (activos + inactivos)
  const allMethods = showInactiveMethods && availableMethods.length > 0
    ? availableMethods
    : activeMethods;

  // Nombres públicos para UI
  const publicNames: Record<PrintingMethodId, string> = {
    'DTF': 'A todo color',
    'SERIGRAFIA_1_COLOR': '1 color',
    'BORDADO': 'Bordado Textil',
    'DTF_UV': 'DTF UV',
    'TAMPO_1_COLOR': 'Tampografía',
    'SIN_IMPRESION': 'Solo prenda'
  };

  // Descripciones breves para cada método
  const descriptions: Record<PrintingMethodId, string> = {
    'DTF': 'Impresión digital a todo color',
    'SERIGRAFIA_1_COLOR': 'Serigrafía de un color',
    'BORDADO': 'Bordado textil premium',
    'DTF_UV': 'Impresión UV de alta calidad',
    'TAMPO_1_COLOR': 'Tampografía de precisión',
    'SIN_IMPRESION': 'Sin personalización'
  };

  // Rutas de imágenes para cada método (imágenes grandes servidas desde CDN)
  const imageUrls: Record<PrintingMethodId, string> = {
    'DTF': 'https://files.manuscdn.com/user_upload_by_module/session_file/100927939/KlBpdmFRWMnzhiOA.png',
    'SERIGRAFIA_1_COLOR': 'https://files.manuscdn.com/user_upload_by_module/session_file/100927939/EbWsBRuGYRqcHAYR.png',
    'BORDADO': 'https://files.manuscdn.com/user_upload_by_module/session_file/100927939/dEwuEXnGQoMeGaiT.png',
    'DTF_UV': 'https://files.manuscdn.com/user_upload_by_module/session_file/100927939/vckFjpbvhVTaDVOs.png',
    'TAMPO_1_COLOR': 'https://files.manuscdn.com/user_upload_by_module/session_file/100927939/bQNHRJpODQoTnvyb.png',
    'SIN_IMPRESION': '/images/printing-methods/solo-prenda.png'
  };

  // Colores de fondo para cada método (tailwind classes)
  const bgColors: Record<PrintingMethodId, string> = {
    'DTF': 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200',
    'SERIGRAFIA_1_COLOR': 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200',
    'BORDADO': 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    'DTF_UV': 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200',
    'TAMPO_1_COLOR': 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    'SIN_IMPRESION': 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
  };

  // Colores de borde cuando está seleccionado
  const selectedBorderColors: Record<PrintingMethodId, string> = {
    'DTF': 'border-blue-500 shadow-lg shadow-blue-200',
    'SERIGRAFIA_1_COLOR': 'border-slate-500 shadow-lg shadow-slate-200',
    'BORDADO': 'border-amber-500 shadow-lg shadow-amber-200',
    'DTF_UV': 'border-cyan-500 shadow-lg shadow-cyan-200',
    'TAMPO_1_COLOR': 'border-emerald-500 shadow-lg shadow-emerald-200',
    'SIN_IMPRESION': 'border-gray-500 shadow-lg shadow-gray-200'
  };

  return (
    <div className="w-full">
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {allMethods.map((methodId) => {
          const method = PRINTING_METHODS[methodId];
          if (!method) return null;

          const isActive = activeMethods.includes(methodId);
          const isSelected = selectedMethod === methodId;
          const publicName = publicNames[methodId] || method.label;
          const description = descriptions[methodId] || method.description;
          const imageUrl = imageUrls[methodId];
          const bgColor = bgColors[methodId];
          const selectedBorderColor = selectedBorderColors[methodId];

          return (
            <button
              key={methodId}
              onClick={() => {
                if (isActive) {
                  onMethodChange(methodId);
                }
              }}
              disabled={!isActive}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center text-center gap-3
                ${isActive
                  ? isSelected
                    ? `${bgColor} ${selectedBorderColor} cursor-pointer`
                    : `${bgColor} border-slate-300 hover:border-slate-400 cursor-pointer hover:shadow-md`
                  : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                }
              `}
              title={!isActive ? 'Próximamente disponible' : publicName}
            >
              {/* Imagen del método */}
              {imageUrl && (
                <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={publicName}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Nombre del método */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base text-slate-900 line-clamp-2">
                  {publicName}
                </h4>
                
                {/* Descripción breve */}
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {description}
                </p>

                {/* Badge "Próximamente" para métodos inactivos */}
                {!isActive && (
                  <span className="inline-block mt-2 px-2 py-1 bg-slate-300 text-slate-700 text-xs font-medium rounded">
                    Próximamente
                  </span>
                )}
              </div>

              {/* Checkmark cuando está seleccionado */}
              {isSelected && isActive && (
                <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1 shadow-md">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información adicional sobre el método seleccionado */}
      <div className="mt-6 space-y-3">
        {PRINTING_METHODS[selectedMethod] && (
          <p className="text-sm text-slate-600">
            <strong>{publicNames[selectedMethod]}:</strong> {descriptions[selectedMethod]}
          </p>
        )}
        
        {/* Mensaje informativo sobre disponibilidad */}
        {activeMethods.length === 1 && (
          <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="flex items-start gap-2">
              <span className="text-lg leading-none mt-0.5">ℹ️</span>
              <span>
                De momento este producto solo está disponible con impresión <strong>A todo color</strong>. 
                Próximamente añadiremos más opciones de personalización.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintingMethodSelector;
