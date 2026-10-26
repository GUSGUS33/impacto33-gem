import type { DeliveryDates } from "@/lib/quoteSnapshot";
import { useState, useMemo, useEffect } from "react";
import styles from "./calculator.module.css";
import { Check } from "lucide-react";
import deliveryConfig from "@shared/config/delivery-times.json";
import {
  addBusinessDays,
  formatDeliveryDate,
} from "@shared/utils/businessDays";

export type DeliveryOption = "sin_prisa" | "normal" | "urgente";

interface DeliveryTimeSelectorProps {
  deliveryDates?: DeliveryDates;
  categorySlug?: string;
  onSelect: (option: DeliveryOption, surchargePercent: number) => void;
  defaultOption?: DeliveryOption;
}

export default function Delivery({
  categorySlug,
  deliveryDates: suppliedDeliveryDates,
  onSelect,
  defaultOption = deliveryConfig.defaultOption as DeliveryOption,
}: DeliveryTimeSelectorProps) {
  const [selected, setSelected] = useState<DeliveryOption>(defaultOption);

  // Sync internal state when defaultOption changes
  useEffect(() => {
    setSelected(defaultOption);
  }, [defaultOption]);

  // Get delivery options for the category (or use default)
  const options = useMemo(() => {
    const categoryOptions =
      deliveryConfig.categories[
        categorySlug as keyof typeof deliveryConfig.categories
      ] || deliveryConfig.categories.default;

    return categoryOptions;
  }, [categorySlug]);

  // Calculate delivery dates for each option
  const deliveryDates = useMemo(() => {
    if (suppliedDeliveryDates) return suppliedDeliveryDates;
    const today = new Date();
    return {
      sin_prisa: addBusinessDays(today, options.sin_prisa.businessDays),
      normal: addBusinessDays(today, options.normal.businessDays),
      urgente: addBusinessDays(today, options.urgente.businessDays),
    };
  }, [options, suppliedDeliveryDates]);

  const handleSelect = (option: DeliveryOption) => {
    setSelected(option);
    const surchargePercent = options[option].surchargePercent;
    onSelect(option, surchargePercent);
  };

  const renderOption = (key: DeliveryOption) => {
    const option = options[key];
    const date = deliveryDates[key];
    const isSelected = selected === key;
    const [dayName, dayNum, month] = formatDeliveryDate(date).split(" ");

    return (
      <button
        type="button"
        key={key}
        onClick={() => handleSelect(key)}
        aria-pressed={isSelected}
        className={styles.deliveryOption}
        data-selected={isSelected}
        data-urgent={key === "urgente"}
      >
        {isSelected && (
          <div className={styles.deliveryCheck}>
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`px-4 py-1 rounded text-sm font-semibold ${
            isSelected
              ? "text-green-800"
              : key === "urgente"
                ? "text-red-700"
                : "text-slate-700"
          }`}
        >
          {{ sin_prisa: "Estándar", normal: "Rápido", urgente: "Urgente" }[key]}
        </div>
        <span className={styles.deliveryDate}>
          {dayName.toLowerCase()} {dayNum} {month.slice(0, 3)}
        </span>
        <span className={styles.deliveryCost}>
          {option.surchargePercent === 0
            ? "Incluido"
            : `+${option.surchargePercent}%`}
        </span>
      </button>
    );
  };

  return (
    <fieldset className="space-y-4">
      <div className={styles.deliveryGrid}>
        {renderOption("sin_prisa")}
        {renderOption("normal")}
        {renderOption("urgente")}
      </div>

      <p className="text-xs leading-relaxed text-slate-500 sm:text-right">
        Entrega si confirmas hoy
      </p>
    </fieldset>
  );
}
