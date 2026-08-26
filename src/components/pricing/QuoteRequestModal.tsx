import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Product } from "@shared/types";
import { PriceCalculationResult } from '../../hooks/usePriceCalculation';
import { useQuote } from '../../contexts/QuoteContext';
import { DeliveryTimeSelector } from './DeliveryTimeSelector';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedColor: string;
  selectedColorVariations: any[];
  quantities: Record<string, number>;
  priceCalculation: PriceCalculationResult;
  selectedZones: string[];
  selectedPrintingMethod?: string;
  deliverySurchargePercent?: number;
  selectedDeliveryOption?: 'sin_prisa' | 'normal' | 'urgente';
  categorySlug: string;
  onDeliveryOptionChange?: (option: 'sin_prisa' | 'normal' | 'urgente', surchargePercent: number) => void;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor,
  selectedColorVariations,
  quantities,
  priceCalculation,
  selectedZones,
  selectedPrintingMethod = 'DTF',
  deliverySurchargePercent = 0,
  selectedDeliveryOption = 'sin_prisa',
  categorySlug,
  onDeliveryOptionChange
}) => {
  const { submitQuote } = useQuote();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitQuote({
        customer: formData,
        product: {
          id: product.id,
          name: product.name,
          sku: '',
          image: product.featuredImage?.node?.sourceUrl || '',
          selectedColor,
          quantities,
          selectedZones
        },
        pricing: priceCalculation
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      }, 4000);
    } catch (err) {
      setError('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener imagen del color seleccionado
  const colorImage = selectedColorVariations[0]?.image?.sourceUrl || product.featuredImage?.node?.sourceUrl;

  // Función para obtener nombre del método de impresión
  const getPrintingMethodName = (method: string) => {
    switch(method) {
      case 'DTF':
        return '🖨️ DTF Full Color';
      case 'SERIGRAFIA':
        return '🎨 Serigrafía';
      case 'BORDADO':
        return '✨ Bordado';
      case 'SUBLIMACION':
        return '🌈 Sublimación';
      case 'VINILO':
        return '🎯 Vinilo';
      case 'SIN_IMPRESION':
        return '👕 Solo prenda';
      default:
        return method;
    }
  };

  return (
    <Dialog key={selectedDeliveryOption} open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="w-full max-w-full sm:max-w-2xl lg:max-w-7xl h-[95vh] p-0 gap-0 rounded-lg sm:rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold line-clamp-1">Resumen de tu Presupuesto</h2>
            <p className="text-blue-100 mt-1 text-xs sm:text-sm lg:text-base line-clamp-1">Revisa los detalles de tu solicitud</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
          
          {/* Columna Izquierda: Formulario de Contacto */}
          <div className="bg-white flex flex-col hidden lg:flex overflow-hidden lg:border-r border-slate-200">
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                
                {/* Producto */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Producto</h3>
                  <div className="flex gap-3 sm:gap-5 items-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden border-2 border-slate-200 bg-white shrink-0">
                      <img 
                        src={colorImage} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 line-clamp-2">{product.name}</h4>
                      <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <p className="text-slate-600">
                          <span className="font-medium text-slate-900">Color:</span> <span className="capitalize font-semibold text-blue-600">{selectedColor}</span>
                        </p>
                        <p className="text-slate-600">
                          <span className="font-medium text-slate-900">Ref:</span> {product.id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desglose de Cantidades */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Desglose por Talla</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(quantities).map(([size, qty]) => {
                      if (qty <= 0) return null;
                      const unitPrice = priceCalculation.precioUnitarioFinal;
                      const total = qty * unitPrice;
                      return (
                        <div key={size} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="font-medium text-xs sm:text-sm text-slate-900">Talla {size}</span>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm text-slate-600">{qty} uds. × {unitPrice.toFixed(2)}€</p>
                            <p className="font-bold text-sm sm:text-base text-blue-600">{total.toFixed(2)}€</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personalización - Panel Agrupador */}
                {(selectedZones.length > 0 || selectedPrintingMethod) && (
                  <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-l-blue-600 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Personalización
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Método de Impresión */}
                      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                        <p className="text-xs sm:text-sm text-slate-900">
                          <span className="font-medium text-slate-700">Método:</span> <span className="text-blue-600 font-semibold ml-2">{getPrintingMethodName(selectedPrintingMethod)}</span>
                        </p>
                      </div>
                      
                      {/* Zonas */}
                      {selectedZones.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                          <p className="text-xs sm:text-sm text-slate-900">
                            <span className="font-medium text-slate-700">Zonas:</span> <span className="text-blue-600 font-semibold ml-2">{selectedZones.map(zone => {
                              const zoneLabels: Record<string, string> = {
                                'frontal': 'frontal',
                                'espalda': 'espalda',
                                'manga_izquierda': 'manga_izquierda',
                                'manga_derecha': 'manga_derecha'
                              };
                              return zoneLabels[zone] || zone;
                            }).join(', ')}</span>
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-500 italic">Incluido en el precio final</p>
                    </div>
                  </div>
                )}

                {/* Selector de Tiempo de Entrega */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                  <DeliveryTimeSelector
                    key={selectedDeliveryOption}
                    categorySlug={categorySlug}
                    onSelect={(option, surchargePercent) => {
                      onDeliveryOptionChange?.(option, surchargePercent);
                    }}
                    defaultOption={selectedDeliveryOption}
                  />
                </div>

                {/* Totales */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-blue-200 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200 gap-2">
                    <span className="text-xs sm:text-sm text-slate-700">Subtotal</span>
                    <span className="font-semibold text-sm sm:text-base text-slate-900">{priceCalculation.precioTotalSinIVA.toFixed(2)}€</span>
                  </div>
                  {deliverySurchargePercent > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-blue-200 gap-2">
                      <span className="text-xs sm:text-sm text-slate-700">Recargo entrega ({deliverySurchargePercent}%)</span>
                      <span className="font-semibold text-sm sm:text-base text-slate-900">{((priceCalculation.precioTotalSinIVA * deliverySurchargePercent) / 100).toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-blue-200 gap-2">
                    <span className="text-xs sm:text-sm text-slate-700">IVA (21%)</span>
                    <span className="font-semibold text-sm sm:text-base text-slate-900">{(((priceCalculation.precioTotalSinIVA * (1 + deliverySurchargePercent / 100)) * 1.21) - (priceCalculation.precioTotalSinIVA * (1 + deliverySurchargePercent / 100))).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 gap-2">
                    <span className="text-base sm:text-lg font-bold text-slate-900">TOTAL</span>
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">{((priceCalculation.precioTotalSinIVA * (1 + deliverySurchargePercent / 100)) * 1.21).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Columna Derecha: Resumen del Pedido */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex flex-col">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full p-6 lg:p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">¡Solicitud Enviada!</h3>
                  <p className="text-slate-600 mt-3 text-sm lg:text-base">
                    Hemos recibido tu solicitud correctamente. Te enviaremos el presupuesto detallado a <strong className="text-blue-600">{formData.email}</strong> en menos de 24 horas.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 w-full">
                  <p className="text-xs lg:text-sm text-slate-600">
                    <span className="font-semibold text-blue-600">💡 Tip:</span> Revisa tu carpeta de spam si no ves el correo en los próximos minutos.
                  </p>
                </div>
                <p className="text-xs text-slate-500 animate-pulse">Esta ventana se cerrará automáticamente...</p>
              </div>
            ) : (
              <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-hidden flex flex-col">
                <div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Datos de Contacto</h3>
                    <p className="text-slate-600 mt-2 text-sm">Completa el formulario para recibir tu presupuesto</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-900">
                        Nombre completo *
                      </Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tu nombre completo"
                        className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-900">
                        Email *
                      </Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-semibold text-slate-900">
                        Empresa
                      </Label>
                      <Input 
                        id="company" 
                        name="company" 
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nombre de tu empresa"
                        className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-900">
                        Teléfono
                      </Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+34 690 90 60 27"
                        className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Mensaje */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-slate-900">
                        Mensaje (Opcional)
                      </Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Cuéntanos más detalles sobre tu proyecto..."
                        className="min-h-32 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Solicitud
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-xs text-slate-500">
                    Nos comprometemos a proteger tu privacidad. <strong>Nunca</strong> compartiremos tus datos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Formulario debajo en móvil - Sin limitación de altura */}
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 sm:p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 mt-2 text-xs">
                  Te enviaremos el presupuesto a <strong className="text-blue-600">{formData.email}</strong>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-mobile" className="text-xs font-semibold text-slate-900">
                  Nombre *
                </Label>
                <Input 
                  id="name-mobile" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-mobile" className="text-xs font-semibold text-slate-900">
                  Email *
                </Label>
                <Input 
                  id="email-mobile" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className="h-10 text-sm"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
