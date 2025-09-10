// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";
import globals from "globals";
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
    extends: compat.extends("airbnb-base"),
    
    plugins: {
        cypress,
    },
    
    languageOptions: {
        globals: {
            ...globals.browser,
        },
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
        "no-restricted-syntax": "off",
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "max-len": [1, 250],

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
        indent: "off",
    },
}]);