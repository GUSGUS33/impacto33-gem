import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  CreditCard, Loader2, ArrowLeft, Building2, User, Truck,
  ShieldCheck, Lock, ChevronDown, ChevronUp, Banknote, AlertCircle,
  Package, MapPin
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import {
  type BillingData,
  type ShippingData,
  type PaymentMethod,
  type CustomerType,
  type CheckoutData,
  SPANISH_PROVINCES,
  createOrder,
  validateBillingData,
  validateShippingData,
} from '@/services/checkoutService';
import {
  getDefaultBillingAddress,
  getDefaultShippingAddress,
  saveAddressFromOrder,
  getUserAddresses,
  type UserAddress,
} from '@/services/addressService';

// ─── Stepper visual ─────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Datos de facturación', icon: User },
  { id: 2, label: 'Dirección de envío', icon: Truck },
  { id: 3, label: 'Método de pago', icon: CreditCard },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? '✓' : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs mt-2 text-center hidden sm:block ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, items, loading, reload } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Billing
  const [billing, setBilling] = useState<BillingData>({
    customerType: 'particular',
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    companyName: '',
    cif: '',
    address: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    province: '',
    country: 'España',
  });

  // Shipping
  const [shipping, setShipping] = useState<ShippingData>({
    sameAsBilling: true,
    firstName: '',
    lastName: '',
    address: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    province: '',
    country: 'España',
    phone: '',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Mobile order summary toggle
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Pre-rellenar con dirección guardada o datos del usuario
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (prefilled) return;
    async function prefillFromSavedAddress() {
      try {
        const defaultBilling = await getDefaultBillingAddress();
        if (defaultBilling) {
          setBilling({
            customerType: defaultBilling.customer_type as CustomerType,
            firstName: defaultBilling.first_name,
            lastName: defaultBilling.last_name,
            email: defaultBilling.email || user?.email || '',
            phone: defaultBilling.phone,
            companyName: defaultBilling.company_name || '',
            cif: defaultBilling.cif || '',
            address: defaultBilling.address,
            addressLine2: defaultBilling.address_line_2 || '',
            postalCode: defaultBilling.postal_code,
            city: defaultBilling.city,
            province: defaultBilling.province,
            country: defaultBilling.country || 'España',
          });

          const defaultShipping = await getDefaultShippingAddress();
          if (defaultShipping && defaultShipping.id !== defaultBilling.id) {
            setShipping({
              sameAsBilling: false,
              firstName: defaultShipping.first_name,
              lastName: defaultShipping.last_name,
              address: defaultShipping.address,
              addressLine2: defaultShipping.address_line_2 || '',
              postalCode: defaultShipping.postal_code,
              city: defaultShipping.city,
              province: defaultShipping.province,
              country: defaultShipping.country || 'España',
              phone: defaultShipping.phone,
            });
          }
          setPrefilled(true);
          return;
        }

        // Fallback: si no hay dirección guardada, al menos rellenar email
        if (user?.email) {
          setBilling(prev => ({ ...prev, email: user.email || '' }));
        }
        setPrefilled(true);
      } catch (err) {
        console.error('[Checkout] Error prefilling:', err);
        if (user?.email) {
          setBilling(prev => ({ ...prev, email: user.email || '' }));
        }
        setPrefilled(true);
      }
    }
    prefillFromSavedAddress();
  }, [user, prefilled]);

  // ─── Handlers ─────────────────────────────────────────────────
  const updateBilling = (field: keyof BillingData, value: string) => {
    setBilling(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const updateShipping = (field: keyof ShippingData, value: string | boolean) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleNextStep = () => {
    setErrors([]);

    if (currentStep === 1) {
      const billingErrors = validateBillingData(billing);
      if (billingErrors.length > 0) {
        setErrors(billingErrors);
        return;
      }
    }

    if (currentStep === 2) {
      const shippingErrors = validateShippingData(shipping);
      if (shippingErrors.length > 0) {
        setErrors(shippingErrors);
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setErrors([]);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!cart || items.length === 0) return;

    if (!acceptTerms) {
      setErrors(['Debes aceptar los términos y condiciones para continuar.']);
      return;
    }

    setProcessing(true);
    setErrors([]);

    const checkoutData: CheckoutData = {
      billing,
      shipping,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    const result = await createOrder(cart, items, checkoutData);

    if (result.success && result.orderId && result.orderNumber) {
      // Guardar dirección automáticamente si es nueva
      try {
        const { data: existingAddresses } = await getUserAddresses();
        const isFirstOrder = !existingAddresses || existingAddresses.length === 0;
        await saveAddressFromOrder(billing, isFirstOrder);
      } catch (err) {
        console.error('[Checkout] Error saving address:', err);
      }

      // Recargar carrito (ahora estará vacío porque se convirtió)
      await reload();

      // Redirigir según método de pago
      if (paymentMethod === 'transfer') {
        navigate(`/pedido-confirmado/transferencia?order=${result.orderNumber}`);
      } else {
        navigate(`/pedido-confirmado/tarjeta?order=${result.orderNumber}`);
      }
    } else {
      setErrors([result.error || 'Error al procesar el pedido.']);
      setProcessing(false);
    }
  };

  // ─── Loading / Empty states ───────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        
        <div className="min-h-screen bg-slate-50">
          <div className="container mx-auto py-16 px-4 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Tu carrito está vacío</h1>
            <p className="text-slate-500 mb-6">Añade productos antes de continuar con la compra.</p>
            <Link href="/">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Ir a la tienda
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const subtotal = cart?.subtotal_without_vat || 0;
  const vat = cart?.vat_amount || 0;
  const total = cart?.total_with_vat || 0;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      

      <div className="min-h-screen bg-slate-50">
        {/* Header compacto */}
        <div className="bg-white border-b border-slate-200 py-4 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/carrito">
              <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Volver al carrito
              </button>
            </Link>
            <div className="flex items-center gap-2 text-slate-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Compra segura</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 md:py-10 px-4">
          {/* Mobile: Resumen desplegable */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="w-full bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">
                  Tu pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-600">{total.toFixed(2)} €</span>
                {showMobileSummary ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>
            {showMobileSummary && (
              <OrderSummaryContent items={items} subtotal={subtotal} vat={vat} total={total} />
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── COLUMNA IZQUIERDA: Formulario ─────────────── */}
            <div className="flex-1 min-w-0">
              <StepIndicator currentStep={currentStep} />

              {/* Errores */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      {errors.map((err, i) => (
                        <p key={i} className="text-red-700 text-sm">{err}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Datos de facturación */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Datos de facturación
                  </h2>

                  {/* Selector empresa / particular */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button
                      type="button"
                      onClick={() => updateBilling('customerType', 'particular')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        billing.customerType === 'particular'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-semibold">Particular</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBilling('customerType', 'empresa')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        billing.customerType === 'empresa'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="font-semibold">Empresa</span>
                    </button>
                  </div>

                  {/* Campos de empresa */}
                  {billing.customerType === 'empresa' && (
                    <div className="bg-blue-50 rounded-lg p-5 mb-6 space-y-4">
                      <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Datos de la empresa
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Razón social <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={billing.companyName || ''}
                            onChange={e => updateBilling('companyName', e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            CIF / NIF <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={billing.cif || ''}
                            onChange={e => updateBilling('cif', e.target.value.toUpperCase())}
                            placeholder="B12345678"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Datos personales */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={billing.firstName}
                          onChange={e => updateBilling('firstName', e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={billing.lastName}
                          onChange={e => updateBilling('lastName', e.target.value)}
                          placeholder="Tus apellidos"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={billing.email}
                          onChange={e => updateBilling('email', e.target.value)}
                          placeholder="tu@email.com"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={billing.phone}
                          onChange={e => updateBilling('phone', e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Dirección de facturación */}
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Dirección de facturación
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.address}
                        onChange={e => updateBilling('address', e.target.value)}
                        placeholder="Calle, número, piso..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Dirección línea 2 <span className="text-slate-400">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={billing.addressLine2 || ''}
                        onChange={e => updateBilling('addressLine2', e.target.value)}
                        placeholder="Escalera, puerta, oficina..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          C.P. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={billing.postalCode}
                          onChange={e => updateBilling('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                          placeholder="28001"
                          maxLength={5}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={billing.city}
                          onChange={e => updateBilling('city', e.target.value)}
                          placeholder="Madrid"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Provincia <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={billing.province}
                          onChange={e => updateBilling('province', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {SPANISH_PROVINCES.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botón continuar */}
                  <div className="mt-8">
                    <button
                      onClick={handleNextStep}
                      className="w-full py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base flex items-center justify-center gap-2"
                    >
                      Continuar a envío
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Dirección de envío */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Dirección de envío
                  </h2>

                  {/* Toggle misma dirección */}
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg mb-6 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={shipping.sameAsBilling}
                      onChange={e => updateShipping('sameAsBilling', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Misma dirección que facturación</span>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {billing.address}, {billing.postalCode} {billing.city}
                      </p>
                    </div>
                  </label>

                  {/* Formulario de envío diferente */}
                  {!shipping.sameAsBilling && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shipping.firstName || ''}
                            onChange={e => updateShipping('firstName', e.target.value)}
                            placeholder="Nombre del destinatario"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Apellidos <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shipping.lastName || ''}
                            onChange={e => updateShipping('lastName', e.target.value)}
                            placeholder="Apellidos del destinatario"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Dirección <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shipping.address || ''}
                          onChange={e => updateShipping('address', e.target.value)}
                          placeholder="Calle, número, piso..."
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Dirección línea 2 <span className="text-slate-400">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={shipping.addressLine2 || ''}
                          onChange={e => updateShipping('addressLine2', e.target.value)}
                          placeholder="Escalera, puerta, oficina..."
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            C.P. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shipping.postalCode || ''}
                            onChange={e => updateShipping('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                            placeholder="28001"
                            maxLength={5}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ciudad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shipping.city || ''}
                            onChange={e => updateShipping('city', e.target.value)}
                            placeholder="Madrid"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Provincia <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={shipping.province || ''}
                            onChange={e => updateShipping('province', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                          >
                            <option value="">Seleccionar...</option>
                            {SPANISH_PROVINCES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Teléfono de contacto <span className="text-slate-400">(opcional)</span>
                        </label>
                        <input
                          type="tel"
                          value={shipping.phone || ''}
                          onChange={e => updateShipping('phone', e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botones navegación */}
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Atrás
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-[2] py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      Continuar al pago
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Método de pago */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Método de pago
                  </h2>

                  {/* Opciones de pago */}
                  <div className="space-y-3 mb-6">
                    {/* Tarjeta */}
                    <label
                      className={`flex items-start gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-900">Tarjeta de crédito / débito</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Pago seguro con Visa, Mastercard o American Express. Procesado por Stripe.
                        </p>
                        {paymentMethod === 'card' && (
                          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              El pago con tarjeta se activará próximamente. Tu pedido quedará registrado y te contactaremos para completar el pago.
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Transferencia */}
                    <label
                      className={`flex items-start gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === 'transfer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-slate-900">Transferencia bancaria</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Realiza una transferencia a nuestra cuenta. Te enviaremos los datos tras confirmar el pedido.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Notas del pedido */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notas del pedido <span className="text-slate-400">(opcional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Instrucciones especiales, horario de entrega preferido, etc."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Aceptar términos */}
                  <label className="flex items-start gap-3 mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={e => {
                        setAcceptTerms(e.target.checked);
                        setErrors([]);
                      }}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">
                      He leído y acepto las{' '}
                      <Link href="/condiciones-generales" className="text-blue-600 hover:underline">
                        condiciones generales de uso
                      </Link>{' '}
                      y la{' '}
                      <Link href="/politica-privacidad" className="text-blue-600 hover:underline">
                        política de privacidad
                      </Link>
                      .
                    </span>
                  </label>

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Atrás
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={processing}
                      className="flex-[2] py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Procesando pedido...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          Confirmar pedido — {total.toFixed(2)} €
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ─── COLUMNA DERECHA: Resumen lateral (desktop) ──── */}
            <div className="hidden lg:block w-[380px] flex-shrink-0">
              <div className="sticky top-6">
                <OrderSummaryContent items={items} subtotal={subtotal} vat={vat} total={total} />

                {/* Garantías */}
                <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Compra 100% segura y protegida</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span>Envío a toda España</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Package className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span>Garantía de calidad en todos los productos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Componente de resumen de pedido reutilizable ────────────────
function OrderSummaryContent({
  items,
  subtotal,
  vat,
  total,
}: {
  items: { id: string; product_name: string; product_slug: string; quantity: number; unit_price_with_vat: number; total_with_vat: number }[];
  subtotal: number;
  vat: number;
  total: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        Resumen del pedido
      </h3>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-start text-sm">
            <div className="flex-1 min-w-0 pr-3">
              <p className="font-medium text-slate-900 truncate">{item.product_name}</p>
              <p className="text-slate-500">
                {item.quantity} x {item.unit_price_with_vat.toFixed(2)} €
              </p>
            </div>
            <span className="font-semibold text-slate-900 whitespace-nowrap">
              {item.total_with_vat.toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal (sin IVA)</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>IVA (21%)</span>
          <span>{vat.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Envío</span>
          <span className="text-green-600 font-medium">A consultar</span>
        </div>
        <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-bold text-slate-900">
          <span>Total</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}
