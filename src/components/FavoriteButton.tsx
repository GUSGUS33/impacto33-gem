import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { toggleWishlistProduct, isProductInWishlist } from '@/services/wishlistService';
import { toast } from 'sonner';
import { useNotification } from '@/hooks/useNotification';

interface FavoriteButtonProps {
  productId: number;
  productSlug: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({
  productId,
  productSlug,
  size = 'md',
  className = '',
  showLabel = false,
}: FavoriteButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { success, info, error } = useNotification();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Verificar si el producto está en favoritos al cargar
  useEffect(() => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    const checkFavorite = async () => {
      setIsChecking(true);
      try {
        const inWishlist = await isProductInWishlist(productId);
        setIsFavorite(inWishlist);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavorite();
  }, [productId, user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si no está autenticado, redirigir a login
    if (!user) {
      error('Debes iniciar sesión para agregar favoritos');
      setLocation('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleWishlistProduct(productId, productSlug);

      if (result === null) {
        error('Error al actualizar favoritos');
        return;
      }

      setIsFavorite(result);

      if (result) {
        success('Agregado a favoritos');
      } else {
        info('Eliminado de favoritos');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      error('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  // Tamaños de icono
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const iconSize = sizeMap[size];

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || isChecking || authLoading}
      className={`
        relative inline-flex items-center justify-center gap-2
        bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-slate-100
        transition-all duration-200 ease-in-out
        ${isLoading || isChecking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-md'}
        ${className}
      `}
      title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        size={iconSize}
        className={`
          transition-all duration-300
          ${isFavorite
            ? 'fill-red-500 stroke-red-500'
            : 'stroke-slate-600 hover:stroke-red-500 fill-none'
          }
        `}
      />
      {showLabel && (
        <span className={`text-sm font-medium pr-1 ${isFavorite ? 'text-red-500' : 'text-slate-700'}`}>
          {isFavorite ? 'Favorito' : 'Favorito'}
        </span>
      )}
    </button>
  );
}
