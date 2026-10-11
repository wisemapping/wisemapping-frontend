import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import cypress from 'eslint-plugin-cypress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// Build and tool configs, loaded by Node (eslint, vite, cypress, jest, storybook) rather than bundled.
const toolConfigFiles = [
  'eslint.config.mjs',
  'vite.config.mts',
  'cypress.config.ts',
  'jest.config.js',
  '.storybook/**/*.{mjs,ts}',
];

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.min.js',
      '**/*.d.ts',
      'cypress/**',
      'storybook/**',
    ],
  },
  {
    files: ['src/**/*.{js,ts}', 'test/**/*.{js,ts}', ...toolConfigFiles],
    // ESLint's and import-x's recommended rules, in place of eslint-config-airbnb-base, which
    // stopped at ESLint 8 (2021). import-x is the maintained fork of eslint-plugin-import, whose
    // last release supports ESLint 9 at most.
    extends: [
      js.configs.recommended,
      importX.flatConfigs.recommended,
      ...compat.extends(
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ),
    ],

    plugins: {
      '@typescript-eslint': typescriptEslint,
      cypress,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.jest,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },

    settings: {
      'import-x/resolver-next': [createNodeResolver({ extensions: ['.js', '.ts'] })],
    },

    rules: {
      ...cypress.configs.recommended.rules,
      'no-restricted-syntax': 'off',
      'no-underscore-dangle': 'off',
      'no-plusplus': 'off',
      'max-len': [1, 250],
      'class-methods-use-this': 'off',

      'operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            '+': 'ignore',
            '-': 'ignore',
            ':': 'ignore',
            '*': 'ignore',
            '?': 'ignore',
            '>': 'ignore',
            '||': 'ignore',
            '&&': 'ignore',
            '(': 'ignore',
          },
        },
      ],

      'object-curly-newline': 'off',
      indent: 'off',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      'implicit-arrow-linebreak': 'off',
      'no-confusing-arrow': 'off', // Disabled to avoid conflict with Prettier
      'function-paren-newline': 'off', // Disabled to avoid conflict with Prettier
    },
  },
  {
    files: toolConfigFiles,
    rules: {
      // Tooling is a development dependency, declared here or in the root package.json.
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, packageDir: [__dirname, path.join(__dirname, '../..')] },
      ],
    },
  },
  {
    // Storybook reads named exports (`parameters`, `decorators`) from the preview file.
    files: ['.storybook/preview.ts'],
    rules: {
      'import-x/prefer-default-export': 'off',
    },
  },
]);
