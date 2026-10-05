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

/*
 * The text colour a theme chooses must be readable (WCAG contrast of at least 3:1) on what is
 * behind it, in every theme and variant: the fill of the topic over the canvas, or the canvas
 * itself for the line and none shapes. A colour picked by the user is kept as is.
 */
import { describe, expect, it } from '@jest/globals';
import ColorUtil from '../../../src/components/theme/ColorUtil';
import Theme, { ThemeVariant } from '../../../src/components/theme/Theme';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import { THEME_TYPES } from '../../../src/components/model/ThemeType';
import Topic from '../../../src/components/Topic';
import { themedFakeTopic } from './FakeTopic';

const MIN_CONTRAST = 3;

const textBackdrop = (theme: Theme, topic: Topic): string => {
  const canvas = theme.getCanvasBackgroundColor();
  const shape = theme.getShapeType(topic);
  if (shape === 'line' || shape === 'none') {
    return canvas;
  }
  const fill = theme.getBackgroundColor(topic);
  return ColorUtil.over(fill, canvas) ?? fill;
};

/** The central topic, and the topics of each main topic order down to depth 4. */
const topicsOf = (theme: Theme): Array<[string, Topic]> => {
  const central = themedFakeTopic(theme, {}, undefined, { central: true });
  const result: Array<[string, Topic]> = [['central', central]];
  for (let order = 0; order <= 9; order++) {
    let parent = central;
    for (let depth = 1; depth <= 4; depth++) {
      const topic = themedFakeTopic(theme, {}, parent, { order: depth === 1 ? order : 1 });
      result.push([`main#${order} depth ${depth}`, topic]);
      parent = topic;
    }
  }
  return result;
};

const variants: ThemeVariant[] = ['light', 'dark'];

describe.each(THEME_TYPES.map((id) => [id]))('%s theme text colour', (id) => {
  describe.each(variants)('%s variant', (variant) => {
    const theme = ThemeFactory.createById(id, variant);

    it('can be read on what is behind the text', () => {
      const unreadable = topicsOf(theme)
        .map(([name, topic]) => {
          const color = theme.getFontColor(topic);
          const backdrop = textBackdrop(theme, topic);
          return { name, color, backdrop, contrast: ColorUtil.contrastRatio(color, backdrop) };
        })
        .filter(({ contrast }) => contrast === undefined || contrast < MIN_CONTRAST);
      expect(unreadable).toEqual([]);
    });

    it('keeps a colour picked by the user', () => {
      const central = themedFakeTopic(theme, {}, undefined, { central: true });
      const main = themedFakeTopic(theme, { fontColor: '#fefefe' }, central, { order: 0 });
      const sub = themedFakeTopic(theme, {}, main, { order: 0 });
      expect(theme.getFontColor(main)).toBe('#fefefe');
      expect(theme.getFontColor(sub)).toBe('#fefefe');
    });
  });
});
