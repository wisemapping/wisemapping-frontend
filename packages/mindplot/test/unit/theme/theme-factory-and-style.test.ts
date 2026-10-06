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
import { LineType } from '../../../src/components/ConnectionLine';
import AuroraTheme from '../../../src/components/theme/AuroraTheme';
import ClassicTheme from '../../../src/components/theme/ClassicTheme';
import ColorUtil from '../../../src/components/theme/ColorUtil';
import DefaultTheme from '../../../src/components/theme/DefaultTheme';
import OceanTheme from '../../../src/components/theme/OceanTheme';
import PrismTheme from '../../../src/components/theme/PrismTheme';
import RetroTheme from '../../../src/components/theme/RetroTheme';
import RobotTheme from '../../../src/components/theme/RobotTheme';
import SunriseTheme from '../../../src/components/theme/SunriseTheme';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import { ThemeStyle } from '../../../src/components/theme/ThemeStyle';
import type { TopicType, ThemeVariant } from '../../../src/components/theme/Theme';
import NodeModel from '../../../src/components/model/NodeModel';
import Mindmap from '../../../src/components/model/Mindmap';
import type ThemeType from '../../../src/components/model/ThemeType';
import { THEME_TYPES } from '../../../src/components/model/ThemeType';
import classicDefault from '../../../src/components/theme/styles/classic-default.json';
import classicDark from '../../../src/components/theme/styles/classic-dark.json';
import fakeTopic from './FakeTopic';

const variants: ThemeVariant[] = ['light', 'dark'];

describe('ThemeFactory', () => {
  afterEach(() => {
    ThemeFactory.clearCache();
  });

  it.each([
    ['classic', ClassicTheme],
    ['prism', PrismTheme],
    ['robot', RobotTheme],
    ['sunrise', SunriseTheme],
    ['ocean', OceanTheme],
    ['aurora', AuroraTheme],
    ['retro', RetroTheme],
  ] as const)('creates the %s theme', (id, type) => {
    variants.forEach((variant) => {
      expect(ThemeFactory.createById(id, variant)).toBeInstanceOf(type);
    });
  });

  it('caches one instance per theme and variant', () => {
    ThemeFactory.clearCache();
    const light = ThemeFactory.createById('ocean', 'light');
    expect(ThemeFactory.createById('ocean', 'light')).toBe(light);
    const dark = ThemeFactory.createById('ocean', 'dark');
    expect(dark).not.toBe(light);
    expect(ThemeFactory.getCacheSize()).toBe(2);

    ThemeFactory.clearCache();
    expect(ThemeFactory.getCacheSize()).toBe(0);
    expect(ThemeFactory.createById('ocean', 'light')).not.toBe(light);
  });

  it('reads the legacy dark-prism id as prism', () => {
    expect(ThemeFactory.createById('dark-prism', 'dark')).toBe(
      ThemeFactory.createById('prism', 'dark'),
    );
  });

  it('creates the theme of the mindmap a node belongs to', () => {
    const mindmap = new Mindmap('test');
    mindmap.setTheme('sunrise');
    const model = new NodeModel('MainTopic', mindmap);
    expect(ThemeFactory.create(model, 'dark')).toBe(ThemeFactory.createById('sunrise', 'dark'));
  });
});

