import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

/** Vite's runtime
 * Vite is the runtime for the renderer
 * Vites reads vite.config.ts when `npm run dev`
 * This is needed so that vite can actually run and bundle imports in the renderer
 * 
 * Eelectron has its own running system, separate from Vite
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "src/assets"),
      shared: path.resolve(__dirname, "src/shared"),
      store: path.resolve(__dirname, "src/store"),
      api: path.resolve(__dirname, "src/api"),
      context: path.resolve(__dirname, "src/context"),
    },
  },
})