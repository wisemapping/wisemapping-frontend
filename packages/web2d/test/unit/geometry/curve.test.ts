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
  TAPER_AT_DEST_CONTROL,
  TAPER_AT_SRC_CONTROL,
  curvePathData,
  defaultControlPoints,
  taperedOutline,
} from '../../../src/components/geometry/curve';
import { parsePathPoints, pathCommands } from '../../helpers/geometry';

const O = { x: 0, y: 0 };

describe('geometry/curve defaultControlPoints', () => {
  it('puts both points a third of the chord from their end, towards the other end', () => {
    expect(defaultControlPoints(O, { x: 90, y: 30 })).toEqual([
      { x: 30, y: 10 },
      { x: -30, y: -10 },
    ]);
  });

  it.each([
    ['horizontal', { x: 30, y: 0 }],
    ['vertical', { x: 0, y: 30 }],
    ['left-up', { x: -30, y: -60 }],
  ])('works in every direction (%s)', (_name, tar) => {
    const [c1, c2] = defaultControlPoints(O, tar);
    expect(c1).toEqual({ x: tar.x / 3, y: tar.y / 3 });
    expect(c2).toEqual({ x: 0 - tar.x / 3, y: 0 - tar.y / 3 });
  });

  it('is relative to the ends, so moving both ends keeps it', () => {
    expect(defaultControlPoints({ x: 100, y: 50 }, { x: 190, y: 80 })).toEqual(
      defaultControlPoints(O, { x: 90, y: 30 }),
    );
  });

  it('has no negative zero for a zero-length chord', () => {
    const [c1, c2] = defaultControlPoints({ x: 5, y: 5 }, { x: 5, y: 5 });
    expect(Object.is(c1.x, 0) && Object.is(c1.y, 0)).toBe(true);
    expect(Object.is(c2.x, 0) && Object.is(c2.y, 0)).toBe(true);
  });

  it('propagates NaN and Infinity', () => {
    const [c1] = defaultControlPoints(O, { x: NaN, y: Infinity });
    expect(Number.isNaN(c1.x)).toBe(true);
    expect(c1.y).toBe(Infinity);
  });
});

describe('geometry/curve taperedOutline', () => {
  const end = { x: 90, y: 0 };
  const c1 = { x: 30, y: 0 };
  const c2 = { x: 60, y: 0 };

  it('offsets a horizontal curve along y, by the taper shares of the width', () => {
    const pts = taperedOutline(O, c1, c2, end, 10);
    expect(pts).toEqual([
      { x: 0, y: -5 },
      { x: 30, y: -10 * TAPER_AT_SRC_CONTROL },
      { x: 60, y: -10 * TAPER_AT_DEST_CONTROL },
      end,
      { x: 60, y: 10 * TAPER_AT_DEST_CONTROL },
      { x: 30, y: 10 * TAPER_AT_SRC_CONTROL },
      { x: 0, y: 5 },
    ]);
  });

  it('offsets a vertical curve along x, so it keeps its thickness (W-TAPER)', () => {
    const pts = taperedOutline(O, { x: 0, y: 30 }, { x: 0, y: 60 }, { x: 0, y: 90 }, 10);
    expect(pts[0]).toEqual({ x: 5, y: 0 });
    expect(pts[6]).toEqual({ x: -5, y: 0 });
    expect(pts.every((p) => p.y === 0 || p.y === 30 || p.y === 60 || p.y === 90)).toBe(true);
  });

  it('is symmetric about the centre curve', () => {
    const start = { x: 3, y: -7 };
    const k1 = { x: 40, y: 20 };
    const k2 = { x: 50, y: 70 };
    const tip = { x: 100, y: 40 };
    const pts = taperedOutline(start, k1, k2, tip, 8);
    const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    });
    [
      [pts[0]!, pts[6]!, start],
      [pts[1]!, pts[5]!, k1],
      [pts[2]!, pts[4]!, k2],
    ].forEach(([a, b, centre]) => {
      expect(mid(a!, b!).x).toBeCloseTo(centre!.x);
      expect(mid(a!, b!).y).toBeCloseTo(centre!.y);
    });
  });

  it('uses the chord when a control point sits on its end', () => {
    const pts = taperedOutline(O, O, { x: 0, y: 30 }, { x: 0, y: 30 }, 10);
    // The start normal comes from start → control2 (vertical), the end normal from control1 → end.
    expect(pts[0]).toEqual({ x: 5, y: 0 });
    expect(pts[2]).toEqual({ x: 2, y: 30 });
  });

  it('falls back to a vertical offset when every point coincides', () => {
    const pts = taperedOutline(O, O, O, O, 10);
    expect(pts[0]).toEqual({ x: 0, y: -5 });
    expect(pts[6]).toEqual({ x: 0, y: 5 });
  });

  it('is a point for a zero width', () => {
    taperedOutline(O, c1, c2, end, 0).forEach((p, i) => {
      expect(p.y).toBeCloseTo(0);
      expect(p.x).toBe([0, 30, 60, 90, 60, 30, 0][i]);
    });
  });
});

describe('geometry/curve curvePathData', () => {
  it('below width 1 is an open cubic curve with absolute control points', () => {
    expect(
      curvePathData({ x: 10, y: 20 }, { x: 100, y: 50 }, { x: 5, y: 0 }, { x: -5, y: 0 }, 0.5),
    ).toBe('M10.0,20.0 C15.0,20.0 95.0,50.0 100.0,50.0');
  });

  it('from width 1 is a closed, tapered shape', () => {
    const d = curvePathData(O, { x: 90, y: 0 }, { x: 30, y: 0 }, { x: -30, y: 0 }, 10);
    expect(d).toBe('M0.0,-5.0 C30.0,-3.5 60.0,-2.0 90.0,0.0 C60.0,2.0 30.0,3.5 0.0,5.0 Z');
    expect(pathCommands(d)).toEqual(['M', 'C', 'C', 'Z']);
  });

  it('switches at exactly width 1', () => {
    expect(pathCommands(curvePathData(O, { x: 9, y: 0 }, O, O, 0.999))).toEqual(['M', 'C']);
    expect(pathCommands(curvePathData(O, { x: 9, y: 0 }, O, O, 1))).toEqual(['M', 'C', 'C', 'Z']);
  });

  it('never writes -0.0', () => {
    const d = curvePathData({ x: -0.04, y: 0 }, { x: 0, y: -0.01 }, O, O, 0);
    expect(d).toBe('M0.0,0.0 C0.0,0.0 0.0,0.0 0.0,0.0');
  });

  it('draws a zero-length curve as a point, or a dot when tapered', () => {
    expect(curvePathData({ x: 5, y: 5 }, { x: 5, y: 5 }, O, O, 0)).toBe(
      'M5.0,5.0 C5.0,5.0 5.0,5.0 5.0,5.0',
    );
    expect(parsePathPoints(curvePathData(O, O, O, O, 2))).toEqual([
      [0, -1],
      [0, -0.7],
      [0, -0.4],
      [0, 0],
      [0, 0.4],
      [0, 0.7],
      [0, 1],
    ]);
  });

  it('writes NaN and Infinity through, rather than throwing', () => {
    expect(curvePathData({ x: NaN, y: 0 }, { x: Infinity, y: 0 }, O, O, 0)).toBe(
      'MNaN,0.0 CNaN,0.0 Infinity,0.0 Infinity,0.0',
    );
  });
});
