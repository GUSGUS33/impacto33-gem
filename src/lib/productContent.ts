const decodeBasicEntities = (value: string): string => value
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">");

export const normalizeProductText = (value?: string | null): string => {
  if (!value) return "";

  return decodeBasicEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es");
};

/**
 * Only returns a summary when it adds genuinely distinct, concise information.
 * This prevents the long WordPress description from being duplicated above the
 * quote calculator while still allowing editors to provide a useful two-line intro.
 */
export const getUniqueProductSummary = (
  shortDescription?: string | null,
  description?: string | null,
): string | null => {
  const normalizedSummary = normalizeProductText(shortDescription);
  const normalizedDescription = normalizeProductText(description);

  if (!normalizedSummary || normalizedSummary.length > 320) return null;

  const sentenceCount = (normalizedSummary.match(/[.!?]+(?:\s|$)/g) || []).length;
  if (sentenceCount > 2) return null;

  if (
    normalizedDescription
    && (normalizedDescription === normalizedSummary
      || normalizedDescription.includes(normalizedSummary)
      || normalizedSummary.includes(normalizedDescription))
  ) {
    return null;
  }

  return shortDescription || null;
};

const SIZE_CODES = new Set(["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL"]);

/** Converts internal WooCommerce option slugs into labels suitable for customers. */
export const formatProductOptionLabel = (value?: string | null): string => {
  const cleaned = String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const normalized = cleaned.toLocaleLowerCase("es");
  if (["talla unica adulto", "talla única adulto", "unica adulto", "única adulto"].includes(normalized)) {
    return "Talla única";
  }

  const upper = cleaned.toUpperCase();
  if (SIZE_CODES.has(upper)) return upper;

  return cleaned.charAt(0).toLocaleUpperCase("es") + cleaned.slice(1).toLocaleLowerCase("es");
};

interface ProductAttributeLike {
  name?: string | null;
  options?: Array<string | null> | null;
}

export interface ProductAttributeGroup {
  label: string;
  values: string[];
}

const PRODUCT_ATTRIBUTE_LABELS: Record<string, string> = {
  composicion: "Composición",
  genero: "Género",
  material: "Material",
  talla: "Talla",
  tallas: "Tallas",
  color: "Color",
  colores: "Colores",
};

const formatProductAttributeLabel = (value?: string | null): string => {
  const cleaned = String(value || "").replace(/^pa[_-]/i, "");
  const normalized = cleaned
    .replace(/[_-]+/g, " ")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return PRODUCT_ATTRIBUTE_LABELS[normalized] || formatProductOptionLabel(cleaned);
};

/** Keeps only useful, populated attributes for the visible product content. */
export const getProductAttributeGroups = (
  attributes?: ProductAttributeLike[] | null,
): ProductAttributeGroup[] => (attributes || [])
  .map((attribute) => ({
    label: formatProductAttributeLabel(attribute.name),
    values: [...new Set((attribute.options || [])
      .map(formatProductOptionLabel)
      .filter(Boolean))],
  }))
  .filter((attribute) => attribute.label && attribute.values.length > 0);

export interface ProductFaq {
  question: string;
  answer: string;
}

export const buildProductFaqs = (
  productName: string,
  minimumQuantity: number,
): ProductFaq[] => [
  {
    question: `¿Cuál es la cantidad mínima de ${productName}?`,
    answer: `La cantidad mínima orientativa es de ${minimumQuantity} unidades. Puedes repartirlas entre las variantes disponibles y consultar los tramos de precio en la calculadora.`,
  },
  {
    question: `¿Cómo puedo personalizar ${productName}?`,
    answer: "Selecciona el color, la cantidad y las zonas disponibles en la calculadora. Las técnicas compatibles se muestran automáticamente según el producto.",
  },
  {
    question: `¿Cuándo recibiré ${productName}?`,
    answer: "La calculadora muestra las opciones de producción y una fecha estimada. El plazo definitivo se confirma al validar el diseño, el stock y los detalles del pedido.",
  },
];
