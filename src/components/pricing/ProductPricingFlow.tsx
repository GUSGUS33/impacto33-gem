import React, { useState, useEffect } from 'react';
import { useProductPricing } from '../../hooks/useProductPricing';
import { Product } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
import { QuoteRequestModal } from './QuoteRequestModal';
import { getAvailablePrintingMethods } from '../../services/pricingService';
import type { PrintingMethodId } from '../../types/printing';
import { CollapsibleSection } from '../CollapsibleSection';
import { ChevronDown } from 'lucide-react';
import { useProductConfig } from '../../hooks/useProductConfig';
import { clearProductConfig } from '../../services/productConfigService';
import deliveryConfig from '@shared/config/delivery-times.json';
import ColorSelector from './ColorSelector';
import SizeQuantityTable from './SizeQuantityTable';
import PrintingMethodSelector from './PrintingMethodSelector';
import ZoneSelector from './ZoneSelector';
import PriceCalculator from './PriceCalculator';
import PriceScaleTable from './PriceScaleTable';
import { DeliveryTimeSelector } from './DeliveryTimeSelector';
import { resolveProductPricingCategory } from '@/lib/productPricingCategory';
import { useRestoredProductConfig } from '@/hooks/useRestoredProductConfig';
import { formatProductOptionLabel } from '@/lib/productContent';

interface ProductPricingFlowProps {
  product: Product;
  onRequestQuote?: (data: any) => void;
  onColorChange?: (colorName: string, colorImage?: string) => void;
}

