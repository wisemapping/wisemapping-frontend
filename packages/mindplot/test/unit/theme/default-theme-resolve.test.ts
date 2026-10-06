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
import { LineType } from '../../../src/components/ConnectionLine';
import ClassicTheme from '../../../src/components/theme/ClassicTheme';
import DefaultTheme from '../../../src/components/theme/DefaultTheme';
import type { ThemeStyle } from '../../../src/components/theme/ThemeStyle';
import fakeTopic from './FakeTopic';

// LineType is a numeric enum and THIN_CURVED is its first member, so a topic
// explicitly set to thin-curved carries the value 0. None of the built-in
// themes default to THIN_CURVED, so treating 0 as "unset" silently replaces
// the user's choice.
describe('DefaultTheme.resolve with falsy explicit values', () => {
  const theme = new ClassicTheme('light');

  it('keeps an explicit THIN_CURVED connection style on the topic', () => {
    const central = fakeTopic({}, undefined, { central: true });
    const main = fakeTopic({ connectionStyle: LineType.THIN_CURVED }, central);

    expect(theme.getConnectionType(main)).toBe(LineType.THIN_CURVED);
  });

  it('does not let the parent style override an explicit THIN_CURVED', () => {
    const central = fakeTopic({}, undefined, { central: true });
    const main = fakeTopic({ connectionStyle: LineType.POLYLINE_MIDDLE }, central);
    const sub = fakeTopic({ connectionStyle: LineType.THIN_CURVED }, main);

    expect(theme.getConnectionType(sub)).toBe(LineType.THIN_CURVED);
  });

  it('inherits THIN_CURVED from a parent that set it explicitly', () => {
    const central = fakeTopic({}, undefined, { central: true });
    const main = fakeTopic({ connectionStyle: LineType.THIN_CURVED }, central);
    const sub = fakeTopic({}, main);

    expect(theme.getConnectionType(sub)).toBe(LineType.THIN_CURVED);
  });

  it('still falls back to the theme default when nothing is set', () => {
    const central = fakeTopic({}, undefined, { central: true });
    const main = fakeTopic({}, central);

    expect(theme.getConnectionType(main)).toBe(LineType.THICK_CURVED);
  });
});

describe('DefaultTheme.getCanvasOpacity', () => {
  const themeWithOpacity = (opacity: number | undefined): DefaultTheme =>
    new DefaultTheme(
      { getCanvasStyle: () => ({ backgroundColor: '#ffffff', opacity }) } as unknown as ThemeStyle,
      'light',
    );

  it('keeps an explicit opacity of 0', () => {
    expect(themeWithOpacity(0).getCanvasOpacity()).toBe(0);
  });

  it('defaults to 1 when no opacity is defined', () => {
    expect(themeWithOpacity(undefined).getCanvasOpacity()).toBe(1);
  });

  it('returns the configured opacity', () => {
    expect(themeWithOpacity(0.92).getCanvasOpacity()).toBe(0.92);
  });
});
