import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceHtml: string | undefined | null): string {
  if (!priceHtml) return '';
  
  // Si el precio viene como rango "X - Y", WooCommerce a veces devuelve HTML con &nbsp;
  // Limpiamos etiquetas HTML y entidades
  const cleanText = priceHtml
    .replace(/<[^>]*>/g, '') // Eliminar tags HTML
    .replace(/&nbsp;/g, ' ') // Reemplazar espacio no rompible
    .replace(/&#038;/g, '&') // Reemplazar ampersand
    .replace(/&#8364;/g, '€'); // Reemplazar símbolo euro si viene codificado

  return cleanText.trim();
}

export function getAttributeLabel(attributeName: string): string {
  const map: Record<string, string> = {
    'pa_color': 'Color',
    'pa_talla': 'Talla',
    'pa_genero': 'Género',
    'pa_material': 'Material',
    'pa_tecnica': 'Técnica'
  };
  
  return map[attributeName] || attributeName.replace('pa_', '').replace(/_/g, ' ');
}
