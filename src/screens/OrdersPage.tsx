'use client';

import { useState } from 'react';
import { useUserOrders } from '@/hooks/useUserOrders';
import { Order, OrderItem, getOrderDetails, repeatOrder } from '@/services/ordersService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { orders, isLoading, error } = useUserOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, OrderItem[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [repeatingOrderId, setRepeatingOrderId] = useState<string | null>(null);
  const router = useRouter();

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    // Si ya tenemos los detalles en caché, solo expandir
    if (orderDetails[orderId]) {
      setExpandedOrderId(orderId);
      return;
    }

    // Cargar detalles si no los tenemos
    setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));
    try {
      const details = await getOrderDetails(orderId);
      if (details) {
        setOrderDetails((prev) => ({ ...prev, [orderId]: details }));
        setExpandedOrderId(orderId);
      } else {
        toast.error('No pudimos cargar los detalles del pedido');
      }
    } catch (err) {
      console.error('[OrdersPage] Error loading details:', err);
      toast.error('Error al cargar los detalles');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleRepeatOrder = async (orderId: string) => {
    setRepeatingOrderId(orderId);
    try {
      const result = await repeatOrder(orderId);
      if (result) {
        toast.success(`Pedido repetido: ${result.itemsCount} artículos añadidos al carrito`);
        // Redirigir al carrito
        router.push('/carrito');
      } else {
        toast.error('No pudimos repetir tu pedido. Intenta de nuevo más tarde.');
      }
    } catch (err) {
      console.error('[OrdersPage] Error repeating order:', err);
      toast.error('Error al repetir el pedido');
    } finally {
      setRepeatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-foreground">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground">Historial de tus compras y opción de repetir pedidos</p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {orders.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-muted-foreground mb-4">
                <RotateCcw className="w-12 h-12 mx-auto opacity-50 mb-4" />
                <p className="text-lg font-medium mb-2">No tienes pedidos aún</p>
                <p className="text-sm">Cuando realices tu primera compra, aparecerá aquí</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              {/* Order Header - Always Visible */}
              <div
                className="p-4 md:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleExpandOrder(order.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Pedido #{order.order_number}
                      </h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-foreground">
                      {order.total_with_vat.toFixed(2)} {order.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {orderDetails[order.id]?.length || '?'} artículos
                    </p>
                  </div>

                  <button className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors">
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Details - Expandable */}
              {expandedOrderId === order.id && (
                <div className="border-t bg-muted/30 p-4 md:p-6">
                  {loadingDetails[order.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : orderDetails[order.id] && orderDetails[order.id].length > 0 ? (
                    <div className="space-y-4">
                      {/* Items List */}
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-foreground">Artículos:</h4>
                        {orderDetails[order.id].map((item) => (
                          <div key={item.id} className="flex items-start justify-between bg-background p-3 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{item.product_name}</p>
                              {item.variation_id && (
                                <p className="text-sm text-muted-foreground">Variación ID: {item.variation_id}</p>
                              )}
                              <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-foreground">
                                {item.total_with_vat.toFixed(2)} {order.currency}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.unit_price_with_vat.toFixed(2)} c/u
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-medium">
                            {order.subtotal_without_vat.toFixed(2)} {order.currency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">IVA (21%):</span>
                          <span className="font-medium">
                            {order.vat_amount.toFixed(2)} {order.currency}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>
                            {order.total_with_vat.toFixed(2)} {order.currency}
                          </span>
                        </div>
                      </div>

                      {/* Repeat Order Button */}
                      <Button
                        onClick={() => handleRepeatOrder(order.id)}
                        disabled={repeatingOrderId === order.id}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        {repeatingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Repitiendo...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Repetir Pedido
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No hay artículos en este pedido</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
