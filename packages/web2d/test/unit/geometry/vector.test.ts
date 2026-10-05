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
  EPSILON,
  add,
  firstUnitNormal,
  offsetAlong,
} from '../../../src/components/geometry/vector';

const O = { x: 0, y: 0 };

describe('geometry/vector', () => {
  it('add sums the coordinates', () => {
    expect(add({ x: 1, y: -2 }, { x: -3, y: 4.5 })).toEqual({ x: -2, y: 2.5 });
    expect(add({ x: NaN, y: 1 }, O)).toEqual({ x: NaN, y: 1 });
  });

  it('offsetAlong moves h units along the direction, backwards for a negative h', () => {
    expect(offsetAlong({ x: 1, y: 1 }, { x: 0, y: 1 }, 3)).toEqual({ x: 1, y: 4 });
    expect(offsetAlong({ x: 1, y: 1 }, { x: 1, y: 0 }, -2)).toEqual({ x: -1, y: 1 });
    expect(offsetAlong({ x: 1, y: 1 }, { x: 1, y: 0 }, 0)).toEqual({ x: 1, y: 1 });
  });

  it.each([
    ['right', { x: 10, y: 0 }, { x: -0, y: 1 }],
    ['left', { x: -10, y: 0 }, { x: -0, y: -1 }],
    ['down', { x: 0, y: 10 }, { x: -1, y: 0 }],
    ['up', { x: 0, y: -10 }, { x: 1, y: 0 }],
  ])('firstUnitNormal turns a %s segment by 90°', (_name, b, expected) => {
    const n = firstUnitNormal([[O, b]]);
    expect(n.x).toBeCloseTo(expected.x);
    expect(n.y).toBeCloseTo(expected.y);
  });

  it('firstUnitNormal is a unit vector for a diagonal', () => {
    const n = firstUnitNormal([[O, { x: 3, y: 4 }]]);
    expect(n).toEqual({ x: -0.8, y: 0.6 });
    expect(Math.hypot(n.x, n.y)).toBeCloseTo(1);
  });

  it('firstUnitNormal skips zero-length segments', () => {
    expect(
      firstUnitNormal([
        [O, O],
        [O, { x: EPSILON / 2, y: 0 }],
        [O, { x: 0, y: 2 }],
      ]),
    ).toEqual({ x: -1, y: 0 });
  });

  it('firstUnitNormal falls back to (0, 1) when every segment is a point, or there is none', () => {
    expect(firstUnitNormal([[O, O]])).toEqual({ x: 0, y: 1 });
    expect(firstUnitNormal([])).toEqual({ x: 0, y: 1 });
  });

  it('firstUnitNormal skips NaN segments and is NaN for an infinite one', () => {
    expect(firstUnitNormal([[O, { x: NaN, y: 1 }]])).toEqual({ x: 0, y: 1 });
    const n = firstUnitNormal([[O, { x: Infinity, y: 0 }]]);
    expect(Number.isNaN(n.y)).toBe(true);
  });
});
