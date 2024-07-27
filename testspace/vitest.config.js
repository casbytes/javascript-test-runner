import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["**/**.test.{js,ts,jsx,tsx,mjs,cjs,cts,mts}"],
    environment: "node",
    // setupFiles: ["./setupTests.js"],
    restoreMocks: true,
  },
});
