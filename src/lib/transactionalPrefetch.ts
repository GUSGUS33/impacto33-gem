import type { PageBlock } from "@/queries/seoPageComplete";
import type { ChildPage } from "@/hooks/useChildPages";
import type { FilteredProduct } from "@/hooks/useFilteredProducts";
import { normalizeSlug } from "@/lib/slugUtils";
import { wpGraphqlFetch } from "@/lib/wpGraphql";

export interface TransactionalInitialData {
  childPages: ChildPage[];
  productsByBlock: Record<number, FilteredProduct[]>;
}

const PRODUCT_FIELDS = `
  ... on SimpleProduct {
    id databaseId name slug type onSale price regularPrice salePrice
    featuredImage { node { sourceUrl altText } }
    productCategories { nodes { name slug } }
  }
  ... on VariableProduct {
    id databaseId name slug type onSale price regularPrice salePrice
    featuredImage { node { sourceUrl altText } }
    productCategories { nodes { name slug } }
  }
`;

const FILTERED_PRODUCTS_QUERY = `
  query GetFilteredProductsSSR(
    $categorySlug: String
    $tagSlug: String
    $first: Int = 20
    $orderby: ProductsOrderByEnum = DATE
    $order: OrderEnum = DESC
  ) {
    products(
      where: {
        status: "publish"
        category: $categorySlug
        tag: $tagSlug
        orderby: [{ field: $orderby, order: $order }]
      }
      first: $first
    ) { nodes { ${PRODUCT_FIELDS} } }
  }
`;

const PRODUCTS_BY_IDS_QUERY = `
  query GetProductsByIdsSSR($ids: [Int]!) {
    products(where: { include: $ids, status: "publish" }, first: 100) {
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

const PRODUCT_BY_SKU_QUERY = `
  query GetProductBySkuSSR($sku: String!) {
    products(where: { sku: $sku, status: "publish" }, first: 1) {
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

const CHILD_PAGES_QUERY = `
  query GetChildPagesSSR($parentUri: ID!) {
    page(id: $parentUri, idType: URI) {
      children(first: 100) {
        nodes {
          ... on Page {
            id databaseId title uri slug
            featuredImage {
              node {
                id sourceUrl altText
                mediaDetails { width height }
              }
            }
            template { templateName __typename }
          }
        }
      }
    }
  }
`;

function parseIds(input?: number[] | string | null): number[] {
  if (!input) return [];
  const values = Array.isArray(input) ? input : String(input).split(/[\s,]+/);
  return values.map(Number).filter((value) => Number.isInteger(value) && value > 0);
}

function parseSkus(input?: string[] | string | null): string[] {
  if (!input) return [];
  const values = Array.isArray(input) ? input : String(input).split(/[\s,]+/);
  return values.map((value) => String(value).trim()).filter(Boolean);
}

function getBlockType(block: PageBlock): string {
  const rawType = Array.isArray(block.blockType) ? block.blockType[0] : block.blockType;
  return String(rawType || "").toLowerCase();
}

function getOrderBy(block: PageBlock): string {
  const raw = Array.isArray(block.productosDinamicosOrdenar)
    ? block.productosDinamicosOrdenar[0]
    : block.productosDinamicosOrdenar;
  const map: Record<string, string> = {
    popularity: "TOTAL_SALES",
    rating: "RATING",
    price: "PRICE",
    date: "DATE",
    title: "NAME",
    name: "NAME",
  };
  return map[String(raw || "date").toLowerCase()] || "DATE";
}

function mergeProducts(
  manualProducts: FilteredProduct[],
  categoryProducts: FilteredProduct[],
  limit: number,
): FilteredProduct[] {
  const seen = new Set<string | number>();
  const merged: FilteredProduct[] = [];

  for (const product of [...manualProducts, ...categoryProducts]) {
    const key = product.databaseId || product.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
  }

  return merged.slice(0, limit);
}

async function fetchProductsForBlock(block: PageBlock): Promise<FilteredProduct[]> {
  const categorySlug = normalizeSlug(block.productosDinamicosCategoria || null);
  const tagSlug = normalizeSlug(block.productosDinamicosEtiqueta || null);
  const ids = parseIds(block.productosDinamicosIds);
  const skus = parseSkus(block.productosDinamicosSkus);
  const limit = Number(block.productosDinamicosMaximo) || 12;
  const orderby = getOrderBy(block);
  const order = orderby === "PRICE" ? "ASC" : "DESC";

  const categoryPromise = categorySlug || tagSlug
    ? wpGraphqlFetch<{ products?: { nodes?: FilteredProduct[] } }>(
        FILTERED_PRODUCTS_QUERY,
        { categorySlug, tagSlug, first: limit, orderby, order },
      ).then((data) => data.products?.nodes || []).catch(() => [])
    : Promise.resolve([] as FilteredProduct[]);

  const idsPromise = ids.length
    ? wpGraphqlFetch<{ products?: { nodes?: FilteredProduct[] } }>(
        PRODUCTS_BY_IDS_QUERY,
        { ids },
      ).then((data) => data.products?.nodes || []).catch(() => [])
    : Promise.resolve([] as FilteredProduct[]);

  const skuPromises = skus.map((sku) =>
    wpGraphqlFetch<{ products?: { nodes?: FilteredProduct[] } }>(
      PRODUCT_BY_SKU_QUERY,
      { sku },
    ).then((data) => data.products?.nodes?.[0] || null).catch(() => null),
  );

  const [categoryProducts, idProducts, skuProducts] = await Promise.all([
    categoryPromise,
    idsPromise,
    Promise.all(skuPromises),
  ]);

  return mergeProducts(
    [...idProducts, ...skuProducts.filter((product): product is FilteredProduct => Boolean(product))],
    categoryProducts,
    limit,
  );
}

export async function prefetchTransactionalPageData(
  page: { uri: string; parent?: { node?: { uri?: string } } | null },
  blocks: PageBlock[],
): Promise<TransactionalInitialData> {
  const parentUri = page.parent?.node?.uri;
  const childPagesPromise = wpGraphqlFetch<{
    page?: { children?: { nodes?: ChildPage[] } };
  }>(CHILD_PAGES_QUERY, { parentUri: parentUri || page.uri })
    .then((data) => data.page?.children?.nodes || [])
    .catch(() => [] as ChildPage[]);

  const productEntries = await Promise.all(
    blocks.map(async (block, index) => {
      const type = getBlockType(block);
      if (type !== "productos_dinamicos" && type !== "productosdinamicos") return null;
      return [index, await fetchProductsForBlock(block)] as const;
    }),
  );

  const productsByBlock = Object.fromEntries(
    productEntries.filter((entry): entry is readonly [number, FilteredProduct[]] => entry !== null),
  );

  return {
    childPages: await childPagesPromise,
    productsByBlock,
  };
}
