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
        designer: true,
      },

      parser: tsParser,
      ecmaVersion: 11,
      sourceType: 'script',
    },

    settings: {
      'import/core-modules': ['@wisemapping/web2d'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },

    rules: {
      ...cypress.configs.recommended.rules,
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: {
            parameters: 1,
            body: 1,
          },
          FunctionExpression: {
            parameters: 1,
            body: 1,
          },
          CallExpression: {
            arguments: 1,
          },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
        },
      ],
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
      'no-underscore-dangle': 'off',
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'max-len': [1, 300],
      'class-methods-use-this': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-this-alias': 'off',
      // Warn, to stop new `!`: prefer a check, a default or a typed lookup.
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Type-only imports are erased, so they cannot create runtime import cycles.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

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
    // Type-aware rules: they need the TypeScript program.
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },
  {
    // Build and tool configs, loaded by Node (eslint, vite, storybook) rather than bundled.
    files: [
      'eslint.config.mjs',
      'vite.config.mts',
      'cypress.config.js',
      '.storybook/**/*.{js,mjs}',
    ],
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
    // The Cypress config is CommonJS: Cypress loads it with Node's require.
    files: ['cypress.config.js'],
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
  {
    // Storybook reads named exports (`parameters`, `decorators`) from the preview file.
    files: ['.storybook/preview.js'],
    rules: {
      'import/prefer-default-export': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // Test doubles (mock classes) live next to the test that uses them.
      'max-classes-per-file': 'off',
      // The security tests feed javascript: URLs to the sanitizers on purpose.
      'no-script-url': 'off',
      // Tests index fixtures they build themselves: a wrong index fails the test anyway.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);
