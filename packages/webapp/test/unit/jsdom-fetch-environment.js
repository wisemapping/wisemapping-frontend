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
 * jsdom ships no Fetch API: `fetch`, `Response` and `Request` are absent and its
 * stand-alone `Headers` does not interoperate with them. Production code such as
 * `src/utils/response.ts` builds real `Response` objects, so this environment
 * bridges Node's (undici) implementation into the jsdom sandbox.
 *
 * This file is loaded by Jest in the Node realm, which is why `globalThis` here
 * still has the Fetch API. The polyfill belongs to the test harness, never to
 * `src/` — the application runs in browsers that implement all of it natively.
 */
const JsdomEnvironment = require('jest-environment-jsdom').default;

// Replaced as a set so the four classes always come from the same implementation.
const FETCH_API = ['fetch', 'Headers', 'Request', 'Response'];

class JsdomFetchEnvironment extends JsdomEnvironment {
  constructor(...args) {
    super(...args);

    FETCH_API.forEach((name) => {
      if (typeof globalThis[name] !== 'undefined') {
        this.global[name] = globalThis[name];
      }
    });

    this.silenceUnimplementedNavigation();
  }

  /**
   * jsdom cannot navigate, so every `window.location.href = ...` the app does
   * raises a jsdomError that Jest prints as a multi-frame stack trace. The
   * assignment itself is the behaviour under test, not a failure, and
   * `window.location` is [LegacyUnforgeable] so it cannot be stubbed from a
   * test. Drop just that one error and leave every other jsdomError intact.
   */
  silenceUnimplementedNavigation() {
    const virtualConsole = this.dom && this.dom.virtualConsole;
    if (!virtualConsole) {
      return;
    }

    const forward = virtualConsole.listeners('jsdomError');
    virtualConsole.removeAllListeners('jsdomError');
    virtualConsole.on('jsdomError', (error) => {
      const message = (error && error.message) || '';
      if (error && error.type === 'not implemented' && message.includes('navigation')) {
        return;
      }
      forward.forEach((listener) => listener(error));
    });
  }
}

module.exports = JsdomFetchEnvironment;
