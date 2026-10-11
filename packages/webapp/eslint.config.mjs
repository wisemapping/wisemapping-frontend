import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['**/packages/mindplot/**/*', '**/dist/**/*']),
  {
    extends: [
      js.configs.recommended,
      prettier,
      eslintReact.configs['recommended-typescript'],
      tseslint.configs.recommended,
    ],

    plugins: {
      'react-hooks': reactHooks,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // Checked by eslint-plugin-react-hooks above, the React team's own rules: off here so a
      // problem is reported once.
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/exhaustive-deps': 'off',

      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*'],
        },
      ],
    },
  },
  {
    // Chai property assertions (`expect(x).to.be.null`) are expressions that assert when read.
    files: ['cypress/e2e/**/*.cy.ts'],

    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    // The Jest environment and the CommonJS module mocks run in Node, not through the bundler.
    files: ['test/**/*.js'],

    languageOptions: {
      globals: {
        ...globals.node,
      },

      sourceType: 'commonjs',
    },

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
