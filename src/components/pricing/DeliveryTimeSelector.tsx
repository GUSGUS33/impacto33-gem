import { useState, useMemo, useEffect } from 'react';
import { Check } from 'lucide-react';
import deliveryConfig from '@shared/config/delivery-times.json';
import { addBusinessDays, formatDeliveryDate } from '@shared/utils/businessDays';

export type DeliveryOption = 'sin_prisa' | 'normal' | 'urgente';

interface DeliveryTimeSelectorProps {
  categorySlug?: string;
  onSelect: (option: DeliveryOption, surchargePercent: number) => void;
  defaultOption?: DeliveryOption;
}

export function DeliveryTimeSelector({
  categorySlug,
  onSelect,
  defaultOption = deliveryConfig.defaultOption as DeliveryOption
}: DeliveryTimeSelectorProps) {
  const [selected, setSelected] = useState<DeliveryOption>(defaultOption);

  // Sync internal state when defaultOption changes
  useEffect(() => {
    setSelected(defaultOption);
  }, [defaultOption]);

  // Get delivery options for the category (or use default)
  const options = useMemo(() => {
    const categoryOptions = deliveryConfig.categories[categorySlug as keyof typeof deliveryConfig.categories] 
      || deliveryConfig.categories.default;
    
    return categoryOptions;
  }, [categorySlug]);

  // Calculate delivery dates for each option
  const deliveryDates = useMemo(() => {
    const today = new Date();
    return {
      sin_prisa: addBusinessDays(today, options.sin_prisa.businessDays),
      normal: addBusinessDays(today, options.normal.businessDays),
      urgente: addBusinessDays(today, options.urgente.businessDays)
    };
  }, [options]);

  const handleSelect = (option: DeliveryOption) => {
    setSelected(option);
    const surchargePercent = options[option].surchargePercent;
    onSelect(option, surchargePercent);
  };

  const renderOption = (key: DeliveryOption) => {
    const option = options[key];
    const date = deliveryDates[key];
    const isSelected = selected === key;
    const [dayName, dayNum, month] = formatDeliveryDate(date).split(' ');

    return (
      <button
        key={key}
        onClick={() => handleSelect(key)}
        className={`relative flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
          isSelected
            ? 'border-red-600 bg-red-50'
            : 'border-slate-300 bg-white hover:border-red-400'
        }`}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className="text-xs text-slate-600 mb-1">{dayName}</div>
        <div className="text-3xl font-bold text-slate-900">{dayNum}</div>
        <div className="text-sm text-slate-600 mb-3">{month}</div>
        
        <div className={`px-4 py-1 rounded text-sm font-semibold ${
          isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
        }`}>
          {option.label}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Tiempo de producción</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {renderOption('sin_prisa')}
        {renderOption('normal')}
        {renderOption('urgente')}
      </div>

      <p className="text-xs text-slate-500 text-right">{deliveryConfig.disclaimer}</p>
    </div>
  );
}
