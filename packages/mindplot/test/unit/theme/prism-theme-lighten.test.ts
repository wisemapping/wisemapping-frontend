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
import PrismTheme from '../../../src/components/theme/PrismTheme';
import ColorUtil from '../../../src/components/theme/ColorUtil';
import prismDefault from '../../../src/components/theme/styles/prism-default.json';
import fakeTopic from './FakeTopic';

// Prism lightens its own palette so that it stays visible on the dark canvas.
// It must not do it in the light variant, nor to colours the user picked.
const palette = prismDefault.MainTopic.connectionColor;
const borderPalette = prismDefault.MainTopic.borderColor;

describe('PrismTheme connection and border colours', () => {
  const central = fakeTopic({}, undefined, { central: true });

  describe('light variant', () => {
    const theme = new PrismTheme('light');

    it('uses the palette connection colour as is', () => {
      const main = fakeTopic({}, central, { order: 1 });
      expect(theme.getConnectionColor(main)).toBe(palette[1]);
    });

    it('uses the palette border colour as is', () => {
      const main = fakeTopic({}, central, { order: 1 });
      expect(theme.getBorderColor(main)).toBe(borderPalette[1]);
    });
  });

  describe('dark variant', () => {
    const theme = new PrismTheme('dark');

    it('lightens the palette connection colour', () => {
      const main = fakeTopic({}, central, { order: 1 });
      expect(theme.getConnectionColor(main)).toBe(ColorUtil.lightenColor(palette[1], 20));
    });

    it('lightens the palette border colour', () => {
      const main = fakeTopic({}, central, { order: 1 });
      expect(theme.getBorderColor(main)).toBe(ColorUtil.lightenColor(borderPalette[1], 15));
    });

    it('keeps a connection colour set on the topic', () => {
      const main = fakeTopic({ connectionColor: '#123456' }, central, { order: 1 });
      expect(theme.getConnectionColor(main)).toBe('#123456');
    });

    it('keeps a connection colour inherited from the parent', () => {
      const main = fakeTopic({ connectionColor: '#123456' }, central, { order: 1 });
      const sub = fakeTopic({}, main);
      expect(theme.getConnectionColor(sub)).toBe('#123456');
    });

    it('keeps a border colour set on the topic', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      expect(theme.getBorderColor(main)).toBe('#654321');
    });

    it('keeps a border colour inherited from the parent', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      const sub = fakeTopic({}, main);
      expect(theme.getBorderColor(sub)).toBe('#654321');
    });
  });
});
