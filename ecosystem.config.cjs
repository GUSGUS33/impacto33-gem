const path = require("node:path");

const appRoot = __dirname;

module.exports = {
  apps: [
    {
      name: "impacto33-web",
      cwd: appRoot,
      script: path.join(appRoot, "node_modules/next/dist/bin/next"),
      args: "start --hostname 127.0.0.1 --port 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        EXPRESS_PORT: "3001",
      },
    },
    {
      name: "impacto33-api",
      cwd: appRoot,
      script: path.join(appRoot, "dist/index.js"),
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        EXPRESS_PORT: "3001",
      },
    },
  ],
};
