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
import OceanTheme from '../../../src/components/theme/OceanTheme';
import SunriseTheme from '../../../src/components/theme/SunriseTheme';
import RobotTheme from '../../../src/components/theme/RobotTheme';
import { ThemeVariant } from '../../../src/components/theme/Theme';
import oceanDefault from '../../../src/components/theme/styles/ocean-default.json';
import oceanLight from '../../../src/components/theme/styles/ocean-light.json';
import oceanDark from '../../../src/components/theme/styles/ocean-dark.json';
import sunriseDefault from '../../../src/components/theme/styles/sunrise-default.json';
import sunriseLight from '../../../src/components/theme/styles/sunrise-light.json';
import sunriseDark from '../../../src/components/theme/styles/sunrise-dark.json';
import robotDefault from '../../../src/components/theme/styles/robot-default.json';
import robotLight from '../../../src/components/theme/styles/robot-light.json';
import robotDark from '../../../src/components/theme/styles/robot-dark.json';
import ColorUtil from '../../../src/components/theme/ColorUtil';
import fakeTopic from './FakeTopic';

/**
 * Ocean, Sunrise and Robot pick main topic colours from a palette by topic order,
 * and keep any colour the user set on the topic.
 */
type PaletteTheme = OceanTheme | SunriseTheme | RobotTheme;
type Json = {
  CentralTopic?: { backgroundColor?: string; fontColor?: string };
  MainTopic?: { backgroundColor?: string | string[]; connectionColor?: string | string[] };
  SubTopic?: { connectionColor?: string; fontColor?: string };
};

// The JSON a variant reads a key from: the variant file, else light, else default.
const pick = <T>(files: Json[], read: (json: Json) => T | undefined): T =>
  files.map(read).find((value) => value !== undefined) as T;

const themes: Array<[string, (variant: ThemeVariant) => PaletteTheme, Json, Json, Json]> = [
  ['ocean', (v) => new OceanTheme(v), oceanDefault, oceanLight, oceanDark],
  ['sunrise', (v) => new SunriseTheme(v), sunriseDefault, sunriseLight, sunriseDark],
  ['robot', (v) => new RobotTheme(v), robotDefault, robotLight as Json, robotDark as Json],
];
const variants: ThemeVariant[] = ['light', 'dark'];

describe.each(themes)('%s theme', (_name, create, defaults, light, dark) => {
  describe.each(variants)('%s variant', (variant) => {
    const theme = create(variant);
    const files = variant === 'dark' ? [dark, light, defaults] : [light, defaults];
    const central = fakeTopic({}, undefined, { central: true });
    const palette = ([] as string[]).concat(
      pick(files, (json) => json.MainTopic?.backgroundColor) as string | string[],
    );
    const connections = ([] as string[]).concat(
      pick(files, (json) => json.MainTopic?.connectionColor) as string | string[],
    );

    describe('background colour', () => {
      it('keeps the colour set on the topic', () => {
        const main = fakeTopic({ backgroundColor: '#123456' }, central, { order: 3 });
        expect(theme.getBackgroundColor(main)).toBe('#123456');
      });

      it('picks the main topic colour from the palette by order, wrapping around', () => {
        const first = fakeTopic({}, central, { order: 0 });
        const wrapped = fakeTopic({}, central, { order: palette.length + 1 });
        expect(theme.getBackgroundColor(first)).toBe(palette[0]);
        expect(theme.getBackgroundColor(wrapped)).toBe(palette[1 % palette.length]);
      });

      it('treats a topic without order as the first one', () => {
        const main = fakeTopic({}, central);
        expect(theme.getBackgroundColor(main)).toBe(palette[0]);
      });

      it('uses the central topic colour of the theme', () => {
        expect(theme.getBackgroundColor(central)).toBe(
          pick(files, (json) => json.CentralTopic?.backgroundColor),
        );
      });
    });

    describe('font colour', () => {
      it('keeps the colour set on the topic', () => {
        const main = fakeTopic({ fontColor: '#abcdef' }, central, { order: 1 });
        expect(theme.getFontColor(main)).toBe('#abcdef');
      });

      it('inherits a font colour set on an ancestor', () => {
        const main = fakeTopic({ fontColor: '#abcdef' }, central, { order: 1 });
        const sub = fakeTopic({}, main, { order: 0 });
        expect(theme.getFontColor(sub)).toBe('#abcdef');
      });

      it('uses the central topic font colour of the theme, or black or white when unreadable', () => {
        const color = pick(files, (json) => json.CentralTopic?.fontColor) as string;
        const result = theme.getFontColor(central);
        if (result !== color) {
          // Every theme text colour must stay readable on what is behind it.
          expect(['#000000', '#FFFFFF']).toContain(result);
          const background = theme.getBackgroundColor(central);
          expect(ColorUtil.contrastRatio(color, background)!).toBeLessThan(3);
        }
      });
    });

    describe('connection colour', () => {
      it('picks the main topic connection from the palette by order', () => {
        const main = fakeTopic({}, central, { order: connections.length + 2 });
        expect(theme.getConnectionColor(main)).toBe(connections[2 % connections.length]);
      });

      it('connects main topics with a colour set on the central topic, over the palette', () => {
        // The model value is inherited down the tree, the central topic included.
        const coloured = fakeTopic({ connectionColor: '#ff0000' }, undefined, { central: true });
        const main = fakeTopic({}, coloured, { order: 0 });
        expect(theme.getConnectionColor(main)).toBe('#ff0000');
      });

      it('connects a sub topic with the colour picked on its parent', () => {
        const main = fakeTopic({ connectionColor: '#00ff00' }, central, { order: 4 });
        const sub = fakeTopic({}, main, { order: 0 });
        expect(theme.getConnectionColor(sub)).toBe('#00ff00');
      });

      it('connects a sub topic with the colour picked on a farther ancestor', () => {
        const main = fakeTopic({ connectionColor: '#00ff00' }, central, { order: 4 });
        const sub = fakeTopic({}, main, { order: 0 });
        const leaf = fakeTopic({}, sub, { order: 0 });
        expect(theme.getConnectionColor(leaf)).toBe('#00ff00');
      });
    });
  });
});

describe('Ocean and Sunrise background colour', () => {
  it.each([
    ['ocean', new OceanTheme('light'), oceanLight],
    ['sunrise', new SunriseTheme('light'), sunriseLight],
  ] as const)('%s ignores a blank colour set on the topic', (_name, theme, json) => {
    const central = fakeTopic({}, undefined, { central: true });
    const main = fakeTopic({ backgroundColor: '   ' }, central, { order: 0 });
    expect(theme.getBackgroundColor(main)).toBe(json.MainTopic.backgroundColor[0]);
  });
});
