import React from 'react';
import { Check } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface ColorOption {
  id: string;
  name: string;
  value: string;
  image?: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  stockQuantity?: number;
}

interface ColorSelectorProps {
  availableColors: ColorOption[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  availableColors,
  selectedColor,
  onColorSelect,
  disabled = false
}) => {
  const { success } = useNotification();
  // Mapear nombres de colores a códigos hexadecimales para fallback
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'rojo': '#DC2626', 'red': '#DC2626',
      'azul': '#2563EB', 'blue': '#2563EB',
      'verde': '#16A34A', 'green': '#16A34A',
      'negro': '#1F2937', 'black': '#1F2937',
      'blanco': '#F9FAFB', 'white': '#F9FAFB',
      'gris': '#6B7280', 'gray': '#6B7280',
      'amarillo': '#EAB308', 'yellow': '#EAB308',
      'naranja': '#F97316', 'orange': '#F97316',
      'rosa': '#EC4899', 'pink': '#EC4899',
      'morado': '#9333EA', 'purple': '#9333EA',
      'marino': '#1E3A8A', 'navy': '#1E3A8A',
    };
    // Intentar buscar por palabras clave si no hay coincidencia exacta
    const lowerName = colorName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (lowerName.includes(key)) return value;
    }
    return '#E5E7EB'; // Gris por defecto
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-[#48475c] mb-4 flex items-center gap-2">
        🎨 Selecciona Color
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {availableColors.map((color) => {
          const isSelected = selectedColor === color.name;
          const isOutOfStock = color.stockStatus === 'OUT_OF_STOCK';
          
          return (
            <button
              key={color.id}
              onClick={() => {
                if (!disabled && !isOutOfStock) {
                  onColorSelect(color.name);
                  success(`Color ${color.name} seleccionado`);
                }
              }}
              disabled={disabled || isOutOfStock}
              className={`
                relative w-10 h-10 rounded-md border-2 overflow-hidden transition-all group
                ${isSelected 
                  ? 'border-blue-600 ring-2 ring-blue-200 scale-110 z-10' 
                  : 'border-slate-200 hover:border-blue-400'
                }
                ${isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed grayscale' 
                  : 'cursor-pointer hover:scale-105'
                }
              `}
              title={`${color.name} ${isOutOfStock ? '(Sin stock)' : ''}`}
            >
              {/* Imagen o Color Sólido */}
              {color.image ? (
                <img 
                  src={color.image} 
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{ backgroundColor: getColorHex(color.name) }}
                />
              )}
              
              {/* Overlay de Selección */}
              {isSelected && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
              
              {/* Indicador de Sin Stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs rotate-45">AGOTADO</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedColor && (
        <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-sm text-slate-500">Color seleccionado:</span>
          <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {selectedColor}
          </span>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
