import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-plugin-react';
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
      react.configs.flat.recommended,
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

    settings: {
      react: {
        version: '19.0.0',
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*'],
        },
      ],

      'react/no-unknown-property': [
        'error',
        {
          ignore: ['css'],
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
