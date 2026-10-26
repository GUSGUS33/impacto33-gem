import routes from '@/data/woo-category-routes.json';
type FamilyProduct = { id?: string; name?: string; slug?: string; featuredImage?: { node?: { sourceUrl?: string; altText?: string } }; productCategories?: { nodes?: Array<{ slug?: string }> }; related?: { nodes?: FamilyProduct[] } };
const excluded = new Set(['ropa', 'ropa-personalizada', 'textil', 'otros', 'sin-categorizar', 'uncategorized']);
const categories = (product: FamilyProduct) => (product.productCategories?.nodes || []).map(item => item.slug || '').filter(slug => slug && !excluded.has(slug));
const mapped = (slug: string) => (routes as Record<string,string>)[slug]?.replace(/\/$/, '');
export function sameFamilyRelated(product: FamilyProduct) {
  const own = categories(product);
  if (!own.length) return [];
  const candidates = (product.related?.nodes || []).filter(candidate => candidate.id !== product.id);
  const targets = own.map(mapped).filter((value): value is string => Boolean(value));
  const depth = Math.max(0, ...targets.map(value => value.split('/').filter(Boolean).length));
  const deepest = targets.filter(value => value.split('/').filter(Boolean).length === depth);
  const primary = candidates.filter(candidate => categories(candidate).some(slug => deepest.includes(mapped(slug))));
  if (primary.length) return primary;
  // Exact Woo/provider-category identity only; never use the old Familia attribute.
  return candidates.filter(candidate => categories(candidate).some(slug => own.includes(slug)));
}
