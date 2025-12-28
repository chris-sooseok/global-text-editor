import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  // Important for packaged apps (file://) so built assets load correctly
  base: "./",
  plugins: [
    react(),
    electron({
      main: { entry: "electron/main.ts" },
      preload: { input: "electron/preload.ts" },
    }),
  ],
});
