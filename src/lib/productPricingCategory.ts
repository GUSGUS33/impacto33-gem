import { CATEGORY_TO_FAMILY_MAPPING } from "@/data/pricing/category-to-family";

interface ProductCategory {
  slug?: string | null;
}

export const resolveProductPricingCategory = (
  categories?: ProductCategory[] | null,
): string => {
  const slugs = (categories || [])
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug));

  return slugs.find((slug) => Boolean(CATEGORY_TO_FAMILY_MAPPING[slug]))
    || slugs[0]
    || "default";
};
