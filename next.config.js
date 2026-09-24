import { readFileSync } from "node:fs";

const wooCategoryRoutes = JSON.parse(
  readFileSync(new URL("./src/data/woo-category-routes.json", import.meta.url), "utf8"),
);
const legacyCategoryPrefixes = ["categoria-producto", "product-category"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "creativu.es" },
      { protocol: "https", hostname: "impacto33.com" },
      { protocol: "https", hostname: "*.impacto33.com" },
      { protocol: "https", hostname: "*.woocommerce.com" },
      { protocol: "https", hostname: "*.wp.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    const mappedCategoryRedirects = Object.entries(wooCategoryRoutes).flatMap(
      ([wooSlug, destination]) =>
        legacyCategoryPrefixes.map((prefix) => ({
          source: `/${prefix}/${wooSlug}`,
          destination,
          statusCode: 301,
        })),
    );

    return [
      ...mappedCategoryRedirects,
      ...legacyCategoryPrefixes.map((prefix) => ({
        source: `/${prefix}/:path*`,
        destination: "/:path*",
        statusCode: 301,
      })),
    ];
  },
  async rewrites() {
    const expressPort = process.env.EXPRESS_PORT || "3001";
    const expressUrl = `http://localhost:${expressPort}`;
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${expressUrl}/api/trpc/:path*`,
      },
      {
        source: "/api/oauth/:path*",
        destination: `${expressUrl}/api/oauth/:path*`,
      },
      { source: "/graphql", destination: "https://creativu.es/graphql" },
      { source: "/feeds/:path*", destination: `${expressUrl}/feeds/:path*` },
    ];
  },
  env: {
    NEXT_PUBLIC_WP_GRAPHQL_URL:
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
      process.env.VITE_WP_GRAPHQL_URL ||
      "https://creativu.es/graphql",
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "",
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
      process.env.VITE_STRIPE_PUBLIC_KEY ||
      "",
    NEXT_PUBLIC_STRIPE_ENABLED:
      process.env.NEXT_PUBLIC_STRIPE_ENABLED ||
      process.env.VITE_STRIPE_ENABLED ||
      process.env.STRIPE_ENABLED ||
      "false",
  },
};
export default nextConfig;
