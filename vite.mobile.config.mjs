import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "mobile",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@shared": resolve(process.cwd(), "shared")
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5174
  }
});
