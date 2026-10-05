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
import { GALLERY_ICON_NAMES } from '@wisemapping/mindplot';
import { PICKER_ICON_NAMES } from '../../../src/components/action-widget/pane/topic-image-picker/image-icon-tab';

// BL5-155: mindplot draws a picked gallery icon by its name, from a font codepoint or a
// brand path. A picker icon mindplot has no entry for is drawn as nothing.
describe('the image picker icons', () => {
  it('lists the icons', () => {
    expect(PICKER_ICON_NAMES.length).toBeGreaterThan(100);
    expect(new Set(PICKER_ICON_NAMES).size).toBe(PICKER_ICON_NAMES.length);
  });

  it('are all drawn by mindplot', () => {
    const drawn = new Set(GALLERY_ICON_NAMES);
    expect(PICKER_ICON_NAMES.filter((name) => !drawn.has(name))).toEqual([]);
  });
});
