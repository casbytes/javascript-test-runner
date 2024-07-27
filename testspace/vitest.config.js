import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["**/**.test.{js,ts,jsx,tsx,mjs,cjs,cts,mts}"],
    environment: "node",
    setupFiles: ["./setup-tests-env.js"],
    restoreMocks: true,
  },
});
