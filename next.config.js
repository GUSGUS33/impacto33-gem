/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'wouter': path.resolve(__dirname, 'src/shims/wouter.tsx'),
      'react-helmet-async': path.resolve(__dirname, 'src/shims/react-helmet-async.tsx'),
    };
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 'creativu.es' },
      { protocol: 'https', hostname: 'impacto33.com' },
      { protocol: 'https', hostname: '*.impacto33.com' },
      { protocol: 'https', hostname: '*.woocommerce.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    const expressPort = process.env.EXPRESS_PORT || '3001';
    const expressUrl = `http://localhost:${expressPort}`;
    return [
      { source: '/api/trpc/:path*', destination: `${expressUrl}/api/trpc/:path*` },
      { source: '/api/oauth/:path*', destination: `${expressUrl}/api/oauth/:path*` },
      { source: '/graphql', destination: 'https://creativu.es/graphql' },
      { source: '/feeds/:path*', destination: `${expressUrl}/feeds/:path*` },
    ];
  },
  env: {
    NEXT_PUBLIC_WP_GRAPHQL_URL: process.env.VITE_WP_GRAPHQL_URL || 'https://creativu.es/graphql',
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY || '',
    NEXT_PUBLIC_STRIPE_ENABLED: process.env.VITE_STRIPE_ENABLED || 'false',
  },
};
export default nextConfig;
