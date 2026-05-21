import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "alt"> {
  alt: string; // Hacer el alt mandatorio para accesibilidad
  containerClassName?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  containerClassName,
  priority = false, // Solo priority si se pasa explicitamente
  fill = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw", // Responsive por defecto
  ...props 
}: OptimizedImageProps) {

  // Si usamos fill, necesitamos un contenedor con relativa
  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <Image
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", className)}
          loading={priority ? undefined : "lazy"}
          {...props}
        />
      </div>
    );
  }

  // Comportamiento normal con width/height
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
      loading={priority ? undefined : "lazy"}
      {...props}
    />
  );
}
