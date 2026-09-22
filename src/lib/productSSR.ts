export const GET_FULL_PRODUCT_QUERY = `
  query GetFullProductData($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      __typename
      ... on VariableProduct {
        id
        databaseId
        name
        slug
        sku
        shortDescription
        description
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        stockQuantity
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        attributes {
          nodes {
            id
            name
            options
          }
        }
        variations(first: 200) {
          nodes {
            id
            databaseId
            name
            sku
            price
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            attributes {
              nodes {
                name
                value
              }
            }
            image {
              sourceUrl
              altText
            }
          }
        }
        related(first: 4) {
          nodes {
            id
            name
            slug
            ... on VariableProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
      ... on SimpleProduct {
        id
        databaseId
        name
        slug
        sku
        shortDescription
        description
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        stockQuantity
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        attributes {
          nodes {
            id
            name
            options
          }
        }
        related(first: 4) {
          nodes {
            id
            name
            slug
            ... on VariableProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export type ProductFetchResult =
  | { status: "SUCCESS"; product: any }
  | { status: "NOT_FOUND" }
  | { status: "SERVER_ERROR"; error: string };

type GraphQlResponse = {
  data?: { product?: any | null } | null;
  errors?: Array<{ message?: string; path?: unknown[] }>;
};

export function classifyProductResponse(payload: GraphQlResponse): ProductFetchResult {
  if (payload.errors?.length) {
    const confirmedNotFound = payload.errors.some((error) => {
      const message = String(error.message ?? "").toLowerCase();
      return (
        message.includes("no product id was found") ||
        message.includes("could not find") ||
        (message.includes("not found") && error.path?.includes("product"))
      );
    });

    if (confirmedNotFound && payload.data?.product == null) {
      return { status: "NOT_FOUND" };
    }

    return {
      status: "SERVER_ERROR",
      error: payload.errors[0]?.message || "GraphQL execution error",
    };
  }

  if (payload.data?.product) {
    return { status: "SUCCESS", product: payload.data.product };
  }

  return { status: "NOT_FOUND" };
}

export async function fetchProductForSSR(
  slug: string,
  fetcher: typeof fetch = fetch,
): Promise<ProductFetchResult> {
  const graphqlUrl =
    process.env.VITE_WP_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
    "https://creativu.es/graphql";

  try {
    const response = await fetcher(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Impacto33-SSR/1.0",
      },
      body: JSON.stringify({
        query: GET_FULL_PRODUCT_QUERY,
        variables: { slug },
      }),
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return {
        status: "SERVER_ERROR",
        error: `WordPress responded with HTTP status ${response.status}`,
      };
    }

    return classifyProductResponse((await response.json()) as GraphQlResponse);
  } catch (error) {
    return {
      status: "SERVER_ERROR",
      error: error instanceof Error ? error.message : "Network failure or request timeout",
    };
  }
}

export function extractFirstPrice(value: unknown): string {
  const text = String(value ?? "").replace(/<[^>]*>/g, " ");
  const match = text.match(/\d+(?:[.,]\d+)?/);
  return match ? match[0].replace(",", ".") : "0.00";
}
