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
import ClassicTheme from '../../../src/components/theme/ClassicTheme';
import RobotTheme from '../../../src/components/theme/RobotTheme';
import type { ThemeVariant } from '../../../src/components/theme/Theme';
import classicLight from '../../../src/components/theme/styles/classic-light.json';
import robotDark from '../../../src/components/theme/styles/robot-dark.json';
import robotLight from '../../../src/components/theme/styles/robot-light.json';
import fakeTopic from './FakeTopic';

// robot-light, robot-dark and classic-light define the MainTopic background as
// a palette. The theme has to pick one entry by topic order, the way
// DefaultTheme and OceanTheme do, instead of handing the whole array (which
// stringifies to "#10B981,#F59E0B,...") to the SVG fill.
describe.each([
  ['robot', 'light', (v: ThemeVariant) => new RobotTheme(v), robotLight.MainTopic.backgroundColor],
  ['robot', 'dark', (v: ThemeVariant) => new RobotTheme(v), robotDark.MainTopic.backgroundColor],
  [
    'classic',
    'light',
    (v: ThemeVariant) => new ClassicTheme(v),
    classicLight.MainTopic.backgroundColor,
  ],
] as const)('%s-%s MainTopic background palette', (_name, variant, create, palette) => {
  const theme = create(variant as ThemeVariant);
  const central = fakeTopic({}, undefined, { central: true });

  it.each([0, 1, 3, palette.length + 2])('picks a single colour for order %p', (order) => {
    const main = fakeTopic({}, central, { order });
    expect(theme.getBackgroundColor(main)).toBe(palette[order % palette.length]);
  });

  it('treats a missing order as 0', () => {
    const main = fakeTopic({}, central);
    expect(theme.getBackgroundColor(main)).toBe(palette[0]);
  });

  it('still prefers a colour set on the topic', () => {
    const main = fakeTopic({ backgroundColor: '#123456' }, central, { order: 2 });
    expect(theme.getBackgroundColor(main)).toBe('#123456');
  });

  it('still inherits a colour set on the parent', () => {
    const main = fakeTopic({ backgroundColor: '#abcdef' }, central, { order: 2 });
    const sub = fakeTopic({}, main, { order: 1 });
    expect(theme.getBackgroundColor(sub)).toBe('#abcdef');
  });
});
