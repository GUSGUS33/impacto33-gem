import { useEffect, useState } from 'react';
import { Order, getUserOrders } from '@/services/ordersService';
import { useAuth } from '@/context/AuthContext';

export function useUserOrders(limit = 20) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUserOrders(limit);
        if (result === null) {
          setError('No pudimos cargar tus pedidos. Intenta de nuevo más tarde.');
          setOrders([]);
        } else {
          setOrders(result);
        }
      } catch (err) {
        console.error('[useUserOrders] Error:', err);
        setError('Error al cargar los pedidos');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, limit]);

  return { orders, isLoading, error };
}
