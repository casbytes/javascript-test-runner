import { createVitest } from "vitest/node";

const vitest = await createVitest("test", {
  watch: false,
  //   config: "./vitest.config.ts",
});
