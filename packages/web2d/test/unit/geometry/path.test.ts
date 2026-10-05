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
import {
  PathBuilder,
  fixed,
  formatPoint,
  fullPrecision,
  pointsData,
  unsignedFixed,
} from '../../../src/components/geometry/path';

describe('geometry/path number formats', () => {
  it('fullPrecision writes the number as JavaScript prints it', () => {
    expect(fullPrecision(1.25)).toBe('1.25');
    expect(fullPrecision(-3)).toBe('-3');
    expect(fullPrecision(0)).toBe('0');
    expect(fullPrecision(-0)).toBe('0');
    expect(fullPrecision(1 / 3)).toBe('0.3333333333333333');
    expect(fullPrecision(1e-9)).toBe('1e-9');
  });

  it('fullPrecision writes NaN and Infinity as is', () => {
    expect(fullPrecision(NaN)).toBe('NaN');
    expect(fullPrecision(Infinity)).toBe('Infinity');
    expect(fullPrecision(-Infinity)).toBe('-Infinity');
  });

  it('fixed rounds to the given decimals', () => {
    expect(fixed(1)(1.25)).toBe('1.3');
    expect(fixed(2)(1.005)).toBe('1.00');
    expect(fixed(0)(2.5)).toBe('3');
    expect(fixed(0)(-2.5)).toBe('-3');
    expect(fixed(2)(-10)).toBe('-10.00');
  });

  it('fixed keeps the sign of a negative value that rounds to zero', () => {
    expect(fixed(1)(-0.04)).toBe('-0.0');
    expect(fixed(0)(-0.4)).toBe('-0');
    expect(fixed(1)(-0)).toBe('0.0');
    expect(fixed(1)(0)).toBe('0.0');
  });

  it('fixed writes NaN and Infinity as is', () => {
    expect(fixed(1)(NaN)).toBe('NaN');
    expect(fixed(2)(Infinity)).toBe('Infinity');
    expect(fixed(2)(-Infinity)).toBe('-Infinity');
  });

  it('unsignedFixed drops the sign of a value that rounds to zero', () => {
    expect(unsignedFixed(1)(-0.04)).toBe('0.0');
    expect(unsignedFixed(1)(-0)).toBe('0.0');
    expect(unsignedFixed(0)(-0.4)).toBe('0');
    expect(unsignedFixed(2)(-0.004)).toBe('0.00');
  });

  it('unsignedFixed keeps the sign of other negative values', () => {
    expect(unsignedFixed(1)(-0.05)).toBe('-0.1');
    expect(unsignedFixed(1)(-12.34)).toBe('-12.3');
    expect(unsignedFixed(1)(12.34)).toBe('12.3');
  });

  it('unsignedFixed writes NaN and Infinity as is', () => {
    expect(unsignedFixed(1)(NaN)).toBe('NaN');
    expect(unsignedFixed(1)(-Infinity)).toBe('-Infinity');
  });

  it('formatPoint joins the coordinates with a comma, or the given separator', () => {
    expect(formatPoint({ x: 1, y: -2.5 }, fullPrecision)).toBe('1,-2.5');
    expect(formatPoint({ x: 1, y: -2.5 }, fixed(1), ', ')).toBe('1.0, -2.5');
  });
});

describe('geometry/path pointsData', () => {
  it('writes `x, y` pairs separated by a space', () => {
    expect(
      pointsData(
        [
          { x: 0, y: 1.5 },
          { x: -2, y: 3 },
        ],
        fullPrecision,
      ),
    ).toBe('0, 1.5 -2, 3');
  });

  it('formats every coordinate, and is empty without points', () => {
    expect(pointsData([{ x: -0.04, y: 2 / 3 }], unsignedFixed(1))).toBe('0.0, 0.7');
    expect(pointsData([], fullPrecision)).toBe('');
  });
});

describe('geometry/path PathBuilder', () => {
  it('is empty until a command is added', () => {
    expect(new PathBuilder(fullPrecision).toString()).toBe('');
  });

  it('writes move, line, curve and close commands separated by spaces', () => {
    const d = new PathBuilder(fixed(1))
      .moveTo({ x: 0, y: 0 })
      .lineTo({ x: 10, y: 0 })
      .curveTo({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 })
      .close()
      .toString();
    expect(d).toBe('M0.0,0.0 L10.0,0.0 C1.0,2.0 3.0,4.0 5.0,6.0 Z');
  });

  it('formats every coordinate with its number format', () => {
    const d = new PathBuilder(unsignedFixed(1))
      .moveTo({ x: -0.04, y: 1 / 3 })
      .lineTo({ x: -1.25, y: 2.25 })
      .toString();
    expect(d).toBe('M0.0,0.3 L-1.3,2.3');
  });

  it('writes NaN and Infinity coordinates as is', () => {
    const d = new PathBuilder(fullPrecision)
      .moveTo({ x: NaN, y: Infinity })
      .lineTo({ x: -Infinity, y: 0 })
      .toString();
    expect(d).toBe('MNaN,Infinity L-Infinity,0');
  });

  it('can be written more than once, and grows as commands are added', () => {
    const builder = new PathBuilder(fullPrecision).moveTo({ x: 1, y: 2 });
    expect(builder.toString()).toBe('M1,2');
    builder.lineTo({ x: 3, y: 4 });
    expect(builder.toString()).toBe('M1,2 L3,4');
    expect(`${builder}`).toBe('M1,2 L3,4');
  });
});
