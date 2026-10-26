"use client";

import React, { useState, useEffect, useMemo } from "react";
import type OriginalFlow from "../ProductPricingFlow";
import { useProductPricing } from "@/hooks/useProductPricing";
import { useProductConfig } from "@/hooks/useProductConfig";
import { useRestoredProductConfig } from "@/hooks/useRestoredProductConfig";
import { clearProductConfig } from "@/services/productConfigService";
import { getAvailablePrintingMethods } from "@/services/pricingService";
import { resolveProductPricingCategory } from "@/lib/productPricingCategory";
import { formatProductOptionLabel } from "@/lib/productContent";
import type { PrintingMethodId } from "@/types/printing";
import { PRINTING_METHODS } from "@/data/pricing/printing-methods";
import { QuoteRequestModal } from "../QuoteRequestModal";
import { Check, MapPin } from "lucide-react";
import {
  Step,
  OptionalPrice,
  QuantityGrid,
  ColorPreview,
  ZoneIcon,
} from "./Presentation";
import Delivery from "./Delivery";
import Summary from "./Summary";
import { includedZones } from './includedZones';
import PriceScaleTable from "./PriceScaleTable";
import styles from "./calculator.module.css";
import { normalizeProductPrice } from "@/lib/normalizeProductPrice";

import { captureQuoteSnapshot, getDeliveryDates } from "@/lib/quoteSnapshot";

