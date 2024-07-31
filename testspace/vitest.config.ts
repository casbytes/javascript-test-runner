/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    globals: true,
    sequence: {
      concurrent: true,
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
