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

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.min.js',
      '**/*.d.ts',
      'cypress/snapshots/**',
      'storybook/**',
    ],
  },
  {
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
        designer: true,
      },

      parser: tsParser,
      ecmaVersion: 11,
      sourceType: 'script',
    },

    settings: {
      'import-x/core-modules': ['@wisemapping/web2d'],
      'import-x/resolver-next': [createNodeResolver({ extensions: ['.js', '.ts'] })],
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
      // Tooling is a development dependency, declared here or in the root package.json.
      'import-x/no-extraneous-dependencies': [
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
    // Cypress specs and support files run in the browser, with the Cypress and Mocha globals.
    files: ['cypress/{e2e,support}/**/*.js'],
    languageOptions: {
      globals: {
        ...cypress.configs.globals.languageOptions.globals,
        ...globals.mocha,
      },
    },
  },
  {
    // Chai property assertions (`expect(x).to.be.true`) are expressions that assert when read.
    files: ['cypress/e2e/**/*.js'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    // The Cypress plugins run in the Cypress Node process, loaded as CommonJS by cypress.config.js.
    files: ['cypress/plugins/**/*.js'],
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
      'import-x/prefer-default-export': 'off',
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
