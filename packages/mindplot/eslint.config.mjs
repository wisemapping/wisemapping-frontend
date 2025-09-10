// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
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

export default defineConfig([{
    extends: compat.extends(
        "airbnb-base",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        cypress,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.jest,
            designer: true,
        },

        parser: tsParser,
        ecmaVersion: 11,
        sourceType: "script",
    },

    settings: {
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
        "operator-linebreak": ["error", "after", {
            overrides: {
                "+": "ignore",
                "-": "ignore",
                ":": "ignore",
                "*": "ignore",
                "?": "ignore",
                ">": "ignore",
                "||": "ignore",
                "&&": "ignore",
                "(": "ignore",
            },
        }],

        "object-curly-newline": "off",
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "no-param-reassign": "off",
        "max-len": [1, 300],
        "class-methods-use-this": "off",
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-non-null-assertion": "off",

        "import/extensions": ["error", "ignorePackages", {
            js: "never",
            jsx: "never",
            ts: "never",
            tsx: "never",
        }],

        "implicit-arrow-linebreak": "off",
    },
}]);