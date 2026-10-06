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
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import ClassicTheme from '../../../src/components/theme/ClassicTheme';
import type ThemeType from '../../../src/components/model/ThemeType';

// A map's XML can carry any theme id (XMLSerializerTango only casts it), so an
// unknown one must not prevent the map from rendering.
describe('ThemeFactory with an unknown theme id', () => {
  afterEach(() => {
    ThemeFactory.clearCache();
    jest.restoreAllMocks();
  });

  it('falls back to the classic theme and warns once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const unknown = 'no-such-theme' as ThemeType;

    const theme = ThemeFactory.createById(unknown, 'light');
    expect(theme).toBeInstanceOf(ClassicTheme);
    expect(ThemeFactory.createById(unknown, 'light')).toBe(theme);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain('no-such-theme');
  });

  it('keeps the variant of the fallback theme', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const unknown = 'no-such-theme' as ThemeType;

    expect(ThemeFactory.createById(unknown, 'dark').getCanvasBackgroundColor()).toBe(
      ThemeFactory.createById('classic', 'dark').getCanvasBackgroundColor(),
    );
  });
});
