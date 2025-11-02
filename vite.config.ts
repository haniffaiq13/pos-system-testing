import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => {
  const isProd = process.env.NODE_ENV === "production";
  const isReplit = process.env.REPL_ID !== undefined;

  const plugins = [react(), runtimeErrorOverlay()];

  if (!isProd && isReplit) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(cartographer(), devBanner());
  }

  return {
    plugins,
    // aplikasi lu ada di folder client/
    root: path.resolve(import.meta.dirname, "client"),

    // alias tetap relatif ke repo root
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    // taruh public di client/public agar Vite copy ke dist/
    publicDir: path.resolve(import.meta.dirname, "client", "public"),

    build: {
      // KELUARAN WAJIB ke dist/ (BUKAN dist/public)
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      assetsDir: "assets",
    },

    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
