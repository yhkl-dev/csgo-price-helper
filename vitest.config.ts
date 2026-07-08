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
      // @ts-expect-error — `all` is a valid Vitest runtime option but missing from v4 CoverageOptions types
      all: true
    }
  }
})
