import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface SizeQuantityOption {
  size: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  stockQuantity: number;
  price: number;
  variationId?: string;
}

interface SizeQuantityTableProps {
  sizeOptions: SizeQuantityOption[];
  quantities: Record<string, number>;
  onQuantityChange: (size: string, quantity: number) => void;
  disabled?: boolean;
  title?: string;
}

interface SizeInputProps {
  size: string;
  currentQuantity: number;
  maxStock: number;
  isLowStock: boolean;
  disabled: boolean;
  onQuantityChange: (size: string, quantity: number) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
}

// Componente separado para el input con estado local
const SizeInput: React.FC<SizeInputProps> = ({
  size,
  currentQuantity,
  maxStock,
  isLowStock,
  disabled,
  onQuantityChange,
  success,
  error
}) => {
  const [localValue, setLocalValue] = useState<string>(currentQuantity > 0 ? String(currentQuantity) : '');
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  // Función de validación compartida (usada por debounce y blur)
  const handleValidation = useCallback(() => {
    const val = localValue.trim();
    
    if (val === '') {
      onQuantityChange(size, 0);
      setLocalValue('');
      return;
    }
    
    const newQuantity = parseInt(val, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      setLocalValue(currentQuantity > 0 ? String(currentQuantity) : '');
      return;
    }
    
    // Validar stock insuficiente
    if (newQuantity > maxStock) {
      error(`Stock insuficiente. Máximo disponible: ${maxStock} ud.`);
      onQuantityChange(size, maxStock);
      setLocalValue(String(maxStock));
      return;
    }
    
    onQuantityChange(size, newQuantity);
    
    if (newQuantity > 0) {
      success(`Talla ${size}: ${newQuantity} ud.`);
    }
  }, [localValue, size, maxStock, currentQuantity, onQuantityChange, success, error]);

  // Sincronizar con el valor externo solo cuando cambia desde fuera
  useEffect(() => {
    setLocalValue(currentQuantity > 0 ? String(currentQuantity) : '');
  }, [currentQuantity]);

  // Debounce: validar automáticamente 500ms después de dejar de escribir
  useEffect(() => {
    // No validar si el valor local es igual al actual (evita loops)
    if (localValue === (currentQuantity > 0 ? String(currentQuantity) : '')) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      handleValidation();
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [localValue, currentQuantity, handleValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
  };

  const handleBlur = () => {
    // Validar inmediatamente al salir del input (por si el usuario hace clic fuera antes del debounce)
    handleValidation();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      return;
    }
    
    // Atajos de teclado: + para incrementar, - para decrementar
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      const newValue = Math.min((currentQuantity || 0) + 1, maxStock);
      setLocalValue(String(newValue));
      return;
    }
    
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      const newValue = Math.max((currentQuantity || 0) - 1, 0);
      setLocalValue(String(newValue));
      return;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Input de cantidad */}
      <div className="relative">
        <input
          type="number"
          min="0"
          max={maxStock}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-16 h-12 md:h-10 border-2 rounded-lg text-center font-bold text-lg outline-none transition-all touch-manipulation
            ${currentQuantity > 0 
              ? 'border-blue-500 text-blue-700 bg-white shadow-md shadow-blue-100' 
              : isLowStock
              ? 'border-amber-400 text-slate-700 hover:border-amber-500 focus:border-amber-500 focus:shadow-md focus:shadow-amber-100'
              : 'border-slate-200 text-slate-700 hover:border-slate-300 focus:border-blue-400'
            }
            ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}
            ${isDebouncing ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
          `}
          placeholder="0"
        />
        
        {/* Indicador visual de debounce */}
        {isDebouncing && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

const SizeQuantityTable: React.FC<SizeQuantityTableProps> = ({
  sizeOptions,
  quantities,
  onQuantityChange,
  disabled = false,
  title = "Introduce Cantidades"
}) => {
  const { success, warning, error } = useNotification();
  
  // Función para detectar si una talla es de niños
  const isChildSize = (size: string): boolean => {
    const normalizedSize = size.toUpperCase().trim();
    // Tallas de niños: números simples (3-4, 5-6, 7-8, 9-10, 11-12, etc.)
    return /^\d+(-\d+)?$/.test(normalizedSize);
  };

  // Separar tallas en niños y adultos
  const childSizes = sizeOptions.filter(s => isChildSize(s.size));
  const adultSizes = sizeOptions.filter(s => !isChildSize(s.size));

  // Ordenar tallas de forma lógica
  const sortSizes = (sizes: SizeQuantityOption[]): SizeQuantityOption[] => {
    return [...sizes].sort((a, b) => {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];
      
      const normA = a.size.toUpperCase().trim();
      const normB = b.size.toUpperCase().trim();
      
      const aIndex = sizeOrder.indexOf(normA);
      const bIndex = sizeOrder.indexOf(normB);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Para tallas de niños, ordenar numéricamente
      const aNum = parseInt(normA);
      const bNum = parseInt(normB);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      
      return normA.localeCompare(normB);
    });
  };

  const sortedChildSizes = sortSizes(childSizes);
  const sortedAdultSizes = sortSizes(adultSizes);

  // Componente para renderizar una tabla de tallas
  const SizeTable = ({ sizes, label }: { sizes: SizeQuantityOption[], label?: string }) => (
    <div>
      {label && (
        <div className="bg-blue-50 px-4 py-2 mb-0 rounded-t-lg border border-blue-100 border-b-0 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-xs text-green-600 font-medium">
            Stock en tiempo real
          </span>
        </div>
      )}
      
      <div className="border border-slate-200 rounded-b-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px]">
            <thead className="bg-slate-50">
              <tr>
                {sizes.map((size) => (
                  <th 
                    key={size.size}
                    className="px-2 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200"
                  >
                    {size.size}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              <tr>
                {sizes.map((sizeOption) => {
                  const currentQuantity = quantities[sizeOption.size] || 0;
                  const isOutOfStock = sizeOption.stockStatus === 'OUT_OF_STOCK' || sizeOption.stockQuantity <= 0;
                  const maxStock = sizeOption.stockQuantity || 0;
                  const isLowStock = !isOutOfStock && maxStock > 0 && maxStock < 5;
                  
                  return (
                    <td 
                      key={sizeOption.size}
                      className={`px-2 py-4 text-center border-r border-slate-100 last:border-r-0 transition-colors ${
                        currentQuantity > 0 ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {isOutOfStock ? (
                        // Stock = 0: Input deshabilitado + "0" en rojo
                        <div className="flex flex-col items-center justify-center h-[80px] gap-2">
                          <input
                            type="number"
                            disabled
                            value="0"
                            className="w-16 h-10 border-2 border-red-300 rounded-lg text-center font-bold text-lg bg-slate-50 text-red-600 cursor-not-allowed opacity-60"
                          />
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Stock 0
                          </span>
                        </div>
                      ) : (
                        <SizeInput
                          size={sizeOption.size}
                          currentQuantity={currentQuantity}
                          maxStock={maxStock}
                          isLowStock={isLowStock}
                          disabled={disabled}
                          onQuantityChange={onQuantityChange}
                          success={success}
                          error={error}
                        />
                      )}
                      
                      {/* Stock en tiempo real con colores según estado */}
                      {!isOutOfStock && (
                        <>
                          
                        <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          isLowStock 
                            ? 'text-amber-600 bg-amber-50 border-amber-100' 
                            : 'text-green-600 bg-green-50 border-green-100'
                        }`}>
                          {maxStock} disp.
                        </div>
                        
                        {/* Notificación de stock bajo */}
                        {isLowStock && (
                          <span className="text-[9px] text-amber-600 font-semibold">
                            ⚠️ Stock bajo
                          </span>
                        )}
                      </>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8 space-y-6">
      {/* Tabla de tallas de niños */}
      {sortedChildSizes.length > 0 && (
        <SizeTable sizes={sortedChildSizes} label="👶 TALLAS DE NIÑOS" />
      )}
      
      {/* Tabla de tallas de adultos */}
      {sortedAdultSizes.length > 0 && (
        <SizeTable sizes={sortedAdultSizes} label="👕 TALLAS DE ADULTOS" />
      )}
    </div>
  );
};

export default SizeQuantityTable;
