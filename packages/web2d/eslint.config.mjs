import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
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
    extends: compat.extends(
      'airbnb-base',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
    ),

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
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
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

      'import/extensions': [
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
      // These packages publish only an `exports` map, which the import plugin's node resolver
      // does not read. Node resolves them, or the tool would fail to start.
      'import/no-unresolved': [
        'error',
        { ignore: ['^vite$', '^eslint/config$', '^@typescript-eslint/(parser|eslint-plugin)$'] },
      ],
      // Tooling is a development dependency, declared here or in the root package.json.
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, packageDir: [__dirname, path.join(__dirname, '../..')] },
      ],
    },
  },
  {
    // Storybook reads named exports (`parameters`, `decorators`) from the preview file.
    files: ['.storybook/preview.ts'],
    rules: {
      'import/prefer-default-export': 'off',
    },
  },
]);
