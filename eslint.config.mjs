import js from '@eslint/js';
import globals from 'globals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

// The Vercel functions at the root: the sitemap serverless function and the Edge middleware.
const vercelFiles = ['api/**/*.ts', 'middleware.ts'];

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
      sourceType: 'module',
    },
    rules: {
      'implicit-arrow-linebreak': 'off',
    },
  },
  ...typescriptEslint.configs['flat/recommended'].map((config) => ({
    ...config,
    files: vercelFiles,
  })),
  {
    files: vercelFiles,
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'packages/*/dist/**',
      'packages/*/build/**',
    ],
  },
];
