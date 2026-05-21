import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Componente reutilizable para secciones colapsables
 * Mantiene su estado interno y permite colapsar/expandir contenido
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  onOpenChange,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return (
    <div className="border-t border-slate-200 pt-4">
      {/* Encabezado colapsable */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between hover:text-blue-600 transition-colors py-2 px-0"
        aria-expanded={isOpen}
        aria-controls={`section-${title}`}
      >
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <ChevronDown
          size={20}
          className={`text-slate-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Contenido colapsable con animación suave */}
      <div
        id={`section-${title}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-4 pb-2">{children}</div>
      </div>

      {/* Botón de estado (texto adicional para claridad) */}
      <div className="text-xs text-slate-500 mt-2">
        {isOpen ? 'Ocultar ajustes de impresión' : 'Mostrar ajustes de impresión'}
      </div>
    </div>
  );
}
