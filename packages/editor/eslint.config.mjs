import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import cypress from 'eslint-plugin-cypress';

export default defineConfig([
  globalIgnores(['**/dist/**/*']),
  {
    extends: [
      js.configs.recommended,
      prettier,
      react.configs.flat.recommended,
      // The automatic JSX runtime (tsconfig "jsx": "react-jsx"): JSX needs no React in scope.
      react.configs.flat['jsx-runtime'],
      tseslint.configs.recommended,
    ],

    plugins: {
      'react-hooks': reactHooks,
      cypress,
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
      ...cypress.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*'],
        },
      ],
    },
  },
  {
    // The jest setup and module mocks are CommonJS, run by Node.
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
