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
import { EDITOR_LAYOUT, EDITOR_Z_INDEX } from '../../../src/theme/layout';

const px = (value: string): number => Number.parseInt(value, 10);

/**
 * The chrome offsets were literals repeated across the formatting toolbar, the
 * zoom toolbar, the creator-info pane and the loading skeleton. These assert
 * the relationships that used to be implicit in those literals, so changing a
 * toolbar's width keeps the others clear of it instead of silently overlapping.
 */
describe('editor layout constants', () => {
  it('keeps the zoom toolbar clear of the formatting toolbar', () => {
    const { formattingToolbar, zoomToolbar } = EDITOR_LAYOUT;
    expect(px(zoomToolbar.right)).toBe(px(formattingToolbar.right) + px(formattingToolbar.width));
  });

  it('insets the compact zoom toolbar less, since nothing sits beside it', () => {
    expect(px(EDITOR_LAYOUT.zoomToolbar.rightCompact)).toBeLessThan(
      px(EDITOR_LAYOUT.zoomToolbar.right),
    );
  });

  it('anchors the creator-info pane to the same edge inset as the formatting toolbar', () => {
    expect(px(EDITOR_LAYOUT.creatorInfoPane.left)).toBe(px(EDITOR_LAYOUT.formattingToolbar.right));
  });

  it('keeps bottom-anchored offsets expressed against the container height', () => {
    expect(EDITOR_LAYOUT.zoomToolbar.top).toContain('calc(100%');
    expect(EDITOR_LAYOUT.creatorInfoPane.top).toContain('calc(100%');
  });

  describe('stacking order', () => {
    it('puts the formatting toolbar above the zoom toolbar', () => {
      expect(EDITOR_Z_INDEX.formattingToolbar).toBeGreaterThan(EDITOR_Z_INDEX.canvasChrome);
    });

    it('puts submenus above every toolbar they open from', () => {
      expect(EDITOR_Z_INDEX.submenu).toBeGreaterThan(EDITOR_Z_INDEX.formattingToolbar);
      expect(EDITOR_Z_INDEX.submenu).toBeGreaterThan(EDITOR_Z_INDEX.canvasChrome);
    });

    it('assigns a distinct layer to each role', () => {
      const layers = Object.values(EDITOR_Z_INDEX);
      expect(new Set(layers).size).toBe(layers.length);
    });
  });
});
