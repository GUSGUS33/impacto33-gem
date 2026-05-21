import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Útil para lazy loading de componentes pesados
 * 
 * @param options - Opciones del IntersectionObserver
 * @returns [ref, isVisible] - Ref para el elemento y estado de visibilidad
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T | null>, boolean] {
  const {
    threshold = 0,
    rootMargin = '50px', // Cargar 50px antes de entrar en viewport
    triggerOnce = true,
  } = options;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Si ya es visible y triggerOnce está activo, no crear observer
    if (isVisible && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Si triggerOnce está activo, desconectar después de la primera vez
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, isVisible]);

  return [ref, isVisible];
}
