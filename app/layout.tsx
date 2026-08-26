import type { Metadata } from "next";
import "@/index.css";
import { ClientProviders } from "./ClientProviders";
import { MainLayoutWrapper } from "./MainLayoutWrapper";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IMPACTO33 | Artículos Promocionales y Regalos Publicitarios Personalizados",
    template: "%s | IMPACTO33",
  },
  description:
    "Artículos promocionales y regalos publicitarios personalizados para empresas. Camisetas, tazas, bolsas, merchandising y más con tu logo. Precios mayoristas.",
  metadataBase: new URL("https://impacto33.com"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "IMPACTO33",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://impacto33.com" />
        <link rel="dns-prefetch" href="https://static.elfsight.com" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ClientProviders>
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
