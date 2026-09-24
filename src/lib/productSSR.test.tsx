import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductPage from "@/screens/shop/ProductPage";
import {
  classifyProductResponse,
  extractFirstPrice,
  fetchProductForSSR,
} from "./productSSR";

const mockUseQuery = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "producto-prueba" }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@apollo/client", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(""),
}));

vi.mock("@/components/pricing/ProductPricingFlow", () => ({
  default: ({ product }: { product: { name: string } }) => (
    <div data-pricing-product={product.name}>Flujo de presupuesto</div>
  ),
}));

const variableProduct = {
  __typename: "VariableProduct",
  id: "variable-1",
  databaseId: 1,
  name: "Mochila deportiva personalizada",
  slug: "mochila-deportiva-personalizada",
  sku: "M-1",
  shortDescription: "<p>Mochila resistente para eventos.</p>",
  description: "<p>Descripción completa.</p>",
  price: "5,86 €",
  regularPrice: "5,86 €",
  salePrice: null,
  stockStatus: "IN_STOCK",
  stockQuantity: null,
  featuredImage: {
    node: { sourceUrl: "https://example.com/mochila.jpg", altText: "Mochila" },
  },
  galleryImages: { nodes: [] },
  productCategories: { nodes: [] },
  attributes: { nodes: [] },
  variations: { nodes: [{ id: "variation-1", price: "5,86 €" }] },
};

const simpleProduct = {
  ...variableProduct,
  __typename: "SimpleProduct",
  id: "simple-1",
  name: "Antifaz de viaje personalizado",
  slug: "antifaz-de-viaje-personalizado",
  price: "1,25 €",
  regularPrice: "1,25 €",
  variations: undefined,
};

describe("SSR de fichas de producto", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
  });

  it("incluye el H1, descripción, precio e imagen reales en el HTML inicial", () => {
    const html = renderToStaticMarkup(
      <ProductPage serverSlug={variableProduct.slug} initialProduct={variableProduct} />,
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Mochila deportiva personalizada");
    expect(html).toContain("Mochila resistente para eventos");
    expect(html).toContain("Desde 5,86 €");
    expect(html).toContain("https://example.com/mochila.jpg");
    expect(html).not.toContain("¡Vaya! Parece que te has perdido");
  });

  it("no duplica la descripción y mantiene la calculadora antes del contenido editorial", () => {
    const duplicatedContentProduct = {
      ...variableProduct,
      shortDescription: "<p>Texto editorial repetido.</p>",
      description: "<p>Texto editorial repetido.</p>",
    };
    const html = renderToStaticMarkup(
      <ProductPage
        serverSlug={duplicatedContentProduct.slug}
        initialProduct={duplicatedContentProduct}
      />,
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toContain("data-product-summary");
    expect(html.match(/Texto editorial repetido\./g)).toHaveLength(1);
    expect(html.indexOf("data-product-pricing")).toBeLessThan(
      html.indexOf("data-product-description"),
    );
  });

  it("reserva los encabezados del documento para el contenido editorial", () => {
    const html = renderToStaticMarkup(
      <ProductPage serverSlug={variableProduct.slug} initialProduct={variableProduct} />,
    );
    const headings = [...html.matchAll(/<(h[1-6])\b[^>]*>(.*?)<\/\1>/g)]
      .map((match) => ({
        tagName: match[1].toUpperCase(),
        textContent: match[2].replace(/<[^>]*>/g, ""),
      }));

    expect(headings.filter((heading) => heading.tagName === "H1")).toHaveLength(1);
    expect(headings.filter((heading) => heading.tagName === "H2").map((heading) => heading.textContent))
      .toEqual([
        "Características principales de Mochila deportiva personalizada",
        "Opciones de personalización de Mochila deportiva personalizada",
        "Plazos, cantidades y presupuesto",
        "Preguntas frecuentes sobre Mochila deportiva personalizada",
      ]);
    expect(headings.some((heading) => heading.tagName === "H3")).toBe(true);
    expect(headings.some((heading) => ["H4", "H5", "H6"].includes(heading.tagName)))
      .toBe(false);
    expect(headings[0]?.textContent).toContain("Mochila deportiva personalizada");
    expect(headings[1]?.textContent).toContain("Características principales");
  });

  it("renderiza productos simples sin etiquetar su precio como Desde", () => {
    const html = renderToStaticMarkup(
      <ProductPage serverSlug={simpleProduct.slug} initialProduct={simpleProduct} />,
    );

    expect(html).toContain("Antifaz de viaje personalizado");
    expect(html).toContain("1,25 €");
    expect(html).not.toContain("Desde 1,25 €");
  });

  it("evita la consulta Apollo cuando el servidor ya entregó el producto", () => {
    renderToStaticMarkup(
      <ProductPage serverSlug={variableProduct.slug} initialProduct={variableProduct} />,
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true }),
    );
  });

  it("muestra un error temporal y no un falso 404 si Apollo falla", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error("Backend timeout"),
    });

    const html = renderToStaticMarkup(<ProductPage serverSlug="producto-prueba" />);
    expect(html).toContain("No se pudo cargar el producto");
    expect(html).not.toContain("¡Vaya! Parece que te has perdido");
  });
});

describe("clasificación de respuestas WPGraphQL", () => {
  it("clasifica como NOT_FOUND la ausencia confirmada por WPGraphQL", () => {
    expect(classifyProductResponse({
      data: { product: null },
      errors: [{
        message: "No product ID was found corresponding to the slug",
        path: ["product"],
      }],
    })).toEqual({ status: "NOT_FOUND" });
  });

  it("mantiene los fallos internos como errores temporales", () => {
    expect(classifyProductResponse({
      data: null,
      errors: [{ message: "Database connection failed", path: [] }],
    })).toEqual({ status: "SERVER_ERROR", error: "Database connection failed" });
  });

  it("clasifica respuestas correctas y extrae el primer precio de un rango", async () => {
    const product = { id: "simple-1", name: "Producto" };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { product },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(fetchProductForSSR("producto", fetcher)).resolves.toEqual({
      status: "SUCCESS",
      product,
    });
    expect(extractFirstPrice("<span>5,86 € – 10,00 €</span>")).toBe("5.86");
  });
});
