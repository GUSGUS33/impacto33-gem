import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import merchantFeedRouter from "../routes/merchantFeed";
import { createProxyMiddleware } from "http-proxy-middleware";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.get("/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ status: "ok", service: "impacto33-api" });
  });

  // IMPORTANT: Proxy MUST be registered BEFORE body parsers and Vite middleware
  // When Express mounts with app.use("/graphql", ...), it strips "/graphql" from req.url
  // So we need pathRewrite to add it back, ensuring the request goes to creativu.es/graphql
  app.use(
    "/graphql",
    createProxyMiddleware({
      target: "https://creativu.es",
      changeOrigin: true,
      secure: true,
      timeout: 30000,
      proxyTimeout: 30000,
      pathRewrite: {
        "^/": "/graphql", // req.url is "/" after Express strips "/graphql", rewrite to "/graphql"
      },
      on: {
        proxyReq: (proxyReq: any) => {
          proxyReq.setHeader("Origin", "https://creativu.es");
          proxyReq.setHeader("Referer", "https://creativu.es/");
        },
      },
    })
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Google Merchant Feed XML
  app.use("/feeds", merchantFeedRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Priority sequence for port selection:
  // 1. EXPRESS_PORT (specifically for the express server)
  // 2. PORT (standard environment port, e.g. from Cloud Run)
  // 3. Fallback to 3001 if none of the above are set
  // We avoid port 3000 in development to not conflict with Next.js
  const preferredPort = parseInt(
    process.env.EXPRESS_PORT ||
      (process.env.PORT && process.env.PORT !== "3000"
        ? process.env.PORT
        : "") ||
      "3001"
  );
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
