import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
      "@": path.resolve(__dirname, "./@")
    }
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      include: ["utils/**/*.ts"],
      all: true
    }
  }
})
