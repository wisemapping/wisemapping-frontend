/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const config = {
  // jsdom, plus Node's Fetch API bridged in (jsdom implements none of it).
  testEnvironment: '<rootDir>/test/unit/jsdom-fetch-environment.js',
  verbose: true,
  preset: 'ts-jest',
  // Discovery lives in the config rather than in a shell-expanded CLI glob, so
  // that `yarn test:unit` is just `jest` and behaves the same in every shell.
  testMatch: ['<rootDir>/test/unit/**/*.test.ts', '<rootDir>/test/unit/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/test/unit/setup.ts'],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|jpeg|gif|ttf|woff|woff2|wxml)$':
      'jest-transform-stub',
  },
  moduleNameMapper: {
    // Resolve the sibling workspace packages to their sources, the same way
    // packages/editor and packages/mindplot do, so tests never need a dist build.
    '^@wisemapping/editor$': '<rootDir>/../editor/src/index.ts',
    '^@wisemapping/editor/(.*)$': '<rootDir>/../editor/src/$1',
    '^@wisemapping/mindplot$': '<rootDir>/../mindplot/src/index.ts',
    '^@wisemapping/mindplot/(.*)$': '<rootDir>/../mindplot/src/$1',
    '^@wisemapping/web2d$': '<rootDir>/../web2d/src/index.ts',
    '^@wisemapping/web2d/(.*)$': '<rootDir>/../web2d/src/$1',
    // mindplot lists its icons with Vite's import.meta.glob, which ts-jest (CommonJS) can not
    // compile: reuse mindplot's own test replacement, which lists them from disk.
    '/SvgIconAssets$': '<rootDir>/../mindplot/test/unit/__mocks__/SvgIconAssets.ts',
    // Asset imports carry no behaviour under jsdom.
    '\\.(svg|css|styl|less|sass|scss|png|jpg|jpeg|gif|ttf|woff|woff2|wxml)$': 'jest-transform-stub',
    // react-ga4 touches window.gtag on import; stub it out.
    '^react-ga4$': '<rootDir>/test/unit/mocks/react-ga4.js',
    // react-intl (and @formatjs below it) is ESM-only and cannot be required
    // without --experimental-vm-modules; render defaultMessage instead.
    '^react-intl$': '<rootDir>/test/unit/mocks/react-intl.tsx',
  },
};

module.exports = config;
