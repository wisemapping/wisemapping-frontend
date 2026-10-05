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
  buildCurvedPath,
  buildStraightPath,
  buildVerticalCurvedPath,
  buildVerticalStraightPath,
} from '../../src/components/peer/utils/PolyLineUtils';
import { parsePoints } from '../helpers/geometry';

type Builder = typeof buildCurvedPath;

const QUADRANTS: [string, number, number][] = [
  ['right-down', 100, 100],
  ['left-up', -100, -100],
  ['right-up', 100, -100],
  ['left-down', -100, 100],
];

const endsAt = (builder: Builder, x2: number, y2: number) => {
  const pts = parsePoints(builder(10, 0, 0, x2, y2));
  expect(pts[0]).toEqual([0, 0]);
  expect(pts[pts.length - 1]).toEqual([x2, y2]);
  return pts;
};

describe('PolyLineUtils.buildStraightPath (horizontal elbow)', () => {
  it('breaks at 50% of the horizontal distance', () => {
    expect(buildStraightPath(10, 0, 0, 100, 100)).toBe('0, 0 50, 0 50, 100 100, 100');
  });

  it.each(QUADRANTS)('starts and ends at the given points (%s)', (_n, x2, y2) => {
    const pts = endsAt(buildStraightPath, x2, y2);
    expect(pts).toHaveLength(4);
    expect(pts[1]).toEqual([x2 / 2, 0]);
    expect(pts[2]).toEqual([x2 / 2, y2]);
  });

  it('keeps the input precision', () => {
    expect(buildStraightPath(10, 0.25, 1, 10.5, 7.5)).toBe('0.25, 1 5.375, 1 5.375, 7.5 10.5, 7.5');
  });
});

describe('PolyLineUtils.buildVerticalStraightPath (vertical elbow)', () => {
  it('breaks at 50% of the vertical distance', () => {
    expect(buildVerticalStraightPath(10, 0, 0, 100, 100)).toBe('0, 0 0, 50 100, 50 100, 100');
  });

  it.each(QUADRANTS)('starts and ends at the given points (%s)', (_n, x2, y2) => {
    const pts = endsAt(buildVerticalStraightPath, x2, y2);
    expect(pts[1]).toEqual([0, y2 / 2]);
    expect(pts[2]).toEqual([x2, y2 / 2]);
  });
});

describe('PolyLineUtils.buildCurvedPath (horizontal, chamfered)', () => {
  it('chamfers both corners by 5 units', () => {
    expect(buildCurvedPath(10, 0, 0, 100, 100)).toBe(
      '0.0, 0.0 45.0, 0.0 50.0, 5.0 50.0, 95.0 55.0, 100.0 100.0, 100.0',
    );
  });

  it.each(QUADRANTS)('starts and ends at the given points (%s)', (_n, x2, y2) => {
    const pts = endsAt(buildCurvedPath, x2, y2);
    expect(pts).toHaveLength(6);
  });

  it.each(QUADRANTS)('differs from the straight elbow (%s)', (_n, x2, y2) => {
    const curved = parsePoints(buildCurvedPath(10, 0, 0, x2, y2));
    const straight = parsePoints(buildStraightPath(10, 0, 0, x2, y2));
    expect(curved).not.toEqual(straight);
  });

  it('chamfers towards the target in every quadrant', () => {
    expect(parsePoints(buildCurvedPath(10, 0, 0, -100, -100))).toEqual([
      [0, 0],
      [-45, 0],
      [-50, -5],
      [-50, -95],
      [-55, -100],
      [-100, -100],
    ]);
  });

  it('draws a straight segment when |dy| <= 2', () => {
    expect(buildCurvedPath(10, 0, 0, 100, 2)).toBe('0.0, 0.0 100.0, 2.0');
    expect(buildCurvedPath(10, 0, 0, 100, 0)).toBe('0.0, 0.0 100.0, 0.0');
  });

  it('handles equal points', () => {
    expect(buildCurvedPath(10, 5, 5, 5, 5)).toBe('5.0, 5.0 5.0, 5.0');
  });

  it('never prints -0.0', () => {
    expect(buildCurvedPath(10, -0.04, 0, 100, 0.01)).toBe('0.0, 0.0 100.0, 0.0');
  });

  it('rounds to one decimal', () => {
    expect(buildCurvedPath(10, 0.04, 0, 20.06, 50)).toBe(
      '0.0, 0.0 5.0, 0.0 10.0, 5.0 10.0, 45.0 15.0, 50.0 20.1, 50.0',
    );
  });

  // W-HCURVE: only the second corner used to be chamfered, so the shape was asymmetric.
  it('W-HCURVE: chamfers both corners symmetrically', () => {
    const pts = parsePoints(buildCurvedPath(10, 0, 0, 100, 100));
    expect(pts).toEqual([
      [0, 0],
      [45, 0],
      [50, 5],
      [50, 95],
      [55, 100],
      [100, 100],
    ]);
  });

  // W-HCURVE: the 5 unit chamfer used not to be clamped.
  it('W-HCURVE: never overshoots the target when |dy| is small', () => {
    const pts = parsePoints(buildCurvedPath(10, 0, 0, 100, 4));
    pts.forEach(([, y]) => {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(4);
    });
  });

  it('W-HCURVE: never overshoots the target when |dx| is small', () => {
    const pts = parsePoints(buildCurvedPath(10, 0, 0, 6, 100));
    pts.forEach(([x]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(6);
    });
  });
});

