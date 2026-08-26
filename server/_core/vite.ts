// Vite has been removed — Next.js handles the frontend now.
// This file is kept as a no-op stub to avoid breaking imports in server/_core/index.ts.

import type { Express } from "express";
import type { Server } from "http";

export async function setupVite(_app: Express, _server: Server) {
  // no-op: Next.js serves the frontend
}

export function serveStatic(_app: Express) {
  // no-op: Next.js serves static files
}
