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
import oceanLight from '../../../src/components/theme/styles/ocean-light.json';
import oceanDark from '../../../src/components/theme/styles/ocean-dark.json';
import sunriseLight from '../../../src/components/theme/styles/sunrise-light.json';
import sunriseDark from '../../../src/components/theme/styles/sunrise-dark.json';
import fakeTopic from './FakeTopic';

// A border colour picked by the user is kept as is and inherited by the descendants. Unlike Prism,
// these themes do not lighten their palette in the dark variant: the dark JSON has its own palette.
const themes: Array<[string, (variant: ThemeVariant) => OceanTheme | SunriseTheme | RobotTheme]> = [
  ['ocean', (v) => new OceanTheme(v)],
  ['sunrise', (v) => new SunriseTheme(v)],
  ['robot', (v) => new RobotTheme(v)],
];
const variants: ThemeVariant[] = ['light', 'dark'];

describe.each(themes)('%s theme border colour', (_name, create) => {
  describe.each(variants)('%s variant', (variant) => {
    const theme = create(variant);
    const central = fakeTopic({}, undefined, { central: true });

    it('keeps a border colour set on the topic', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      expect(theme.getBorderColor(main)).toBe('#654321');
    });

    it('inherits a border colour picked on the parent', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      const sub = fakeTopic({}, main, { order: 2 });
      expect(theme.getBorderColor(sub)).toBe('#654321');
    });

    it('inherits a border colour picked on a farther ancestor', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      const sub = fakeTopic({}, main, { order: 2 });
      const leaf = fakeTopic({}, sub, { order: 3 });
      expect(theme.getBorderColor(leaf)).toBe('#654321');
    });

    it('prefers the colour of the topic over the one of its parent', () => {
      const main = fakeTopic({ borderColor: '#654321' }, central, { order: 1 });
      const sub = fakeTopic({ borderColor: '#123456' }, main, { order: 2 });
      expect(theme.getBorderColor(sub)).toBe('#123456');
    });
  });
});

describe.each([
  ['ocean', (v: ThemeVariant) => new OceanTheme(v), oceanLight, oceanDark],
  ['sunrise', (v: ThemeVariant) => new SunriseTheme(v), sunriseLight, sunriseDark],
] as const)('%s theme palette border colour', (_name, create, light, dark) => {
  const central = fakeTopic({}, undefined, { central: true });

  it('uses the light palette as is, by topic order', () => {
    const main = fakeTopic({}, central, { order: 1 });
    expect(create('light').getBorderColor(main)).toBe(light.MainTopic.borderColor[1]);
  });

  it('uses the dark palette as is, by topic order', () => {
    const main = fakeTopic({}, central, { order: 1 });
    expect(create('dark').getBorderColor(main)).toBe(dark.MainTopic.borderColor[1]);
  });
});
