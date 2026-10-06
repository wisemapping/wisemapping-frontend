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
import { describe, expect, it } from '@jest/globals';
import pickByOrder from '../../../src/components/theme/pickByOrder';
import type { Palette } from '../../../src/components/theme/ThemeStyle';

describe('pickByOrder', () => {
  const palette: Palette = ['#000001', '#000002', '#000003'];

  it('returns a single colour as is, whatever the order', () => {
    expect(pickByOrder('#123456', 0)).toBe('#123456');
    expect(pickByOrder('#123456', 7)).toBe('#123456');
    expect(pickByOrder('#123456', undefined)).toBe('#123456');
  });

  it('picks the palette entry of the topic order', () => {
    expect(pickByOrder(palette, 0)).toBe('#000001');
    expect(pickByOrder(palette, 2)).toBe('#000003');
  });

  it('wraps around the palette length', () => {
    expect(pickByOrder(palette, 3)).toBe('#000001');
    expect(pickByOrder(palette, 8)).toBe('#000003');
  });

  it('treats a missing order as 0', () => {
    expect(pickByOrder(palette, undefined)).toBe('#000001');
  });

  // BL5-221: palettes are typed non-empty, so the first colour is always there.
  it('gives a negative order the first colour', () => {
    expect(pickByOrder(palette, -1)).toBe('#000001');
  });
});