// Isolated consumer: original flow, hooks, persistence keys and modal stay intact.
export default function ProductQuoteCalculator({
  product,
  onRequestQuote,
  onColorChange,
}: React.ComponentProps<typeof OriginalFlow>) {
  const { config: savedConfig, isReady: isSavedConfigReady } =
    useRestoredProductConfig(product.slug || "");
  const [hasRestoredConfig, setHasRestoredConfig] = useState(false);
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPrintingMethod, setSelectedPrintingMethod] =
    useState<PrintingMethodId>("DTF");
  const [deliverySurchargePercent, setDeliverySurchargePercent] = useState(0);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<
    "sin_prisa" | "normal" | "urgente"
  >("sin_prisa");
  // Obtener categoría del producto
  const categorySlug = resolveProductPricingCategory(
    product.productCategories?.nodes
  );

  // Obtener métodos de impresión disponibles para esta categoría
  const availablePrintingMethods = getAvailablePrintingMethods(categorySlug);

  const {
    // Datos
    availableColors,
    sizeOptions,
    pricingData,

    // Estado
    selectedColor,
    quantities,
    selectedZones,
    priceCalculation,

    // Derivados
    hasSelectedColor,
    canEnterQuantities,
    isReadyForPricing,
    isValid,
    isCalculating,
    totalQuantity,
    colorVariations, // Necesario para el modal

    // Acciones
    selectColor,
    updateQuantity,
    toggleZone,
    restoreConfiguration,
    resetConfiguration,
  } = useProductPricing({
    product,
    basePrice: product.price ? normalizeProductPrice(product.price) : 0,
    pricingCategory: categorySlug, // Dinámico desde categoría del producto
    initialColor: "",
    initialQuantities: {},
    initialZones: [],
  });

  useEffect(() => {
    if (!isSavedConfigReady) return;

    if (savedConfig) {
      restoreConfiguration({
        selectedColor: savedConfig.selectedColor,
        quantities: savedConfig.quantities,
        selectedZones: savedConfig.activeZones,
      });
      setSelectedPrintingMethod(
        (savedConfig.printingMethod as PrintingMethodId) || "DTF"
      );
      // Authorized exception: never restore the saved delivery option.
      setHasRestoredConfig(true);
    }

    setIsPersistenceReady(true);
  }, [isSavedConfigReady, restoreConfiguration, savedConfig]);

  // Mantener las zonas coherentes con el método seleccionado sin duplicar toggles.
  useEffect(() => {
    if (!hasSelectedColor || totalQuantity <= 0 || !pricingData) return;

    if (selectedPrintingMethod === "SIN_IMPRESION") {
      selectedZones.forEach(zone => toggleZone(zone));
      return;
    }

    if (selectedZones.length === 0) {
      const [firstAvailableZone] = includedZones(pricingData);
      if (firstAvailableZone) toggleZone(firstAvailableZone);
    }
  }, [
    hasSelectedColor,
    pricingData,
    selectedPrintingMethod,
    selectedZones,
    toggleZone,
    totalQuantity,
  ]);

  // Auto-save configuration with useProductConfig hook
  useProductConfig({
    productId: parseInt(product.id) || 0,
    productSlug: product.slug || "",
    selectedColor,
    quantities,
    printingMethod: selectedPrintingMethod,
    activeZones: selectedZones,
    deliveryOption: selectedDeliveryOption,
    skipAutoSave: !isPersistenceReady,
  });

  const handleResetConfiguration = () => {
    clearProductConfig(product.slug || "");
    resetConfiguration();
    setSelectedPrintingMethod("DTF");
    setSelectedDeliveryOption("sin_prisa");
    setDeliverySurchargePercent(0);
    setHasRestoredConfig(false);
  };

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [warning, setWarning] = useState("");
  const [datesReady, setDatesReady] = useState(false);
  useEffect(() => {
    setDatesReady(true);
  }, []);

  // Authorized exception: select the only purchasable color, after restoration.
  const purchasableColors = availableColors.filter(
    color => color.stockStatus !== "OUT_OF_STOCK"
  );
  useEffect(() => {
    if (!isPersistenceReady || selectedColor || purchasableColors.length !== 1)
      return;
    const color = purchasableColors[0];
    selectColor(color.name);
    onColorChange?.(color.name, "image" in color ? color.image : undefined);
  }, [
    isPersistenceReady,
    selectedColor,
    purchasableColors,
    selectColor,
    onColorChange,
  ]);

  const chooseColor = (colorName: string) => {
    if (
      colorName !== selectedColor &&
      totalQuantity > 0 &&
      !window.confirm(
        "Cambiar de color borrará las cantidades introducidas. Todavía no se pueden combinar varios colores. ¿Quieres continuar?"
      )
    )
      return;
    selectColor(colorName);
    setWarning("");
    const color = availableColors.find(item => item.name === colorName);
    onColorChange?.(
      colorName,
      color && "image" in color ? color.image : undefined
    );
  };
  const deliveryDates = useMemo(() => getDeliveryDates(categorySlug), [categorySlug]);
  const quoteSnapshot = useMemo(() => priceCalculation
    ? captureQuoteSnapshot(priceCalculation, deliverySurchargePercent, selectedDeliveryOption,
        deliveryDates[selectedDeliveryOption], selectedPrintingMethod)
    : null, [priceCalculation, deliverySurchargePercent, selectedDeliveryOption, deliveryDates, selectedPrintingMethod]);
  const requestQuote = () => {
    setIsQuoteModalOpen(true);
    onRequestQuote?.({
      productId: product.id,
      selectedColor,
      quantities,
      selectedZones,
      priceCalculation,
      totalQuantity,
    });
  };
  const minimum =
    priceCalculation?.cantidadMinima ?? pricingData?.cantidad_minima;
  // Unknown stock must not be advertised as the hook's synthetic 999/9999 units.
  const stockKnown = (colorName: string, size?: string) => {
    const variations = product.variations?.nodes || [];
    if (!variations.length) return product.stockQuantity != null;
    const matches = variations.filter(
      v =>
        v.attributes?.nodes.some(
          a => a.name === "pa_color" && a.value === colorName
        ) &&
        (!size ||
          v.attributes?.nodes.some(
            a =>
              (a.name === "pa_size" || a.name === "pa_talla") &&
              a.value === size
          ))
    );
    return matches.length > 0 && matches.every(v => v.stockQuantity != null);
  };

  return (
    <div className={styles.calculator} data-quote-calculator>
      <header className={styles.header}>
        <h2>Configura tu presupuesto</h2>
        {hasRestoredConfig && (
          <small className={styles.restored} role="status">
            Recuperamos tu última configuración ·{" "}
            <button type="button" onClick={handleResetConfiguration}>
              Empezar de nuevo
            </button>
          </small>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={showBreakdown}
          className={styles.switch}
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <span aria-hidden="true" data-on={showBreakdown} /> Ver desglose
        </button>
      </header>
      <Step
        number={1}
        completed={hasSelectedColor}
        title={`Color${hasSelectedColor ? ` — ${formatProductOptionLabel(selectedColor)}${availableColors.find(color => color.name === selectedColor)?.stockStatus === "IN_STOCK" ? " · En stock" : ""}` : ""}`}
      >
        <div className={styles.colors}>
          {availableColors.map(color => (
            <button
              type="button"
              key={color.id}
              className={styles.color}
              title={formatProductOptionLabel(color.name)}
              aria-label={`${formatProductOptionLabel(color.name)}${color.stockStatus === "OUT_OF_STOCK" ? " — Agotado" : ""}`}
              aria-pressed={selectedColor === color.name}
              disabled={color.stockStatus === "OUT_OF_STOCK"}
              onClick={() => chooseColor(color.name)}
            >
              <span className={styles.swatch}>
                <ColorPreview
                  key={"image" in color ? color.image : color.name}
                  src={"image" in color ? color.image : undefined}
                  name={formatProductOptionLabel(color.name)}
                />
                {selectedColor === color.name && (
                  <Check size={14} className={styles.colorCheck} />
                )}
              </span>
            </button>
          ))}
        </div>
        <p className={styles.help}>
          ¿Varios colores? Indícalo al solicitar el presupuesto.
        </p>
        {!hasSelectedColor && (
          <p className={styles.notice}>
            Elige un color para ver tallas y stock.
          </p>
        )}
      </Step>
      <Step
        number={2}
        completed={minimum != null && totalQuantity >= minimum}
        title={sizeOptions.length === 1 ? "Cantidad" : "Tallas y cantidades"}
        locked={!hasSelectedColor}
      >
        <QuantityGrid
          sizeOptions={sizeOptions}
          quantities={quantities}
          onQuantityChange={updateQuantity}
          disabled={!hasSelectedColor}
          selectedColor={selectedColor}
          stockKnown={stockKnown}
          onWarning={setWarning}
        />
        <p className={styles.help}>
          Puedes combinar tallas del mismo color para alcanzar el mínimo.
        </p>
        {warning && (
          <p role="status" className={styles.warning}>
            {warning}
          </p>
        )}
        <div data-quote-scale aria-live="polite">
          {!priceCalculation && pricingData && (
            <PriceScaleTable
              pricingData={pricingData}
              regularPrice={normalizeProductPrice(product.price || 0)}
              selectedZones={selectedZones}
              currentQuantity={0}
              deliverySurchargePercent={deliverySurchargePercent}
            />
          )}
        </div>
      </Step>
      <Step number={3} title="Personalización" locked={!isReadyForPricing}>
        {
          <>
            <div className={styles.techniques}>
              {availablePrintingMethods.map(method => (
                <button
                  type="button"
                  key={method}
                  className={`${styles.option} ${styles.techniqueCard}`}
                  aria-pressed={selectedPrintingMethod === method}
                  onClick={() => setSelectedPrintingMethod(method)}
                >
                  {method === "DTF" && (
                    <img
                      className={styles.techniqueImage}
                      src="https://files.manuscdn.com/user_upload_by_module/session_file/100927939/KlBpdmFRWMnzhiOA.png"
                      alt=""
                    />
                  )}
                  {selectedPrintingMethod === method && (
                    <Check
                      className={styles.techniqueCheck}
                      size={22}
                      aria-hidden="true"
                    />
                  )}
                  <strong>
                    {method === "DTF"
                      ? "Impresión a todo color · DTF"
                      : PRINTING_METHODS[method].label}
                  </strong>
                  <span>
                    {method === "DTF"
                      ? "Ideal para logos con varios colores, fotos y degradados"
                      : PRINTING_METHODS[method].description}
                  </span>
                  {/* Future provider quote slot: intentionally no amount until supplied. */}
                  <OptionalPrice />
                </button>
              ))}
            </div>
          </>
        }
        <p className={styles.help}>Zonas de impresión · Puedes elegir varias</p>
        <div className={styles.zones}>
          {(pricingData?.zonas_permitidas || []).map(zone => (
            <button
              type="button"
              key={zone}
              className={styles.option}
              aria-pressed={selectedZones.includes(zone)}
              onClick={() => toggleZone(zone)}
            >
              <span className={styles.zoneIcon}>
                <ZoneIcon zone={zone} />
                <span className={styles.checkbox} aria-hidden="true">
                  {selectedZones.includes(zone) && <Check size={14} />}
                </span>
              </span>
              <strong>{formatProductOptionLabel(zone)}</strong>
              {showBreakdown && (
                <OptionalPrice
                  amount={pricingData?.coste_personalizacion[zone]}
                  suffix="/ud"
                />
              )}
            </button>
          ))}
        </div>
      </Step>
      <Step number={4} title="Plazo de entrega" locked={!isReadyForPricing}>
        {datesReady && (
          <Delivery
            deliveryDates={deliveryDates}
            categorySlug={categorySlug}
            defaultOption={selectedDeliveryOption}
            onSelect={(option, surchargePercent) => {
              setDeliverySurchargePercent(surchargePercent);
              setSelectedDeliveryOption(option);
            }}
          />
        )}
      </Step>
      <Step number={5} title="Tu presupuesto" locked={!isReadyForPricing}>
        <Summary
          quoteSnapshot={quoteSnapshot}
          priceCalculation={priceCalculation}
          selectedColor={selectedColor}
          isValid={isValid}
          isCalculating={isCalculating}
          quantities={quantities}
          selectedZones={selectedZones}
          selectedPrintingMethod={selectedPrintingMethod}
          selectedDeliveryOption={selectedDeliveryOption}
          pricingData={pricingData}
          regularPrice={
            typeof product?.price === "number"
              ? product.price
              : normalizeProductPrice(product?.price as string) || 0
          }
          deliverySurchargePercent={deliverySurchargePercent}
          showDetailedBreakdown={showBreakdown}
          onRequestQuote={requestQuote}
          modalOpen={isQuoteModalOpen}
        />
      </Step>
      {/* Modal de Solicitud de Presupuesto */}
      {priceCalculation && (
        <QuoteRequestModal
          quoteSnapshot={quoteSnapshot ?? undefined}
          deliveryDates={deliveryDates}
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          product={product}
          selectedColor={selectedColor}
          selectedColorVariations={colorVariations}
          quantities={quantities}
          priceCalculation={priceCalculation}
          selectedZones={selectedZones}
          selectedPrintingMethod={selectedPrintingMethod}
          deliverySurchargePercent={deliverySurchargePercent}
          selectedDeliveryOption={selectedDeliveryOption}
          categorySlug={categorySlug}
          onDeliveryOptionChange={(option, surchargePercent) => {
            setSelectedDeliveryOption(option);
            setDeliverySurchargePercent(surchargePercent);
          }}
        />
      )}
    </div>
  );
}
