import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceHtml: string | undefined | null): string {
  if (!priceHtml) return '';
  
  // Limpiamos etiquetas HTML y entidades de precio
  const cleanText = priceHtml
    .replace(/<[^>]*>/g, '') // Eliminar tags HTML
    .replace(/&amp;nbsp;/gi, ' ') // Reemplazar doble codificación &amp;nbsp;
    .replace(/&nbsp;/gi, ' ') // Reemplazar espacio no rompible
    .replace(/&amp;ndash;/gi, '-') // Reemplazar guión en dash
    .replace(/&ndash;/gi, '-')
    .replace(/&#8211;/g, '-')
    .replace(/&#038;/g, '&') // Reemplazar ampersand
    .replace(/&amp;/g, '&')
    .replace(/&#8364;/g, '€') // Reemplazar símbolo euro si viene codificado
    .replace(/&euro;/gi, '€')
    .replace(/\s+/g, ' '); // Unificar espacios en blanco

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
