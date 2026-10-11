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

import fs from 'fs';
import path from 'path';
import { createAppTheme } from '../../../src/theme';

// The script index.html runs before the app loads, to paint the page in the theme's background.
const html = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf8');
const script = html.match(/<script id="theme-preload">([\s\S]*?)<\/script>/)?.[1] ?? '';

const css = (color: string): string => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
};

const runPreload = (): CSSStyleDeclaration => {
  const root = document.documentElement;
  root.removeAttribute('style');
  new Function(script)();
  return root.style;
};

const prefersDark = (dark: boolean) => {
  window.matchMedia = jest.fn().mockReturnValue({ matches: dark }) as typeof window.matchMedia;
};

describe('theme preload (index.html)', () => {
  afterEach(() => {
    localStorage.removeItem('themeMode');
    document.documentElement.removeAttribute('style');
  });

  test('is there', () => {
    expect(script).toContain('themeMode');
  });

  test.each(['light', 'dark'] as const)(
    'paints the %s mode chosen by the user in that theme background',
    (mode) => {
      prefersDark(mode === 'light');
      localStorage.setItem('themeMode', mode);

      const style = runPreload();

      expect(style.backgroundColor).toBe(css(createAppTheme(mode).palette.background.default));
      expect(style.colorScheme).toBe(mode);
    },
  );

  test.each([
    [true, 'dark'],
    [false, 'light'],
  ] as const)('without a choice follows the system (dark: %s)', (dark, mode) => {
    prefersDark(dark);

    const style = runPreload();

    expect(style.backgroundColor).toBe(css(createAppTheme(mode).palette.background.default));
  });
});
