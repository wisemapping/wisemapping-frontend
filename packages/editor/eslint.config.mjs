import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import cypress from "eslint-plugin-cypress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/dist/**/*"]), {
    extends: compat.extends(
        "eslint:recommended",
        "prettier",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ),

    plugins: {
        react,
        "@typescript-eslint": typescriptEslint,
        "react-hooks": fixupPluginRules(reactHooks),
        cypress,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 12,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        react: {
            version: "19.0.0",
        },

        "import/resolver": {
            node: {
                extensions: [".js", ".ts"],
            },

            webpack: {
                config: "./webpack.common.js",
            },
        },
    },

    rules: {
        ...cypress.configs.recommended.rules,
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "react-hooks/rules-of-hooks": "off",
        "react-hooks/exhaustive-deps": "off",

        "no-restricted-imports": ["error", {
            patterns: ["@mui/*/*/*", "!@mui/material/test-utils/*"],
        }],
    },
}]);