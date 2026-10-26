import React, { useState } from "react";
import { Minus, Plus, ImageOff } from "lucide-react";
import type SizeQuantityTable from "../SizeQuantityTable";
import { formatProductOptionLabel } from "@/lib/productContent";
import { formatEuroPrice } from "@/services/pricingService";
import styles from "./calculator.module.css";

export function ColorPreview({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      ref={image => {
        if (image?.complete && image.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={styles.imageFallback}>
      <ImageOff size={18} aria-hidden="true" />
      <small>{name}</small>
    </span>
  );
}

export function ZoneIcon({ zone }: { zone: string }) {
  // Generic garment pictograms, not product-specific printable dimensions.
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 6L5 10L2 18L10 21L12 17V34H28V17L30 21L38 18L35 10L27 6Q20 11 13 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="#f4f6fa"
      />
      {zone === "frontal" && (
        <>
          <path d="M15 8Q20 16 25 8" stroke="currentColor" />
          <rect
            x="15"
            y="17"
            width="10"
            height="10"
            rx="2"
            fill="currentColor"
          />
        </>
      )}
      {zone === "espalda" && (
        <>
          <path d="M15 8H25" stroke="currentColor" />
          <rect
            x="15"
            y="13"
            width="10"
            height="16"
            rx="2"
            fill="currentColor"
          />
        </>
      )}
      {zone === "manga_izquierda" && (
        <path d="M6 12L11 10L10 18L5 17Z" fill="currentColor" />
      )}
      {zone === "manga_derecha" && (
        <path d="M34 12L29 10L30 18L35 17Z" fill="currentColor" />
      )}
    </svg>
  );
}

export function sortSizes<T extends { size: string }>(options: T[]): T[] {
  const order = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "2XL",
    "XXXL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
  ];
  return [...options].sort((a, b) => {
    const x = order.indexOf(a.size.toUpperCase()),
      y = order.indexOf(b.size.toUpperCase());
    return x >= 0 && y >= 0
      ? x - y
      : x >= 0
        ? -1
        : y >= 0
          ? 1
          : a.size.localeCompare(b.size, "es", { numeric: true });
  });
}

export function Step({
  number,
  title,
  locked = false,
  completed = false,
  children,
}: {
  number: number;
  title: string;
  locked?: boolean;
  completed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={styles.step}
      data-locked={locked}
      data-quote-step={number}
      inert={locked}
      aria-label={`${number}. ${title}`}
    >
      <h3>
        <span
          data-completed={completed}
          aria-label={completed ? `Paso ${number} completado` : undefined}
        >
          {completed ? "✓" : number}
        </span>
        {title}
      </h3>
      <fieldset disabled={locked} inert={locked} className={styles.content}>
        {children}
      </fieldset>
    </section>
  );
}

// Presentation slot only. No fallback or provider pricing calculation.
export function OptionalPrice({
  amount,
  suffix = "",
}: {
  amount?: number | null;
  suffix?: string;
}) {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  return (
    <span className={styles.optionalPrice}>
      {formatEuroPrice(amount)}
      {suffix}
    </span>
  );
}

export function stockLabel(stock: number, known: boolean, out: boolean) {
  if (out) return "Agotado";
  if (!known || stock >= 9999) return "En stock";
  return stock <= 50 ? `Quedan ${stock}` : `Stock: ${stock} uds`;
}

type GridProps = React.ComponentProps<typeof SizeQuantityTable> & {
  selectedColor: string;
  stockKnown: (color: string, size?: string) => boolean;
  onWarning: (message: string) => void;
};

function QuantityCell({
  option,
  quantity,
  disabled,
  selectedColor,
  known,
  onQuantityChange,
  onWarning,
}: {
  option: GridProps["sizeOptions"][number];
  quantity: number;
  disabled: boolean;
  selectedColor: string;
  known: boolean;
  onQuantityChange: GridProps["onQuantityChange"];
  onWarning: GridProps["onWarning"];
}) {
  // Input draft is presentation only; the existing updateQuantity remains the stock authority.
  const [localValue, setLocalValue] = useState<string | null>(null);
  const out =
    option.stockStatus === "OUT_OF_STOCK" || option.stockQuantity <= 0;
  const label = formatProductOptionLabel(option.size);
  const change = (value: number) => {
    onWarning(
      value > option.stockQuantity
        ? known && option.stockQuantity < 9999
          ? `Solo quedan ${option.stockQuantity} uds en talla ${label} de ${formatProductOptionLabel(selectedColor)}. Hemos ajustado la cantidad.`
          : "Hemos ajustado la cantidad al límite disponible. Consulta disponibilidad para cantidades superiores."
        : ""
    );
    onQuantityChange(option.size, value);
    setLocalValue(null);
  };
  return (
    <div className={styles.cell} data-filled={quantity > 0} data-out={out}>
      <label htmlFor={`quote-size-${option.size}`}>{label}</label>
      {!out ? (
        <div className={styles.stepper}>
          <button
            type="button"
            aria-label={`Restar una unidad de ${label}`}
            disabled={disabled || quantity <= 0}
            onClick={() => change(quantity - 1)}
          >
            <Minus size={16} />
          </button>
          <input
            id={`quote-size-${option.size}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={option.stockQuantity}
            placeholder="0"
            value={localValue ?? (quantity || "")}
            disabled={disabled}
            onChange={event => {
              const value = event.target.value;
              if (value === "") {
                setLocalValue("");
                onQuantityChange(option.size, 0);
                return;
              }
              const parsed = Number(value);
              if (Number.isInteger(parsed) && parsed >= 0) change(parsed);
            }}
            onBlur={() => setLocalValue(null)}
          />
          <button
            type="button"
            aria-label={`Añadir una unidad de ${label}`}
            disabled={disabled || quantity >= option.stockQuantity}
            onClick={() => change(quantity + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <span className={styles.unavailable}>No disponible</span>
      )}
      <span
        className={out ? styles.out : known && option.stockQuantity <= 50 ? styles.low : styles.ok}
      >
        {disabled ? "Elige color" : stockLabel(option.stockQuantity, known, out)}
      </span>
    </div>
  );
}

export function QuantityGrid({
  sizeOptions,
  quantities,
  onQuantityChange,
  disabled = false,
  selectedColor,
  stockKnown,
  onWarning,
}: GridProps) {
  return (
    <div className={styles.sizes}>
      {sortSizes(sizeOptions).map(option => (
        <QuantityCell
          key={`${selectedColor}-${option.size}`}
          option={option}
          quantity={quantities[option.size] || 0}
          disabled={disabled}
          selectedColor={selectedColor}
          known={stockKnown(selectedColor, option.size)}
          onQuantityChange={onQuantityChange}
          onWarning={onWarning}
        />
      ))}
      {!sizeOptions.length && (
        <p>Las tallas y cantidades aparecerán al elegir un color disponible.</p>
      )}
    </div>
  );
}
