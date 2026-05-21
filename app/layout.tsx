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
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ClientProviders>
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
