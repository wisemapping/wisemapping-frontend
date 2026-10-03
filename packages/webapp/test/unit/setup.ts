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

/**
 * Per-suite setup for the webapp unit tests.
 *
 * The Fetch API itself is installed by `jsdom-fetch-environment.js`, which runs
 * in the Node realm - the jsdom sandbox this file executes in has no way to
 * reach Node's `Response`, so the polyfill cannot live here.
 */

// Guards the environment contract above: a suite that lost the custom
// environment should say so, not fail later with a confusing `Response` error.
beforeAll(() => {
  ['fetch', 'Headers', 'Request', 'Response'].forEach((name) => {
    if (typeof (globalThis as unknown as Record<string, unknown>)[name] !== 'function') {
      throw new Error(
        `${name} is missing from the test global: jest.config.js must keep testEnvironment pointed at test/unit/jsdom-fetch-environment.js`,
      );
    }
  });
});

// Spies installed with jest.spyOn patch shared modules, so drop them between
// tests rather than leaving each suite to remember.
afterEach(() => {
  jest.restoreAllMocks();
});
