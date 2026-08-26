"use client";

// El "use client" es suficiente para que Next.js no ejecute estos providers en el servidor.
// No necesitamos ningún guard de mounted — Next.js lo gestiona automáticamente.

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { ApolloProvider } from "@apollo/client/react";
import { Toaster } from "sonner";

import { trpc } from "@/lib/trpc";
import { getApolloClient } from "@/lib/apollo";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QuoteProvider } from "@/contexts/QuoteContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationContainer } from "@/components/NotificationContainer";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes("ResizeObserver loop completed with undelivered notifications") ||
         event.message.includes("ResizeObserver loop limit exceeded"))
      ) {
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", handleWindowError);
    return () => window.removeEventListener("error", handleWindowError);
  }, []);

  const [queryClient] = useState(() => new QueryClient());
  const [apolloClient] = useState(() => getApolloClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={apolloClient}>
              <AuthProvider>
                <ThemeProvider defaultTheme="light">
                  <QuoteProvider>
                    <NotificationProvider>
                      <TooltipProvider>
                        <Toaster />
                        <NotificationContainer />
                        {children}
                      </TooltipProvider>
                    </NotificationProvider>
                  </QuoteProvider>
                </ThemeProvider>
              </AuthProvider>
          </ApolloProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
