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
 * The halo drawn around a selected (or hovered) topic sits behind its text when the shape draws
 * no fill (line, none) or a see-through one. The text must stay readable on it (WCAG contrast of
 * at least 3:1), in every theme and variant.
 */
import { describe, expect, it } from '@jest/globals';
import ColorUtil from '../../../src/components/theme/ColorUtil';
import Theme, { ThemeVariant } from '../../../src/components/theme/Theme';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import { THEME_TYPES } from '../../../src/components/model/ThemeType';
import Topic from '../../../src/components/Topic';
import { FakeModelProps, themedFakeTopic } from './FakeTopic';

const MIN_CONTRAST = 3;

/** What is behind the text while the halo is shown. */
const textBackdropOverHalo = (theme: Theme, topic: Topic, halo: string): string => {
  const shape = theme.getShapeType(topic);
  if (shape === 'line' || shape === 'none') {
    return halo;
  }
  const fill = theme.getBackgroundColor(topic);
  return ColorUtil.over(fill, halo) ?? fill;
};

type Case = { name: string; topic: Topic };

const casesOf = (theme: Theme, props: FakeModelProps): Case[] => {
  const central = themedFakeTopic(theme, props, undefined, { central: true });
  const result: Case[] = [{ name: 'central', topic: central }];
  for (let order = 0; order <= 9; order++) {
    let parent = central;
    for (let depth = 1; depth <= 4; depth++) {
      const topic = themedFakeTopic(theme, props, parent, { order: depth === 1 ? order : 1 });
      result.push({ name: `main#${order} depth ${depth}`, topic });
      parent = topic;
    }
  }
  return result;
};

const variants: ThemeVariant[] = ['light', 'dark'];
const shapes = ['none', 'line', 'rounded rectangle'];

describe.each(THEME_TYPES.map((id) => [id]))('%s theme halo', (id) => {
  describe.each(variants)('%s variant', (variant) => {
    const theme = ThemeFactory.createById(id, variant);

    describe.each(shapes)('%s shape', (shapeType) => {
      it.each([true, false])('keeps the text readable (focused: %p)', (onFocus) => {
        const unreadable = casesOf(theme, { shapeType })
          .map(({ name, topic }) => {
            const color = theme.getFontColor(topic);
            const halo = theme.getOuterBackgroundColor(topic, onFocus);
            const backdrop = textBackdropOverHalo(theme, topic, halo);
            return { name, color, halo, contrast: ColorUtil.contrastRatio(color, backdrop) };
          })
          .filter(({ contrast }) => contrast === undefined || contrast < MIN_CONTRAST);
        expect(unreadable).toEqual([]);
      });
    });

    it('keeps the text readable on a halo behind a see-through fill', () => {
      const unreadable = casesOf(theme, { backgroundColor: 'rgba(255, 255, 255, 0.3)' })
        .map(({ name, topic }) => {
          const color = theme.getFontColor(topic);
          const halo = theme.getOuterBackgroundColor(topic, true);
          const backdrop = textBackdropOverHalo(theme, topic, halo);
          return { name, color, halo, contrast: ColorUtil.contrastRatio(color, backdrop) };
        })
        .filter(({ contrast }) => contrast === undefined || contrast < MIN_CONTRAST);
      expect(unreadable).toEqual([]);
    });
  });
});
