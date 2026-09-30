"use client";

import React from "react";
import { Providers } from "./providers";

/**
 * Global client providers only. Do not wrap route children in Suspense here:
 * starting the response stream before notFound() resolves turns a real 404 into
 * an HTTP 200 soft-404. Components that genuinely suspend must own a local
 * boundary around only that component.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
