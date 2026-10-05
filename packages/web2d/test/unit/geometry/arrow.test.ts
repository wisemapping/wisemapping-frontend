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
  WING_LENGTH,
  WING_LENGTH_PER_WIDTH,
  arrowPathData,
  arrowWings,
  wingLength,
} from '../../../src/components/geometry/arrow';
import { parsePathPoints, pathCommands } from '../../helpers/geometry';

const close = (actual: { x: number; y: number }, x: number, y: number) => {
  expect(actual.x).toBeCloseTo(x);
  expect(actual.y).toBeCloseTo(y);
};

describe('geometry/arrow wingLength', () => {
  it('is WING_LENGTH up to stroke width 2', () => {
    expect(wingLength(0)).toBe(WING_LENGTH);
    expect(wingLength(1)).toBe(WING_LENGTH);
    expect(wingLength(2)).toBe(WING_LENGTH);
  });

  it('grows with wider strokes', () => {
    expect(wingLength(5)).toBe(5 * WING_LENGTH_PER_WIDTH);
  });

  it('never goes below WING_LENGTH, even for a negative width', () => {
    expect(wingLength(-4)).toBe(WING_LENGTH);
  });

  it('is NaN for a NaN width, and infinite for an infinite one', () => {
    expect(wingLength(NaN)).toBeNaN();
    expect(wingLength(Infinity)).toBe(Infinity);
  });
});

describe('geometry/arrow arrowWings', () => {
  const s = Math.SQRT1_2 * 10;

  it.each([
    ['right', { x: 1, y: 0 }, [s, -s], [s, s]],
    ['left', { x: -1, y: 0 }, [-s, s], [-s, -s]],
    ['down', { x: 0, y: 1 }, [s, s], [-s, s]],
    ['up', { x: 0, y: -1 }, [-s, -s], [s, -s]],
  ])('turns a %s control direction by -45° and +45°', (_n, control, w1, w2) => {
    const [a, b] = arrowWings(control, 10);
    close(a, w1[0]!, w1[1]!);
    close(b, w2[0]!, w2[1]!);
  });

  it('only depends on the direction, not the length, of the control point', () => {
    expect(arrowWings({ x: 300, y: 400 }, 10)).toEqual(arrowWings({ x: 3, y: 4 }, 10));
  });

  it('takes a zero control direction as pointing down', () => {
    expect(arrowWings({ x: 0, y: 0 }, 10)).toEqual(arrowWings({ x: 0, y: 1 }, 10));
  });

  it('wings are `length` long', () => {
    arrowWings({ x: 3, y: -7 }, 12).forEach((w) => expect(Math.hypot(w.x, w.y)).toBeCloseTo(12));
  });

  it('takes a NaN control direction as pointing down, and is NaN for an infinite one', () => {
    expect(arrowWings({ x: NaN, y: 1 }, 10)).toEqual(arrowWings({ x: 0, y: 1 }, 10));
    const [b] = arrowWings({ x: Infinity, y: 0 }, 10);
    expect(b.x).toBeNaN();
  });
});

describe('geometry/arrow arrowPathData', () => {
  it('draws two lines from the tip, at full precision', () => {
    expect(arrowPathData({ x: 10, y: 20 }, { x: 0, y: 1 }, 1)).toBe(
      `M10,20 L${10 + 6 * Math.SQRT1_2},${20 + 6 * Math.SQRT1_2} M10,20 L${10 - 6 * Math.SQRT1_2},${20 + 6 * Math.SQRT1_2}`,
    );
  });

  it('is M L M L, starting both wings at the tip', () => {
    const d = arrowPathData({ x: -5, y: 7.5 }, { x: 2, y: -3 }, 5);
    expect(pathCommands(d)).toEqual(['M', 'L', 'M', 'L']);
    const pts = parsePathPoints(d);
    expect(pts[0]).toEqual([-5, 7.5]);
    expect(pts[2]).toEqual([-5, 7.5]);
    expect(Math.hypot(pts[1]![0] + 5, pts[1]![1] - 7.5)).toBeCloseTo(15);
  });

  it('writes a negative zero as 0', () => {
    expect(arrowPathData({ x: -0, y: 0 }, { x: 0, y: 1 }, 1)).toMatch(/^M0,0 /);
  });

  it('writes NaN through, rather than throwing', () => {
    expect(arrowPathData({ x: NaN, y: 0 }, { x: 0, y: 1 }, 1)).toMatch(/^MNaN,0 LNaN,/);
  });
});