describe('ThemeStyle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const topicTypes: TopicType[] = ['CentralTopic', 'MainTopic', 'SubTopic', 'IsolatedTopic'];

  describe.each(THEME_TYPES as unknown as ThemeType[])('%s', (id) => {
    it.each(variants)('has a complete style for every topic type in the %s variant', (variant) => {
      const style = new ThemeStyle(id, variant);
      topicTypes.forEach((type) => {
        const topicStyle = style.getStyles(type);
        expect(topicStyle.fontFamily).toEqual(expect.any(String));
        expect(topicStyle.fontSize).toEqual(expect.any(Number));
        expect(topicStyle.shapeType).toEqual(expect.any(String));
        expect(topicStyle.connectionStyle).toEqual(expect.any(Number));
        expect(topicStyle.msgKey).toEqual(expect.any(String));
      });

      const canvas = style.getCanvasStyle();
      expect(ColorUtil.parse(canvas.backgroundColor)).toBeDefined();
      expect(canvas.opacity).toBeGreaterThan(0);
      expect(typeof canvas.showGrid).toBe('boolean');
    });
  });

  it('applies the variant over the light style, and the light style over the default', () => {
    const light = new ThemeStyle('classic', 'light');
    const dark = new ThemeStyle('classic', 'dark');
    // classic-light.json has no canvas: the default one applies.
    expect(light.getCanvasStyle()).toEqual({
      backgroundColor: classicDefault.Canvas.backgroundColor,
      gridColor: classicDefault.Canvas.gridColor,
      opacity: 1,
      showGrid: true,
      gridPattern: undefined,
    });
    // classic-dark.json overrides the colour and the grid, and keeps the rest.
    expect(dark.getCanvasStyle()).toEqual({
      backgroundColor: classicDark.Canvas.backgroundColor,
      gridColor: classicDefault.Canvas.gridColor,
      opacity: 1,
      showGrid: false,
      gridPattern: undefined,
    });
    // Keys the dark file does not set come from the light and default files.
    expect(dark.getStyles('MainTopic').fontFamily).toBe(light.getStyles('MainTopic').fontFamily);
  });

  it('fails on an unknown theme, after warning about its missing files', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => new ThemeStyle('no-such-theme', 'light')).toThrow(
      'Default styles not found for topic type: CentralTopic',
    );
    expect(String(warn.mock.calls[0]![0])).toContain('no-such-theme-default.json');
  });

  it('reads every connection style a theme can name', () => {
    const style = new ThemeStyle('classic', 'light') as unknown as {
      convertStringToLineType: (name: string) => LineType;
    };
    const names = Object.keys(LineType).filter((key) => Number.isNaN(Number(key)));
    names.forEach((name) => {
      expect(style.convertStringToLineType(name)).toBe(LineType[name as keyof typeof LineType]);
    });
    expect(() => style.convertStringToLineType('ZIGZAG')).toThrow('Unknown connection style');
  });

  it('fails on an unknown topic type', () => {
    const style = new ThemeStyle('classic', 'light');
    expect(() => style.getStyles('Bogus' as TopicType)).toThrow(
      'No styles found for topic type: Bogus',
    );
  });
});

/** The base theme behaviour, which the bundled themes partly override. */
class BaseTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    super(new ThemeStyle('classic', variant), variant);
  }
}

describe('DefaultTheme base colours', () => {
  const theme = new BaseTheme('light');
  const classic = new ThemeStyle('classic', 'light');
  const central = fakeTopic({}, undefined, { central: true });

  it('keeps a background colour set on the topic', () => {
    const main = fakeTopic({ backgroundColor: '#123456' }, central, { order: 0 });
    expect(theme.getBackgroundColor(main)).toBe('#123456');
  });

  it('derives the background of a topic from its border colour', () => {
    const main = fakeTopic({ borderColor: '#000080' }, central, { order: 0 });
    expect(theme.getBackgroundColor(main)).toBe(ColorUtil.lightenColor('#000080', 40));
  });

  it('does not derive the central topic background from its border colour', () => {
    const bordered = fakeTopic({ borderColor: '#000080' }, undefined, { central: true });
    const expected = ([] as string[]).concat(
      classic.getStyles('CentralTopic').backgroundColor as string | string[],
    )[0];
    expect(theme.getBackgroundColor(bordered)).toBe(expected);
  });

  it('picks the theme background by topic order', () => {
    const colors = ([] as string[]).concat(
      classic.getStyles('MainTopic').backgroundColor as string | string[],
    );
    const main = fakeTopic({}, central, { order: colors.length + 1 });
    expect(theme.getBackgroundColor(main)).toBe(colors[1 % colors.length]);
  });

  it('resolves the font colour from the topic, its ancestors, then the theme', () => {
    const main = fakeTopic({ fontColor: '#aa0000' }, central, { order: 0 });
    const sub = fakeTopic({}, main, { order: 0 });
    expect(theme.getFontColor(sub)).toBe('#aa0000');
    expect(theme.getFontColor(central)).toBe(classic.getStyles('CentralTopic').fontColor);
  });
});
