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
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transform: {
    // Inline preset-env rather than the root babel.config.json, which sets
    // `modules: false` so that Vite can do its own ESM handling. Jest needs
    // CommonJS, and without this override react-intl -- shipped ESM-only --
    // cannot be required at all, which is why anything rendering a
    // FormattedMessage was previously untestable.
    '^.+\\.m?js$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        babelrc: false,
        configFile: false,
      },
    ],
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '^react-ga4$': '<rootDir>/test/mocks/react-ga4.js',
    // The workspace sources, as tsconfig resolves them, rather than a dist built earlier: a test
    // must see the mindplot it is checked against.
    '^@wisemapping/mindplot$': '<rootDir>/../mindplot/src/index.ts',
    '^@wisemapping/web2d$': '<rootDir>/../web2d/src/index.ts',
    // Uses Vite's import.meta.glob, which ts-jest can not compile: list the icons from disk.
    '/SvgIconAssets$': '<rootDir>/../mindplot/test/unit/__mocks__/SvgIconAssets.ts',
    // Before the transform below gets a chance: assets resolve to a placeholder
    // path rather than jest-transform-stub's empty string, which React rejects
    // when it lands on an <img src>.
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/test/mocks/asset-stub.js',
  },
  // react-intl and the @formatjs packages it depends on are ESM-only, so they
  // have to go through the transform above instead of being skipped.
  transformIgnorePatterns: [
    '/node_modules/(?!(react-intl|intl-messageformat|intl-messageformat-parser|@formatjs)/)',
  ],
};

module.exports = config;
