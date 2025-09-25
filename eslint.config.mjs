import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.jest,
      },
      ecmaVersion: 11,
      sourceType: "module",
    },
    rules: {
      "implicit-arrow-linebreak": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
      "packages/*/dist/**",
      "packages/*/build/**",
    ],
  },
];
