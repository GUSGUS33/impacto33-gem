import { useEffect, useState, useCallback } from 'react';
import {
  getOrCreateActiveCartForUser,
  getCartWithItems,
  addItem as addItemToCart,
  updateItemQuantity as updateItemQuantityService,
  removeItem as removeItemFromCart,
  clearCart as clearCartFromDB,
  Cart,
  CartItem,
} from '@/services/cartService';
import { useAuth } from '@/context/AuthContext';

interface UseCartState {
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook que gestiona el carrito del usuario autenticado
 * Proporciona funciones para agregar, actualizar y eliminar items
 */
export function useCart() {
  const { user } = useAuth();
  const [state, setState] = useState<UseCartState>({
    cart: null,
    items: [],
    loading: false,
    error: null,
  });

  // Cargar carrito al autenticar
  useEffect(() => {
    if (!user) {
      setState({
        cart: null,
        items: [],
        loading: false,
        error: null,
      });
      return;
    }

    loadCart();
  }, [user]);

  const loadCart = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const cart = await getOrCreateActiveCartForUser();
      if (!cart) {
        throw new Error('No se pudo obtener el carrito');
      }

      const cartData = await getCartWithItems(cart.id);
      if (!cartData) {
        throw new Error('No se pudo obtener los items del carrito');
      }

      setState({
        cart: cartData.cart,
        items: cartData.items,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useCart] Error cargando carrito:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Error desconocido'),
      }));
    }
  }, []);

  const addItem = useCallback(
    async (
      productId: number,
      productName: string,
      productSlug: string,
      quantity: number,
      unitPriceWithVat: number,
      variationId?: number | null
    ) => {
      if (!state.cart) return false;

      try {
        const result = await addItemToCart({
          cartId: state.cart.id,
          productId,
          productName,
          productSlug,
          quantity,
          unitPriceWithVat,
          variationId,
        });

        if (result) {
          await loadCart(); // Recargar carrito para actualizar UI
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useCart.addItem] Error:', err);
        return false;
      }
    },
    [state.cart, loadCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      try {
        const result = await updateItemQuantityService(cartItemId, newQuantity);
        if (result || newQuantity <= 0) {
          await loadCart(); // Recargar carrito
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useCart.updateQuantity] Error:', err);
        return false;
      }
    },
    [loadCart]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      try {
        const result = await removeItemFromCart(cartItemId);
        if (result) {
          await loadCart(); // Recargar carrito
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useCart.removeItem] Error:', err);
        return false;
      }
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    if (!state.cart) return false;

    try {
      const result = await clearCartFromDB(state.cart.id);
      if (result) {
        await loadCart(); // Recargar carrito
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useCart.clearCart] Error:', err);
      return false;
    }
  }, [state.cart, loadCart]);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart: state.cart,
    items: state.items,
    loading: state.loading,
    error: state.error,
    itemCount,
    isEmpty: state.items.length === 0,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    reload: loadCart,
  };
}
