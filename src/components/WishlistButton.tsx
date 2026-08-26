import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleWishlistProduct } from '@/services/wishlistService';

interface WishlistButtonProps {
  productId: number;
  productSlug: string;
  isInWishlist: boolean;
  onToggle?: (isInWishlist: boolean) => void;
  className?: string;
}

export function WishlistButton({
  productId,
  productSlug,
  isInWishlist,
  onToggle,
  className = '',
}: WishlistButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    setLoading(true);
    const result = await toggleWishlistProduct(productId, productSlug);
    setLoading(false);

    if (result !== null && onToggle) {
      onToggle(result);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${
        isInWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isInWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
    >
      <Heart
        size={20}
        className={isInWishlist ? 'fill-current' : ''}
      />
    </button>
  );
}
