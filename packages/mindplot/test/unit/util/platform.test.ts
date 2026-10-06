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
import isMacPlatform, { hasShortcutModifier } from '../../../src/components/util/platform';

const define = (prop: string, value: unknown): void => {
  Object.defineProperty(window.navigator, prop, { value, configurable: true });
};

describe('isMacPlatform', () => {
  afterEach(() => {
    define('platform', 'MacIntel');
    define('userAgentData', undefined);
  });

  it('prefers userAgentData.platform when the browser provides it', () => {
    define('platform', 'Win32');
    define('userAgentData', { platform: 'macOS' });
    expect(isMacPlatform()).toBe(true);
  });

  it('trusts userAgentData even when it disagrees the other way', () => {
    define('platform', 'MacIntel');
    define('userAgentData', { platform: 'Windows' });
    expect(isMacPlatform()).toBe(false);
  });

  it('falls back to navigator.platform without userAgentData', () => {
    define('userAgentData', undefined);
    define('platform', 'MacIntel');
    expect(isMacPlatform()).toBe(true);
  });

  it.each(['Win32', 'Linux x86_64', 'iPhone', ''])('is false for platform %p', (platform) => {
    define('userAgentData', undefined);
    define('platform', platform);
    expect(isMacPlatform()).toBe(false);
  });

  it('matches case-insensitively', () => {
    define('userAgentData', undefined);
    define('platform', 'macintel');
    expect(isMacPlatform()).toBe(true);
  });

  it('does not throw when userAgentData exists without a platform', () => {
    define('userAgentData', {});
    define('platform', 'MacIntel');
    expect(isMacPlatform()).toBe(true);
  });
});

describe('hasShortcutModifier', () => {
  afterEach(() => {
    define('platform', 'MacIntel');
    define('userAgentData', undefined);
  });

  it.each([
    ['MacIntel', { ctrlKey: false, metaKey: true }, true],
    ['MacIntel', { ctrlKey: true, metaKey: false }, false],
    ['Win32', { ctrlKey: true, metaKey: false }, true],
    ['Win32', { ctrlKey: false, metaKey: true }, false],
    ['Linux x86_64', { ctrlKey: true, metaKey: false }, true],
  ])('on %p, %o is %p', (platform, modifiers, expected) => {
    define('userAgentData', undefined);
    define('platform', platform);
    expect(hasShortcutModifier(modifiers)).toBe(expected);
  });
});
