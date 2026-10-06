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
import ColorUtil from '../../../src/components/theme/ColorUtil';
import PrismTheme from '../../../src/components/theme/PrismTheme';
import type { ThemeVariant } from '../../../src/components/theme/Theme';
import type Topic from '../../../src/components/Topic';
import type { FakeModelProps } from './FakeTopic';
import fakeTopic from './FakeTopic';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

const central = fakeTopic({}, undefined, { central: true });
const main = (props: FakeModelProps = {}, order = 0): Topic => fakeTopic(props, central, { order });
const sub = (props: FakeModelProps = {}): Topic => fakeTopic(props, main());

const prism = (variant: ThemeVariant) => new PrismTheme(variant);
const classic = (variant: ThemeVariant) => new ClassicTheme(variant);

describe('ColorUtil contrast', () => {
  it('computes the WCAG contrast ratio', () => {
    expect(ColorUtil.contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(ColorUtil.contrastRatio('#fff', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(ColorUtil.contrastRatio('#FFFFFF', '#EAB308')).toBeCloseTo(1.92, 2);
    expect(ColorUtil.contrastRatio('#FFFFFF', '#696969')).toBeCloseTo(5.49, 2);
  });

  it('cannot compare a colour it does not parse', () => {
    expect(ColorUtil.contrastRatio('red', '#ffffff')).toBeUndefined();
    expect(ColorUtil.parse('red')).toBeUndefined();
    expect(ColorUtil.parse('rgb(1,2)')).toBeUndefined();
  });

  // The colour picker saves rgb(...) colours, so they must be compared too.
  it('parses rgb() and rgba() colours', () => {
    expect(ColorUtil.parse('rgb(224,229,239)')).toEqual({ r: 224, g: 229, b: 239, a: 1 });
    expect(ColorUtil.parse('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(ColorUtil.parse('rgb(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(ColorUtil.contrastRatio('rgb(0,0,0)', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('paints a see-through colour over its backdrop', () => {
    expect(ColorUtil.over('#123456', '#ffffff')).toBe('#123456');
    expect(ColorUtil.over('transparent', '#f2f2f2')).toBe('#f2f2f2');
    expect(ColorUtil.over('#00000080', '#ffffff')).toBe('#7f7f7f');
    expect(ColorUtil.over('rgba(0,0,0,0.5)', '#ffffff')).toBe('#808080');
    expect(ColorUtil.over('red', '#ffffff')).toBeUndefined();
  });
});

// Theme text must stay readable on what is actually behind it: the fill, or the canvas when the
// shape draws no fill (line, none) or the fill is transparent.
describe('theme text colour contrast', () => {
  describe('prism', () => {
    it('keeps white on the saturated fills where it reads (light and dark)', () => {
      // #8B5CF6 (order 0), #EC4899 (1), #EF4444 (2), #3B82F6 (8), #6366F1 (9): 3.5:1 to 4.5:1.
      [0, 1, 2, 8, 9].forEach((order) => {
        expect(prism('light').getFontColor(main({}, order))).toBe(WHITE);
        expect(prism('dark').getFontColor(main({}, order))).toBe(WHITE);
      });
    });

    it('turns white text black on the light fills (light and dark)', () => {
      // #F59E0B, #EAB308, #22C55E, #10B981, #06B6D4: white is below 2.6:1 on them.
      [3, 4, 5, 6, 7].forEach((order) => {
        expect(prism('light').getFontColor(main({}, order))).toBe(BLACK);
        expect(prism('dark').getFontColor(main({}, order))).toBe(BLACK);
      });
    });

    it('draws a line or unfilled main topic in black on the light canvas', () => {
      expect(prism('light').getFontColor(main({ shapeType: 'line' }))).toBe(BLACK);
      expect(prism('light').getFontColor(main({ shapeType: 'none' }))).toBe(BLACK);
      expect(prism('light').getFontColor(main({ backgroundColor: 'transparent' }))).toBe(BLACK);
    });

    it('keeps white for a line main topic on the dark canvas', () => {
      expect(prism('dark').getFontColor(main({ shapeType: 'line' }))).toBe(WHITE);
    });

    // welcome-prism: "5 min tutorial video ?" has a light fill picked by the user, saved as rgb().
    it('turns white text black on a light rgb() fill the user picked', () => {
      expect(prism('light').getFontColor(main({ backgroundColor: 'rgb(224,229,239)' }))).toBe(
        BLACK,
      );
    });

    it('measures against the canvas colour the map sets', () => {
      const onDarkCanvas = main({ shapeType: 'line', canvasColor: '#1a1a1a' });
      expect(prism('light').getFontColor(onDarkCanvas)).toBe(WHITE);
    });

    it('keeps the colours that already read: central and sub topics', () => {
      expect(prism('light').getFontColor(central)).toBe(BLACK);
      expect(prism('dark').getFontColor(central)).toBe(BLACK);
      expect(prism('light').getFontColor(sub())).toBe(BLACK);
      expect(prism('dark').getFontColor(sub())).toBe(WHITE);
    });
  });

  describe('classic', () => {
    it('draws the line main topic in black on the light canvas', () => {
      expect(classic('light').getFontColor(main())).toBe(BLACK);
      expect(classic('light').getFontColor(main({}, 6))).toBe(BLACK);
    });

    it('keeps white on the dark fills', () => {
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((order) => {
        expect(classic('light').getFontColor(main({ shapeType: 'rectangle' }, order))).toBe(WHITE);
      });
    });

    it('keeps white for a line main topic on the dark canvas', () => {
      expect(classic('dark').getFontColor(main())).toBe(WHITE);
    });

    it('turns the grey sub topic text white on the dark canvas, and keeps it on the light one', () => {
      expect(classic('light').getFontColor(sub())).toBe('#525C61');
      expect(classic('dark').getFontColor(sub())).toBe(WHITE);
    });

    it('keeps the colours that already read: central topic', () => {
      expect(classic('light').getFontColor(central)).toBe(BLACK);
      expect(classic('dark').getFontColor(central)).toBe(BLACK);
    });
  });

  it('never changes a colour picked by the user, on the topic or an ancestor', () => {
    expect(prism('light').getFontColor(main({ shapeType: 'line', fontColor: '#FFFFFF' }))).toBe(
      '#FFFFFF',
    );
    const parent = main({ fontColor: '#fefefe' });
    const child = fakeTopic({ shapeType: 'line' }, parent);
    expect(classic('light').getFontColor(child)).toBe('#fefefe');
  });
});
