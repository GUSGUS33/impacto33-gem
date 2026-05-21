import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyBlockProps {
  children: React.ReactNode;
  /** Altura mínima del skeleton mientras carga (en px) */
  minHeight?: number;
  /** Mostrar skeleton o nada mientras carga */
  showSkeleton?: boolean;
  /** Threshold del IntersectionObserver (0-1) */
  threshold?: number;
  /** Margen antes de cargar (ej: '100px') */
  rootMargin?: string;
}

/**
 * Wrapper para lazy loading de bloques pesados
 * Solo renderiza el contenido cuando entra en el viewport
 * 
 * @example
 * <LazyBlock minHeight={400} showSkeleton>
 *   <GaleriaBlock data={data} />
 * </LazyBlock>
 */
export function LazyBlock({
  children,
  minHeight = 300,
  showSkeleton = true,
  threshold = 0.1,
  rootMargin = '100px',
}: LazyBlockProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div ref={ref as any} style={{ minHeight: isVisible ? 'auto' : `${minHeight}px` }}>
      {isVisible ? (
        children
      ) : showSkeleton ? (
        <div className="space-y-4 py-8">
          <Skeleton className="h-8 w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
