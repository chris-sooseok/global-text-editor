import { defineConfig, mergeConfig } from "vite"
import baseConfig from "./vite.config"

export default defineConfig(
  mergeConfig(baseConfig, {
    base: "./",
  })
)
