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

import {
  BRAND_ICON_PATHS,
  GALLERY_ICON_NAMES,
  MATERIAL_ICON_CODEPOINTS,
} from '../../src/components/GalleryIconData';

// That every icon of the editor's image picker is in these tables is checked by the editor
// (test/unit/image-picker/picker-icon-names.test.ts). The codepoints are checked against the
// font by features/material-icon-codepoints.test.ts.
describe('Icon Mapping Validation', () => {
  test('lists the gallery icons', () => {
    expect(GALLERY_ICON_NAMES.length).toBeGreaterThan(100);
  });

  test('draws each icon one way: a font glyph or a brand path', () => {
    expect(
      Object.keys(BRAND_ICON_PATHS).filter((name) => name in MATERIAL_ICON_CODEPOINTS),
    ).toEqual([]);
    expect(new Set(GALLERY_ICON_NAMES).size).toBe(GALLERY_ICON_NAMES.length);
  });

  test('every codepoint is a single character', () => {
    const invalid = Object.entries(MATERIAL_ICON_CODEPOINTS).filter(
      ([, codepoint]) => [...codepoint].length !== 1,
    );
    expect(invalid).toEqual([]);
  });

  test('flash icon should be mapped (regression test)', () => {
    expect(GALLERY_ICON_NAMES).toContain('flash');
    expect(GALLERY_ICON_NAMES).toContain('flash-on');
  });

  test('common Material UI icons should be mapped', () => {
    const commonIcons = [
      'home',
      'star',
      'favorite',
      'settings',
      'search',
      'help',
      'info',
      'warning',
      'error',
    ];
    expect(commonIcons.filter((icon) => !GALLERY_ICON_NAMES.includes(icon))).toEqual([]);
  });
});
