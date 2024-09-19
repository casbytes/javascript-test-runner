/// <reference types="vitest" />
import { defineConfig } from "vite";

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