const ProductPricingFlow = React.memo(function ProductPricingFlow({ product, onRequestQuote, onColorChange }: ProductPricingFlowProps) {
  const { config: savedConfig, isReady: isSavedConfigReady } = useRestoredProductConfig(product.slug || '');
  const [hasRestoredConfig, setHasRestoredConfig] = useState(false);
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPrintingMethod, setSelectedPrintingMethod] = useState<PrintingMethodId>(
    'DTF'
  );
  const [deliverySurchargePercent, setDeliverySurchargePercent] = useState(0);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<'sin_prisa' | 'normal' | 'urgente'>('sin_prisa');
  const [isSizeSectionOpen, setIsSizeSectionOpen] = useState(true);
  const [isPrintingMethodSectionOpen, setIsPrintingMethodSectionOpen] = useState(true);
  const [isZonesSectionOpen, setIsZonesSectionOpen] = useState(true);
  // Obtener categoría del producto
  const categorySlug = resolveProductPricingCategory(product.productCategories?.nodes);
  
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
    basePrice: product.price ? parseFloat(product.price.replace(/[^0-9.,]/g, '').replace(',', '.')) : 0,
    pricingCategory: categorySlug, // Dinámico desde categoría del producto
    initialColor: '',
    initialQuantities: {},
    initialZones: []
  });

  useEffect(() => {
    if (!isSavedConfigReady) return;

    if (savedConfig) {
      restoreConfiguration({
        selectedColor: savedConfig.selectedColor,
        quantities: savedConfig.quantities,
        selectedZones: savedConfig.activeZones,
      });
      setSelectedPrintingMethod((savedConfig.printingMethod as PrintingMethodId) || 'DTF');
      setSelectedDeliveryOption(savedConfig.deliveryOption || 'sin_prisa');
      setHasRestoredConfig(true);
    }

    setIsPersistenceReady(true);
  }, [isSavedConfigReady, restoreConfiguration, savedConfig]);

  // Mantener las zonas coherentes con el método seleccionado sin duplicar toggles.
  useEffect(() => {
    if (!hasSelectedColor || totalQuantity <= 0 || !pricingData) return;

    if (selectedPrintingMethod === 'SIN_IMPRESION') {
      selectedZones.forEach((zone) => toggleZone(zone));
      return;
    }

    if (selectedZones.length === 0) {
      const [firstAvailableZone] = pricingData.zonas_permitidas || ['frontal', 'espalda'];
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

  // Restore delivery option from savedConfig
  useEffect(() => {
    if (savedConfig?.deliveryOption) {
      setSelectedDeliveryOption(savedConfig.deliveryOption);
      // Also update the surcharge percent based on restored option
      const categoryOptions = deliveryConfig.categories[categorySlug as keyof typeof deliveryConfig.categories] 
        || deliveryConfig.categories.default;
      const restoredOption = categoryOptions[savedConfig.deliveryOption as keyof typeof categoryOptions];
      if (restoredOption) {
        setDeliverySurchargePercent(restoredOption.surchargePercent);
      }
    }
  }, [savedConfig?.deliveryOption, categorySlug]);

  // Auto-save configuration with useProductConfig hook
  useProductConfig({
    productId: parseInt(product.id) || 0,
    productSlug: product.slug || '',
    selectedColor,
    quantities,
    printingMethod: selectedPrintingMethod,
    activeZones: selectedZones,
    deliveryOption: selectedDeliveryOption,
    skipAutoSave: !isPersistenceReady,
  });

  const handleResetConfiguration = () => {
    clearProductConfig(product.slug || '');
    resetConfiguration();
    setSelectedPrintingMethod('DTF');
    setSelectedDeliveryOption('sin_prisa');
    setDeliverySurchargePercent(0);
    setHasRestoredConfig(false);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {hasRestoredConfig && (
        <div role="status" className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">
          <span>Hemos recuperado tu configuración anterior.</span>
          <button
            type="button"
            onClick={handleResetConfiguration}
            className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            Empezar de nuevo
          </button>
        </div>
      )}
      {/* Cuadro integrado: Color + Tallas + Precios */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative sm:p-6">
        {/* Botón de colapsar/expandir en esquina superior derecha */}
        {canEnterQuantities && (
          <button
            type="button"
            onClick={() => setIsSizeSectionOpen(!isSizeSectionOpen)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
            aria-label={isSizeSectionOpen ? 'Ocultar tallas' : 'Mostrar tallas'}
          >
            <ChevronDown
              size={20}
              className={`text-slate-600 transition-transform duration-300 ${
                isSizeSectionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}

        {/* Selector de Color */}
        <ColorSelector
          availableColors={availableColors}
          selectedColor={selectedColor}
          onColorSelect={(colorName) => {
            selectColor(colorName);
            // Encontrar la imagen del color seleccionado
            const selectedColorObj = availableColors.find(c => c.name === colorName);
            if (onColorChange && selectedColorObj && 'image' in selectedColorObj) {
              onColorChange(colorName, (selectedColorObj as any).image);
            }
          }}
        />

        {/* Tabla de Cantidades por Talla (solo si hay color seleccionado) */}
        {canEnterQuantities && (
          <div className="mt-6">
            {/* Resumen colapsado - Estilo badge verde clickeable */}
            {!isSizeSectionOpen && totalQuantity > 0 && (
              <button
                type="button"
                onClick={() => setIsSizeSectionOpen(true)}
                className="w-full text-left p-3 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-all duration-300 cursor-pointer flex items-center gap-2 animate-in fade-in-0 zoom-in-95"
                aria-label="Expandir tabla de tallas"
              >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700 font-medium">
                  {Object.entries(quantities)
                    .filter(([_, qty]) => qty > 0)
                    .map(([size, qty]) => `${formatProductOptionLabel(size)}: ${qty} ud.`)
                    .join(', ')}
                </p>
              </button>
            )}

            {/* Tabla expandida */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSizeSectionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <SizeQuantityTable
                sizeOptions={sizeOptions}
                quantities={quantities}
                onQuantityChange={updateQuantity}
                disabled={!hasSelectedColor}
                title="" 
              />
            
              {/* Resumen de selección */}
              {totalQuantity > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-green-800 text-sm font-medium">
                      Has seleccionado <span className="font-bold">{totalQuantity}</span> unidades en total
                    </p>
                  </div>
                  {pricingData?.cantidad_minima && totalQuantity < pricingData.cantidad_minima && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-100">
                      Mínimo recomendado: {pricingData.cantidad_minima} uds.
                    </span>
                  )}
                </div>
              )}
              
              {/* Comparativa de Precios por Cantidad */}
              {pricingData && totalQuantity > 0 && (
                <div className="mt-4">
                  <PriceScaleTable
                    pricingData={pricingData}
                    regularPrice={typeof product?.price === 'number' ? product.price : parseFloat(product?.price as string) || 0}
                    selectedZones={selectedZones}
                    currentQuantity={totalQuantity}
                    deliverySurchargePercent={deliverySurchargePercent}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Selector de Método de Impresión */}
      {hasSelectedColor && totalQuantity > 0 && pricingData?.cantidad_minima && totalQuantity >= pricingData.cantidad_minima && availablePrintingMethods.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative sm:p-6" role="group" aria-labelledby="printing-method-label">
          {/* Botón de colapsar/expandir */}
          <button
            type="button"
            onClick={() => setIsPrintingMethodSectionOpen(!isPrintingMethodSectionOpen)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
            aria-label={isPrintingMethodSectionOpen ? 'Ocultar método de impresión' : 'Mostrar método de impresión'}
          >
            <ChevronDown
              size={20}
              className={`text-slate-600 transition-transform duration-300 ${
                isPrintingMethodSectionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <p id="printing-method-label" className="text-base font-semibold text-slate-900 mb-4">🎨 Método de Impresión</p>

          {/* Resumen colapsado - Estilo badge verde clickeable */}
          {!isPrintingMethodSectionOpen && (
            <button
              type="button"
              onClick={() => setIsPrintingMethodSectionOpen(true)}
              className="w-full text-left p-3 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-all duration-300 cursor-pointer flex items-center gap-2 animate-in fade-in-0 zoom-in-95"
              aria-label="Expandir método de impresión"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                {selectedPrintingMethod === 'DTF' ? 'A todo color' : selectedPrintingMethod === 'SERIGRAFIA_1_COLOR' ? '1 color' : selectedPrintingMethod}
              </p>
            </button>
          )}

          {/* Contenido expandido */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isPrintingMethodSectionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <PrintingMethodSelector
              activeMethods={availablePrintingMethods}
              selectedMethod={selectedPrintingMethod}
              onMethodChange={setSelectedPrintingMethod}
              showInactiveMethods={true}
              availableMethods={availablePrintingMethods}
            />
          </div>
        </div>
      )}

      {/* 4. Selector de Zonas de Personalización */}
      {hasSelectedColor && totalQuantity > 0 && pricingData && pricingData.cantidad_minima && totalQuantity >= pricingData.cantidad_minima && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative sm:p-6" role="group" aria-labelledby="personalization-zones-label">
          {/* Botón de colapsar/expandir */}
          <button
            type="button"
            onClick={() => setIsZonesSectionOpen(!isZonesSectionOpen)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
            aria-label={isZonesSectionOpen ? 'Ocultar zonas' : 'Mostrar zonas'}
          >
            <ChevronDown
              size={20}
              className={`text-slate-600 transition-transform duration-300 ${
                isZonesSectionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <p id="personalization-zones-label" className="text-base font-semibold text-slate-900 mb-4">📍 Zonas de Personalización</p>

          {/* Resumen colapsado - Estilo badge verde clickeable */}
          {!isZonesSectionOpen && selectedZones.length > 0 && (
            <button
              type="button"
              onClick={() => setIsZonesSectionOpen(true)}
              className="w-full text-left p-3 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-all duration-300 cursor-pointer flex items-center gap-2 animate-in fade-in-0 zoom-in-95"
              aria-label="Expandir zonas de personalización"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                {selectedZones.map(zone => {
                  const zoneLabels: Record<string, string> = {
                    'frontal': 'Frontal',
                    'espalda': 'Espalda',
                    'manga_izquierda': 'Manga Izq.',
                    'manga_derecha': 'Manga Der.'
                  };
                  return zoneLabels[zone] || zone;
                }).join(', ')}
              </p>
            </button>
          )}

          {/* Contenido expandido */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isZonesSectionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ZoneSelector
              availableZones={(
                pricingData.zonas_permitidas || ['frontal', 'espalda']
              ).map(zoneId => {
                const zoneLabels: Record<string, string> = {
                  'frontal': 'Frontal',
                  'espalda': 'Espalda',
                  'manga_izquierda': 'Manga Izq.',
                  'manga_derecha': 'Manga Der.'
                };
                return {
                  id: zoneId,
                  name: zoneId,
                  label: zoneLabels[zoneId] || zoneId,
                  cost: pricingData.coste_personalizacion[zoneId] || 0
                };
              })}
              selectedZones={selectedZones}
              onZoneChange={toggleZone}
              disabled={!hasSelectedColor}
            />
          </div>
        </div>
      )}

      {/* 5. Calculadora de Precios */}
      {isReadyForPricing && pricingData?.cantidad_minima && totalQuantity >= pricingData.cantidad_minima && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500 delay-200 sm:p-6">
          <PriceCalculator
            priceCalculation={priceCalculation}
            selectedColor={selectedColor}
            isValid={isValid}
            isCalculating={isCalculating}
            quantities={quantities}
            selectedZones={selectedZones}
            selectedPrintingMethod={selectedPrintingMethod}
            pricingData={pricingData}
            regularPrice={typeof product?.price === 'number' ? product.price : parseFloat(product?.price as string) || 0}
            deliverySurchargePercent={deliverySurchargePercent}
            deliveryTimeSelector={
              <DeliveryTimeSelector
                key={selectedDeliveryOption}
                categorySlug={categorySlug}
                defaultOption={selectedDeliveryOption}
                onSelect={(option, surchargePercent) => {
                  setDeliverySurchargePercent(surchargePercent);
                  setSelectedDeliveryOption(option);
                }}
              />
            }
            onRequestQuote={() => {
              setIsQuoteModalOpen(true);
              if (onRequestQuote) {
                onRequestQuote({
                  productId: product.id,
                  selectedColor,
                  quantities,
                  selectedZones,
                  priceCalculation,
                  totalQuantity
                });
              }
            }}
          />
        </div>
      )}

      {/* Modal de Solicitud de Presupuesto */}
      {priceCalculation && (
        <QuoteRequestModal
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
});

ProductPricingFlow.displayName = 'ProductPricingFlow';

export default ProductPricingFlow;
