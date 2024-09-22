/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./setup-tests.ts"],
    restoreMocks: true,
    coverage: {
      exclude: ["**/__tests__/**"],
      include: ["src/**/*.ts"],
      all: true,
    },
  },
});
