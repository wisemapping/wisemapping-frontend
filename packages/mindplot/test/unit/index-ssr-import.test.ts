/**
 * @jest-environment node
 */
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

// Importing mindplot must not touch the DOM: a server render (SSR) or a worker imports it
// without one. The <mindplot-component> registration only runs where there is a window.
describe('mindplot entry point', () => {
  it('can be imported without a DOM', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof customElements).toBe('undefined');
    // eslint-disable-next-line global-require, @typescript-eslint/no-require-imports
    expect(() => require('../../src/index')).not.toThrow();
  });
});
