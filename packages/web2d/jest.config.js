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
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  // jsdom has no layout: getBBox, getScreenCTM, getComputedTextLength and ResizeObserver are faked.
  setupFiles: ['<rootDir>/test/setup.ts'],
  // Unit tests only: Cypress specs and Storybook stories run elsewhere.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/cypress/', '/__tests__/', '/storybook/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],
  // Set at the measured baseline (rounded down). Ratchet these up as coverage improves; never lower them.
  coverageThreshold: {
    global: { statements: 99, branches: 93, functions: 99, lines: 99 },
    // Pure path geometry and DOM helpers.
    './src/components/peer/utils/': { lines: 98, branches: 93 },
    // Pure geometry (no DOM): every function has direct unit tests.
    './src/components/geometry/': { lines: 95, branches: 90 },
  },
};

module.exports = config;
