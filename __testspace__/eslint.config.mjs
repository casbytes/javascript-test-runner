import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import html from "eslint-plugin-html";
import * as css from "eslint-plugin-css";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: [
      "test/**/*",
      "tests/**/*",
      "**/__tests__/**",
      "node_modules/**/*",
      "**/*.config.{js,ts,mjs,cjs}",
    ],
    plugins: {
      html,
    },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  css.configs["flat/recommended"],
  jsdoc.configs["flat/recommended"],
  ...tseslint.configs.recommended,
];