describe('PolyLineUtils.buildVerticalCurvedPath (vertical)', () => {
  it('chamfers both corners by 5 units', () => {
    expect(buildVerticalCurvedPath(10, 0, 0, 100, 100)).toBe(
      '0.0, 0.0 0.0, 45.0 5.0, 50.0 95.0, 50.0 100.0, 55.0 100.0, 100.0',
    );
  });

  it.each([
    [100, 4],
    [6, 100],
    [-6, -100],
  ])('never overshoots the target (%d,%d)', (x2, y2) => {
    const pts = parsePoints(buildVerticalCurvedPath(10, 0, 0, x2, y2));
    pts.forEach(([x, y]) => {
      expect(Math.abs(x)).toBeLessThanOrEqual(Math.abs(x2));
      expect(Math.sign(x) * Math.sign(x2)).not.toBe(-1);
      expect(Math.abs(y)).toBeLessThanOrEqual(Math.abs(y2));
      expect(Math.sign(y) * Math.sign(y2)).not.toBe(-1);
    });
  });

  it.each(QUADRANTS)('starts and ends at the given points (%s)', (_n, x2, y2) => {
    endsAt(buildVerticalCurvedPath, x2, y2);
  });

  it('draws a straight segment when |dx| <= 2', () => {
    expect(buildVerticalCurvedPath(10, 0, 0, 2, 100)).toBe('0.0, 0.0 2.0, 100.0');
  });

  it('goes left when the target is on the left', () => {
    const pts = parsePoints(buildVerticalCurvedPath(10, 0, 0, -100, 100));
    expect(pts[2]).toEqual([-5, 50]);
    expect(pts[3]).toEqual([-95, 50]);
  });

  // W-VCURVE: all middle points used to lie on y = middle, so the "curved" vertical line looked
  // exactly like the straight elbow, with no rounding at the corners.
  it('W-VCURVE: rounds the corners (not every middle point on y = middle)', () => {
    const pts = parsePoints(buildVerticalCurvedPath(10, 0, 0, 100, 100));
    const middle = pts.slice(1, -1);
    expect(middle.some(([, y]) => y !== 50)).toBe(true);
  });

  it('W-VCURVE: differs from the vertical straight elbow as a shape', () => {
    // Dropping collinear points, the curved path must not reduce to the straight elbow.
    const dedupe = (pts: [number, number][]) =>
      pts.filter((p, i) => {
        const prev = pts[i - 1];
        const next = pts[i + 1];
        if (!prev || !next) return true;
        const cross = (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0]);
        return cross !== 0;
      });
    const curved = dedupe(parsePoints(buildVerticalCurvedPath(10, 0, 0, 100, 100)));
    const straight = dedupe(parsePoints(buildVerticalStraightPath(10, 0, 0, 100, 100)));
    expect(curved).not.toEqual(straight);
  });
});
