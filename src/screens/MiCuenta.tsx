'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  User, MapPin, ShoppingBag, Heart, Settings, LogOut,
  Package, CreditCard, Truck, ChevronRight, Plus,
  Loader2, Building2, Pencil, Trash2, Star, AlertCircle,
  Clock, CheckCircle2, XCircle, RefreshCw, Eye
} from 'lucide-react';
import { getUserOrders, getOrderDetails, repeatOrder, type Order, type OrderItem } from '@/services/ordersService';
import {
  getUserAddresses, createAddress, updateAddress, deleteAddress,
  type UserAddress, type AddressFormData
} from '@/services/addressService';
import { SPANISH_PROVINCES } from '@/services/checkoutService';
import { toast } from 'sonner';

// ─── Tab types ──────────────────────────────────────────────────
export type TabId = 'resumen' | 'direcciones' | 'pedidos' | 'perfil';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'resumen', label: 'Resumen', icon: User },
  { id: 'direcciones', label: 'Direcciones', icon: MapPin },
  { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
  { id: 'perfil', label: 'Mi Perfil', icon: Settings },
];

// ─── Status helpers ─────────────────────────────────────────────
function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'Pendiente', color: 'bg-amber-100 text-amber-800', icon: Clock };
    case 'processing':
      return { label: 'En proceso', color: 'bg-blue-100 text-blue-800', icon: RefreshCw };
    case 'completed':
      return { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle };
    case 'refunded':
      return { label: 'Reembolsado', color: 'bg-purple-100 text-purple-800', icon: RefreshCw };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-800', icon: Package };
  }
}

function getPaymentMethodLabel(method: string | undefined) {
  if (!method) return 'No especificado';
  switch (method) {
    case 'card': return 'Tarjeta';
    case 'transfer': return 'Transferencia';
    default: return method;
  }
}

