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
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(svg|png|jpg|jpeg|gif)$': 'jest-transform-stub',
    '^@wisemapping/web2d$': '<rootDir>/../web2d/src/index.ts',
    '^@wisemapping/web2d/(.*)$': '<rootDir>/../web2d/src/$1',
  },
  // Unit tests only: Cypress specs and the legacy bundle test run elsewhere.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/cypress/', '/__tests__/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],
  // Ratchet these up as coverage improves; never lower them.
  coverageThreshold: {
    global: { statements: 72, branches: 62, functions: 70, lines: 72 },
  },
};

module.exports = config;
