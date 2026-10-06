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
import type { LineType } from '../../../src/components/ConnectionLine';
import type { FontStyleType } from '../../../src/components/FontStyleType';
import type { TopicShapeType } from '../../../src/components/model/INodeModel';
import { THEME_TYPES } from '../../../src/components/model/ThemeType';
import {
  isFontStyleType,
  isFontWeightType,
  isTopicShapeType,
} from '../../../src/components/persistence/TopicAttributeTypes';
import ClassicTheme from '../../../src/components/theme/ClassicTheme';
import type { TopicType } from '../../../src/components/theme/Theme';
import type Topic from '../../../src/components/Topic';
import { ThemeStyle } from '../../../src/components/theme/ThemeStyle';
import fakeTopic from './FakeTopic';

const TOPIC_TYPES: TopicType[] = ['CentralTopic', 'MainTopic', 'SubTopic', 'IsolatedTopic'];

// BL5-186: the theme JSON values are checked with the T4 guards instead of cast to their types,
// and DefaultTheme.resolve returns the type of the style it is asked for.
describe('ThemeStyle checks the JSON values (BL5-186)', () => {
  it.each(THEME_TYPES.flatMap((theme) => [`${theme}:light`, `${theme}:dark`]))(
    'every %s style is of its type',
    (name) => {
      const [theme, variant] = name.split(':') as [string, 'light' | 'dark'];
      const style = new ThemeStyle(theme, variant);
      TOPIC_TYPES.forEach((topicType) => {
        const { fontStyle, fontWeight, shapeType } = style.getStyles(topicType);
        expect(isFontStyleType(fontStyle)).toBe(true);
        expect(isFontWeightType(fontWeight)).toBe(true);
        expect(isTopicShapeType(shapeType)).toBe(true);
      });
    },
  );

  it.each([
    [{ fontStyle: 'slanted' }, /Unknown font style: slanted/],
    [{ fontWeight: 'heavy' }, /Unknown font weight: heavy/],
    [{ shapeType: 'hexagon' }, /Unknown shape type: hexagon/],
  ])('rejects the unknown value in %p', (json, error) => {
    const style = new ThemeStyle('classic', 'light');
    const convert = (style as unknown as { convertJsonToTopicStyle: (j: object) => unknown })
      .convertJsonToTopicStyle;
    expect(() => convert.call(style, json)).toThrow(error);
  });
});

// Its typed values, read through a subclass: resolve is protected. ts-jest type-checks the
// return types below, which were all the union of every style value.
class ResolvingTheme extends ClassicTheme {
  shapeType(topic: Topic): TopicShapeType {
    return this.resolve('shapeType', topic);
  }

  fontStyle(topic: Topic): FontStyleType {
    return this.resolve('fontStyle', topic);
  }

  connectionStyle(topic: Topic): LineType {
    return this.resolve('connectionStyle', topic);
  }

  ownFontColor(topic: Topic): string | undefined {
    return this.resolve('fontColor', topic, false);
  }

  // BL5-203: a model sets a single colour, where the theme may set a palette.
  ownConnectionColor(topic: Topic): string | undefined {
    return this.resolve('connectionColor', topic, false);
  }
}

describe('DefaultTheme.resolve is typed by key (BL5-186)', () => {
  const theme = new ResolvingTheme('light');
  const central = fakeTopic({}, undefined, { central: true });
  const main = fakeTopic({ fontStyle: 'italic' }, central);

  it('returns the style type, without a cast', () => {
    expect(theme.shapeType(main)).toBe(theme.getShapeType(main));
    expect(theme.fontStyle(main)).toBe('italic');
    expect(theme.connectionStyle(main)).toBe(theme.getConnectionType(main));
    expect(theme.ownFontColor(main)).toBeUndefined();
    expect(theme.ownConnectionColor(fakeTopic({ connectionColor: '#123456' }, central))).toBe(
      '#123456',
    );
  });
});