// ─── Main Component ─────────────────────────────────────────────
export default function MiCuenta({ initialTab = 'resumen' }: { initialTab?: TabId }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      

      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Mi Cuenta</h1>
            <p className="text-slate-500 mt-1">
              Bienvenido, {user?.email}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}

                {/* Separador */}
                <div className="border-t border-slate-200" />

                <Link href="/mis-favoritos">
                  <button className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 border-l-4 border-transparent">
                    <Heart className="w-4 h-4" />
                    Favoritos
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 border-l-4 border-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'resumen' && <ResumenTab user={user} profile={profile} onNavigate={setActiveTab} />}
              {activeTab === 'direcciones' && <DireccionesTab />}
              {activeTab === 'pedidos' && <PedidosTab />}
              {activeTab === 'perfil' && <PerfilTab />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TAB: Resumen ───────────────────────────────────────────────
function ResumenTab({ user, profile, onNavigate }: { user: any; profile: any; onNavigate: (tab: TabId) => void }) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orders, addrs] = await Promise.all([
        getUserOrders(3),
        getUserAddresses(),
      ]);
      setRecentOrders(orders || []);
      setAddresses(addrs.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const defaultBilling = addresses.find(a => a.is_default_billing);

  return (
    <div className="space-y-6">
      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Datos personales
          </h2>
          <button
            onClick={() => onNavigate('perfil')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Editar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Email</span>
            <p className="font-medium text-slate-900">{user?.email}</p>
          </div>
          {profile && (
            <>
              <div>
                <span className="text-slate-500">Miembro desde</span>
                <p className="font-medium text-slate-900">
                  {format(new Date(profile.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Newsletter</span>
                <p className="font-medium text-slate-900">
                  {profile.is_newsletter_subscribed ? 'Suscrito' : 'No suscrito'}
                </p>
              </div>
              {profile.company_type && (
                <div>
                  <span className="text-slate-500">Tipo de empresa</span>
                  <p className="font-medium text-slate-900 capitalize">{profile.company_type}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dirección predeterminada */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Dirección predeterminada
          </h2>
          <button
            onClick={() => onNavigate('direcciones')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Gestionar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {defaultBilling ? (
          <div className="text-sm text-slate-700">
            <p className="font-medium">{defaultBilling.first_name} {defaultBilling.last_name}</p>
            {defaultBilling.company_name && (
              <p className="text-slate-500">{defaultBilling.company_name} — {defaultBilling.cif}</p>
            )}
            <p>{defaultBilling.address}{defaultBilling.address_line_2 ? `, ${defaultBilling.address_line_2}` : ''}</p>
            <p>{defaultBilling.postal_code} {defaultBilling.city}, {defaultBilling.province}</p>
            <p>{defaultBilling.phone}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-3">No tienes ninguna dirección guardada</p>
            <button
              onClick={() => onNavigate('direcciones')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
            >
              <Plus className="w-4 h-4" /> Añadir dirección
            </button>
          </div>
        )}
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Últimos pedidos
          </h2>
          <button
            onClick={() => onNavigate('pedidos')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map(order => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(order.created_at), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{order.total_with_vat.toFixed(2)} €</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">Aún no has realizado ningún pedido</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/carrito">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Carrito</span>
          </div>
        </Link>
        <Link href="/mis-favoritos">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Favoritos</span>
          </div>
        </Link>
        <Link href="/presupuesto-rapido">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
            <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Presupuesto</span>
          </div>
        </Link>
        <Link href="/contacto">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
            <Truck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Contacto</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── TAB: Direcciones ───────────────────────────────────────────
function DireccionesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const loadAddresses = async () => {
    setLoading(true);
    const { data } = await getUserAddresses();
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return;
    const { error } = await deleteAddress(id);
    if (error) {
      toast.error('Error al eliminar la dirección');
    } else {
      toast.success('Dirección eliminada');
      loadAddresses();
    }
  };

  const handleEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (showForm) {
    return (
      <AddressForm
        address={editingAddress}
        userEmail={user?.email || ''}
        onSuccess={handleFormSuccess}
        onCancel={() => { setShowForm(false); setEditingAddress(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Mis Direcciones</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nueva dirección
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tienes direcciones guardadas</h3>
          <p className="text-slate-500 text-sm mb-6">
            Añade una dirección para agilizar tus próximas compras. Se rellenará automáticamente en el checkout.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Añadir primera dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-xl border border-slate-200 p-5 relative">
              {/* Badges */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {addr.label}
                </span>
                {addr.customer_type === 'empresa' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Empresa
                  </span>
                )}
                {addr.is_default_billing && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Facturación
                  </span>
                )}
                {addr.is_default_shipping && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Envío
                  </span>
                )}
              </div>

              {/* Datos */}
              <div className="text-sm text-slate-700 space-y-0.5">
                <p className="font-semibold text-slate-900">{addr.first_name} {addr.last_name}</p>
                {addr.company_name && <p className="text-slate-500">{addr.company_name} — CIF: {addr.cif}</p>}
                <p>{addr.address}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}</p>
                <p>{addr.postal_code} {addr.city}, {addr.province}</p>
                <p className="text-slate-500">{addr.phone} · {addr.email}</p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Address Form Component ─────────────────────────────────────
function AddressForm({
  address,
  userEmail,
  onSuccess,
  onCancel,
}: {
  address: UserAddress | null;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState<AddressFormData>({
    label: address?.label || 'Principal',
    address_type: address?.address_type || 'both',
    is_default_billing: address?.is_default_billing || false,
    is_default_shipping: address?.is_default_shipping || false,
    customer_type: address?.customer_type || 'particular',
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    email: address?.email || userEmail,
    phone: address?.phone || '',
    company_name: address?.company_name || '',
    cif: address?.cif || '',
    address: address?.address || '',
    address_line_2: address?.address_line_2 || '',
    postal_code: address?.postal_code || '',
    city: address?.city || '',
    province: address?.province || '',
    country: address?.country || 'España',
  });

  const updateField = (field: keyof AddressFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validación básica
    const validationErrors: string[] = [];
    if (!form.label.trim()) validationErrors.push('El nombre de la dirección es obligatorio');
    if (!form.first_name.trim()) validationErrors.push('El nombre es obligatorio');
    if (!form.last_name.trim()) validationErrors.push('Los apellidos son obligatorios');
    if (!form.phone.trim()) validationErrors.push('El teléfono es obligatorio');
    if (!form.address.trim()) validationErrors.push('La dirección es obligatoria');
    if (!form.postal_code.trim() || !/^\d{5}$/.test(form.postal_code)) validationErrors.push('Código postal inválido (5 dígitos)');
    if (!form.city.trim()) validationErrors.push('La ciudad es obligatoria');
    if (!form.province.trim()) validationErrors.push('La provincia es obligatoria');
    if (form.customer_type === 'empresa') {
      if (!form.company_name?.trim()) validationErrors.push('La razón social es obligatoria');
      if (!form.cif?.trim()) validationErrors.push('El CIF/NIF es obligatorio');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      if (address) {
        const { error } = await updateAddress(address.id, form);
        if (error) throw error;
        toast.success('Dirección actualizada');
      } else {
        const { error } = await createAddress(form);
        if (error) throw error;
        toast.success('Dirección guardada');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {address ? 'Editar dirección' : 'Nueva dirección'}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          {errors.map((err, i) => (
            <p key={i} className="text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre de la dirección y tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de la dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={e => updateField('label', e.target.value)}
              placeholder="Ej: Casa, Oficina, Almacén..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de cliente</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                form.customer_type === 'particular' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
                <input type="radio" value="particular" checked={form.customer_type === 'particular'} onChange={() => updateField('customer_type', 'particular')} className="sr-only" />
                <User className="w-4 h-4" /> Particular
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                form.customer_type === 'empresa' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
                <input type="radio" value="empresa" checked={form.customer_type === 'empresa'} onChange={() => updateField('customer_type', 'empresa')} className="sr-only" />
                <Building2 className="w-4 h-4" /> Empresa
              </label>
            </div>
          </div>
        </div>

        {/* Datos de empresa */}
        {form.customer_type === 'empresa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Razón social <span className="text-red-500">*</span></label>
              <input type="text" value={form.company_name || ''} onChange={e => updateField('company_name', e.target.value)} placeholder="Nombre de la empresa" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CIF/NIF <span className="text-red-500">*</span></label>
              <input type="text" value={form.cif || ''} onChange={e => updateField('cif', e.target.value)} placeholder="B12345678" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>
        )}

        {/* Nombre y apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={form.first_name} onChange={e => updateField('first_name', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
            <input type="text" value={form.last_name} onChange={e => updateField('last_name', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>

        {/* Email y teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
            <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+34 600 000 000" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dirección <span className="text-red-500">*</span></label>
          <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Calle, número, piso..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dirección línea 2 <span className="text-slate-400">(opcional)</span></label>
          <input type="text" value={form.address_line_2 || ''} onChange={e => updateField('address_line_2', e.target.value)} placeholder="Escalera, puerta, oficina..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>

        {/* CP, Ciudad, Provincia */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">C.P. <span className="text-red-500">*</span></label>
            <input type="text" value={form.postal_code} onChange={e => updateField('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))} maxLength={5} placeholder="28001" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad <span className="text-red-500">*</span></label>
            <input type="text" value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="Madrid" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Provincia <span className="text-red-500">*</span></label>
            <select value={form.province} onChange={e => updateField('province', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              {SPANISH_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Predeterminada */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default_billing} onChange={e => updateField('is_default_billing', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Dirección de facturación predeterminada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default_shipping} onChange={e => updateField('is_default_shipping', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Dirección de envío predeterminada</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-[2] py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : address ? 'Actualizar dirección' : 'Guardar dirección'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── TAB: Pedidos ───────────────────────────────────────────────
function PedidosTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const [repeating, setRepeating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getUserOrders(50);
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (!orderItems[orderId]) {
      setLoadingItems(orderId);
      const items = await getOrderDetails(orderId);
      setOrderItems(prev => ({ ...prev, [orderId]: items || [] }));
      setLoadingItems(null);
    }
  };

  const handleRepeatOrder = async (orderId: string) => {
    setRepeating(orderId);
    const result = await repeatOrder(orderId);
    if (result) {
      toast.success(`${result.itemsCount} productos añadidos al carrito`);
      router.push('/carrito');
    } else {
      toast.error('Error al repetir el pedido');
    }
    setRepeating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Mis Pedidos</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tienes pedidos todavía</h3>
          <p className="text-slate-500 text-sm mb-6">Cuando realices tu primera compra, aparecerá aquí.</p>
          <Link href="/">
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Explorar productos
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = getStatusConfig(order.status);
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;
            const items = orderItems[order.id];
            const billing = order.billing_address as Record<string, any> | null;

            return (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Header del pedido */}
                <button
                  onClick={() => toggleOrderDetails(order.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{order.order_number}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{order.total_with_vat.toFixed(2)} €</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 bg-slate-50">
                    {loadingItems === order.id ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Info del pedido */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Método de pago</span>
                            <p className="font-medium text-slate-900">
                              {getPaymentMethodLabel((order as any).payment_method)}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">Subtotal (sin IVA)</span>
                            <p className="font-medium text-slate-900">{order.subtotal_without_vat.toFixed(2)} €</p>
                          </div>
                          <div>
                            <span className="text-slate-500">IVA</span>
                            <p className="font-medium text-slate-900">{order.vat_amount.toFixed(2)} €</p>
                          </div>
                        </div>

                        {/* Dirección de facturación */}
                        {billing && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm">
                            <p className="font-medium text-slate-700 mb-1">Dirección de facturación:</p>
                            <p className="text-slate-600">
                              {billing.firstName} {billing.lastName}
                              {billing.companyName && ` — ${billing.companyName}`}
                              {' · '}{billing.address}, {billing.postalCode} {billing.city}
                            </p>
                          </div>
                        )}

                        {/* Items del pedido */}
                        {items && items.length > 0 && (
                          <div>
                            <p className="font-medium text-slate-700 text-sm mb-2">Productos:</p>
                            <div className="space-y-2">
                              {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm">
                                  <div>
                                    <Link href={`/producto/${item.product_slug}`}>
                                      <span className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                                        {item.product_name}
                                      </span>
                                    </Link>
                                    <p className="text-slate-500">
                                      {item.quantity} x {item.unit_price_with_vat.toFixed(2)} €
                                    </p>
                                  </div>
                                  <span className="font-bold text-slate-900">{item.total_with_vat.toFixed(2)} €</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notas */}
                        {order.notes && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                            <p className="font-medium text-amber-800">Notas: {order.notes}</p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleRepeatOrder(order.id)}
                            disabled={repeating === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {repeating === order.id ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Añadiendo...</>
                            ) : (
                              <><RefreshCw className="w-4 h-4" /> Repetir pedido</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB: Perfil ────────────────────────────────────────────────
function PerfilTab() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Mi Perfil</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-600 mb-4">
          Gestiona tu información personal, preferencias de empresa y contraseña.
        </p>
        <button
          onClick={() => router.push('/mi-perfil')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Settings className="w-4 h-4" /> Editar perfil completo
        </button>
      </div>
    </div>
  );
}
