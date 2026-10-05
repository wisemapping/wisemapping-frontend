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
import EmojiCharIcon from '../../../src/components/EmojiCharIcon';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import Topic from '../../../src/components/Topic';

const topic = { getId: () => 7 } as unknown as Topic;

const glyph = (icon: EmojiCharIcon): string | null => icon.getElement().getNode().textContent;

describe('EmojiCharIcon (BL-15)', () => {
  it('shows the emoji of its model', () => {
    const model = new EmojiIconModel({ id: '😀' });
    const icon = new EmojiCharIcon(topic, model, false);

    expect(icon.getModel()).toBe(model);
    expect(glyph(icon)).toBe('😀');
  });

  it('shows the emoji the model has after a change, e.g. an undo', () => {
    const model = new EmojiIconModel({ id: '😀' });
    const icon = new EmojiCharIcon(topic, model, false);

    model.setAttributes({ id: '🎉' });

    expect(glyph(icon)).toBe('🎉');
  });
});
