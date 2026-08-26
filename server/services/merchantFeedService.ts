/**
 * Servicio para generar feed XML de Google Merchant Center
 * Genera items individuales por cada variación de producto
 */

import type { MerchantProduct, ProductVariation, VariationAttribute } from '../graphql/merchantFeedQuery';

/**
 * Escapa caracteres especiales para XML
 */
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Limpia HTML de las descripciones y trunca a 5000 caracteres
 */
function cleanDescription(html: string): string {
  if (!html) return '';
  
  // Eliminar tags HTML
  let clean = html.replace(/<[^>]*>/g, '');
  
  // Decodificar entidades HTML comunes
  clean = clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // Eliminar espacios múltiples y saltos de línea
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Truncar a 5000 caracteres (límite de Google)
  if (clean.length > 5000) {
    clean = clean.substring(0, 4997) + '...';
  }
  
  return clean;
}

/**
 * Formatea el precio para Google Merchant (ej: "12.50 EUR")
 */
function formatPrice(priceString?: string): string {
  if (!priceString) return '0.00 EUR';
  
  // Eliminar HTML entities y símbolos de moneda
  let clean = priceString
    .replace(/&nbsp;/g, '')
    .replace(/€/g, '')
    .replace(/EUR/gi, '')
    .replace(/,/g, '.')
    .trim();
  
  const price = parseFloat(clean);
  if (isNaN(price)) return '0.00 EUR';
  
  return `${price.toFixed(2)} EUR`;
}

/**
 * Mapea el estado de stock de WooCommerce a formato Google
 */
function mapStockStatus(status?: string): string {
  switch (status?.toUpperCase()) {
    case 'IN_STOCK':
      return 'in stock';
    case 'OUT_OF_STOCK':
      return 'out of stock';
    case 'ON_BACKORDER':
      return 'preorder';
    default:
      return 'in stock'; // Por defecto asumimos disponible
  }
}

/**
 * Extrae el valor de un atributo específico (ej: color, talla)
 */
function getAttributeValue(attributes: VariationAttribute[] | undefined, attributeName: string): string | null {
  if (!attributes) return null;
  
  const attr = attributes.find(a => 
    a.name.toLowerCase().includes(attributeName.toLowerCase())
  );
  
  return attr ? attr.value : null;
}

/**
 * Normaliza el nombre del atributo para display
 */
function normalizeAttributeName(value: string): string {
  if (!value) return '';
  
  return value
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Genera un item XML para un producto simple o una variación
 */
function generateProductItem(
  product: MerchantProduct,
  variation?: ProductVariation,
  itemGroupId?: number
): string {
  // Determinar qué datos usar (variación o producto base)
  const isVariation = !!variation;
  const id = isVariation ? variation!.databaseId : product.databaseId;
  const name = isVariation ? variation!.name : product.name;
  const sku = isVariation ? (variation!.sku || product.sku) : product.sku;
  const price = isVariation ? variation!.price : product.price;
  const regularPrice = isVariation ? variation!.regularPrice : product.regularPrice;
  const salePrice = isVariation ? variation!.salePrice : product.salePrice;
  const stockStatus = isVariation ? variation!.stockStatus : product.stockStatus;
  const image = isVariation ? (variation!.image || product.image) : product.image;
  const description = isVariation ? (variation!.description || product.description) : product.description;
  
  // Extraer atributos de variación
  const attributes = variation?.attributes?.nodes || [];
  const color = getAttributeValue(attributes, 'color');
  const size = getAttributeValue(attributes, 'talla');
  
  // Construir título completo
  let fullTitle = name;
  if (isVariation && (color || size)) {
    const parts = [product.name];
    if (color) parts.push(normalizeAttributeName(color));
    if (size) parts.push(normalizeAttributeName(size));
    fullTitle = parts.join(' - ');
  }
  
  // URL del producto (siempre apunta al producto padre)
  const link = `https://impacto33.com/producto/${product.slug}`;
  
  // Determinar precio a mostrar (precio de venta si existe, sino regular)
  const finalPrice = salePrice || price || regularPrice;
  
  let xml = `
    <item>
      <g:id>${escapeXml(String(id))}</g:id>
      <g:title>${escapeXml(fullTitle)}</g:title>
      <g:description>${escapeXml(cleanDescription(description))}</g:description>
      <g:link>${escapeXml(link)}</g:link>`;
  
  // Imagen
  if (image?.sourceUrl) {
    xml += `
      <g:image_link>${escapeXml(image.sourceUrl)}</g:image_link>`;
  }
  
  // Precio
  xml += `
      <g:price>${escapeXml(formatPrice(finalPrice))}</g:price>`;
  
  // Disponibilidad
  xml += `
      <g:availability>${escapeXml(mapStockStatus(stockStatus))}</g:availability>`;
  
  // Condición (siempre nuevo)
  xml += `
      <g:condition>new</g:condition>`;
  
  // Marca
  xml += `
      <g:brand>IMPACTO33</g:brand>`;
  
  // MPN (código de fabricante) - usar SKU
  if (sku) {
    xml += `
      <g:mpn>${escapeXml(sku)}</g:mpn>`;
  }
  
  // Item Group ID (para variaciones)
  if (itemGroupId) {
    xml += `
      <g:item_group_id>${escapeXml(String(itemGroupId))}</g:item_group_id>`;
  }
  
  // Atributos de variación
  if (color) {
    xml += `
      <g:color>${escapeXml(normalizeAttributeName(color))}</g:color>`;
  }
  
  if (size) {
    xml += `
      <g:size>${escapeXml(normalizeAttributeName(size))}</g:size>`;
  }
  
  xml += `
    </item>`;
  
  return xml;
}

/**
 * Genera el feed XML completo con todos los productos y sus variaciones
 */
export function generateMerchantFeedXML(products: MerchantProduct[]): string {
  const now = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>IMPACTO33 - Regalos Publicitarios y Ropa Personalizada</title>
    <link>https://impacto33.com</link>
    <description>Catálogo completo de productos personalizados: ropa, merchandising, regalos publicitarios y artículos promocionales</description>
    <lastBuildDate>${now}</lastBuildDate>
    `;
  
  let totalItems = 0;
  
  for (const product of products) {
    if (product.type === 'VARIABLE' && product.variations?.nodes && product.variations.nodes.length > 0) {
      // Producto variable CON variaciones cargadas: generar un item por cada variación
      const itemGroupId = product.databaseId;
      
      for (const variation of product.variations.nodes) {
        xml += generateProductItem(product, variation, itemGroupId);
        totalItems++;
      }
    } else {
      // Producto simple O producto variable sin variaciones cargadas: generar un solo item del producto base
      xml += generateProductItem(product);
      totalItems++;
    }
  }
  
  xml += `
  </channel>
</rss>`;
  
  console.log(`[Merchant Feed] Generated feed with ${totalItems} items from ${products.length} products`);
  
  return xml;
}
