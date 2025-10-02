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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/packages/mindplot/**/*", "**/dist/**/*"]), {
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
            version: "detect",
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
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "react-hooks/rules-of-hooks": "off",
        "react-hooks/exhaustive-deps": "off",

        "no-restricted-imports": ["error", {
            patterns: ["@mui/*/*/*", "!@mui/material/test-utils/*"],
        }],

        "react/no-unknown-property": ["error", {
            ignore: ["css"],
        }],
    },
}]);