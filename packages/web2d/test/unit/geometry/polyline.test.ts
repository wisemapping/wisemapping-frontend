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
  CURVED_CHAMFER,
  MIDDLE_CURVED_CHAMFER,
  STRAIGHT_TOLERANCE_PX,
  buildChamferedElbowPath,
  buildMiddleStraightPath,
  chamferedElbowPoints,
  elbowPoints,
  isWithinStraightTolerance,
} from '../../../src/components/geometry/polyline';
import { parsePoints } from '../../helpers/geometry';

const O = { x: 0, y: 0 };
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

describe('geometry/polyline constants', () => {
  it('chamfers by 5 (Curved) and 10 (MiddleCurved), straight within 5', () => {
    expect([CURVED_CHAMFER, MIDDLE_CURVED_CHAMFER, STRAIGHT_TOLERANCE_PX]).toEqual([5, 10, 5]);
  });
});

describe('geometry/polyline isWithinStraightTolerance', () => {
  it('measures across y when horizontal, and across x when vertical', () => {
    expect(isWithinStraightTolerance(0, 0, 100, 5, 'horizontal')).toBe(true);
    expect(isWithinStraightTolerance(0, 0, 100, 5.01, 'horizontal')).toBe(false);
    expect(isWithinStraightTolerance(0, 0, 5, 100, 'vertical')).toBe(true);
    expect(isWithinStraightTolerance(0, 0, 5.01, 100, 'vertical')).toBe(false);
  });

  it('is symmetric in the direction', () => {
    expect(isWithinStraightTolerance(0, 0, -100, -5, 'horizontal')).toBe(true);
    expect(isWithinStraightTolerance(0, 0, -5, -100, 'vertical')).toBe(true);
  });

  it('holds for coinciding ends, and not for NaN or infinite ones', () => {
    expect(isWithinStraightTolerance(3, 3, 3, 3, 'horizontal')).toBe(true);
    expect(isWithinStraightTolerance(0, 0, 0, NaN, 'horizontal')).toBe(false);
    expect(isWithinStraightTolerance(0, 0, Infinity, 0, 'vertical')).toBe(false);
  });
});

describe('geometry/polyline elbowPoints', () => {
  it('horizontal: breaks at half of x', () => {
    expect(elbowPoints(O, { x: 100, y: 60 }, 'horizontal')).toEqual([
      O,
      { x: 50, y: 0 },
      { x: 50, y: 60 },
      { x: 100, y: 60 },
    ]);
  });

  it('vertical: breaks at half of y', () => {
    expect(elbowPoints(O, { x: 60, y: 100 }, 'vertical')).toEqual([
      O,
      { x: 0, y: 50 },
      { x: 60, y: 50 },
      { x: 60, y: 100 },
    ]);
  });

  it('handles negative directions', () => {
    expect(elbowPoints({ x: 10, y: 10 }, { x: -90, y: -50 }, 'horizontal')[1]).toEqual({
      x: -40,
      y: 10,
    });
    expect(elbowPoints({ x: 10, y: 10 }, { x: -50, y: -90 }, 'vertical')[1]).toEqual({
      x: 10,
      y: -40,
    });
  });

  it.each(ORIENTATIONS)('is the 2 ends within the tolerance, or for a zero length (%s)', (o) => {
    expect(elbowPoints(O, { x: 5, y: 5 }, o)).toEqual([O, { x: 5, y: 5 }]);
    expect(elbowPoints(O, O, o)).toEqual([O, O]);
  });

  it('is the 2 ends for a horizontal line (horizontal) or a vertical one (vertical)', () => {
    expect(elbowPoints(O, { x: 100, y: 0 }, 'horizontal')).toHaveLength(2);
    expect(elbowPoints(O, { x: 0, y: 100 }, 'vertical')).toHaveLength(2);
  });

  it('breaks a vertical line laid out horizontally at the same x', () => {
    expect(elbowPoints(O, { x: 0, y: 100 }, 'horizontal')).toEqual([
      O,
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 0, y: 100 },
    ]);
  });

  it('is NaN, rather than throwing, for a NaN end', () => {
    expect(elbowPoints(O, { x: NaN, y: 100 }, 'horizontal')[1]!.x).toBeNaN();
  });
});

describe('geometry/polyline chamferedElbowPoints', () => {
  it('horizontal: chamfers both corners by the chamfer', () => {
    expect(chamferedElbowPoints(O, { x: 100, y: 100 }, 5, 'horizontal')).toEqual([
      O,
      { x: 45, y: 0 },
      { x: 50, y: 5 },
      { x: 50, y: 95 },
      { x: 55, y: 100 },
      { x: 100, y: 100 },
    ]);
  });

  it('vertical: the same with the axes swapped', () => {
    expect(chamferedElbowPoints(O, { x: 100, y: 100 }, 10, 'vertical')).toEqual([
      O,
      { x: 0, y: 40 },
      { x: 10, y: 50 },
      { x: 90, y: 50 },
      { x: 100, y: 60 },
      { x: 100, y: 100 },
    ]);
  });

  it.each(ORIENTATIONS)('chamfers towards the target going left and up (%s)', (o) => {
    const pts = chamferedElbowPoints(O, { x: -100, y: -100 }, 5, o);
    expect(pts[1]).toEqual(o === 'horizontal' ? { x: -45, y: 0 } : { x: 0, y: -45 });
    expect(pts[5]).toEqual({ x: -100, y: -100 });
  });

  it('clamps the chamfer to half of each leg', () => {
    // |dy| = 12: the chamfer is at most 6 across; |dx| = 8: at most 4 along.
    const pts = chamferedElbowPoints(O, { x: 8, y: 12 }, 10, 'horizontal');
    expect(pts).toEqual([
      O,
      { x: 0, y: 0 },
      { x: 4, y: 4 },
      { x: 4, y: 8 },
      { x: 8, y: 12 },
      { x: 8, y: 12 },
    ]);
  });

  it.each(ORIENTATIONS)('is the 2 ends within the tolerance, or for a zero length (%s)', (o) => {
    expect(chamferedElbowPoints(O, { x: -5, y: -5 }, 5, o)).toEqual([O, { x: -5, y: -5 }]);
    expect(chamferedElbowPoints(O, O, 5, o)).toEqual([O, O]);
  });

  it('a zero chamfer is the plain elbow with doubled corners', () => {
    expect(chamferedElbowPoints(O, { x: 100, y: 60 }, 0, 'horizontal')).toEqual([
      O,
      { x: 50, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 60 },
      { x: 50, y: 60 },
      { x: 100, y: 60 },
    ]);
  });

  it('is NaN, rather than throwing, for a NaN or infinite end', () => {
    expect(chamferedElbowPoints(O, { x: NaN, y: 100 }, 5, 'horizontal')[2]!.x).toBeNaN();
    expect(chamferedElbowPoints(O, { x: Infinity, y: 100 }, 5, 'horizontal')[2]!.x).toBe(Infinity);
  });
});

describe('geometry/polyline buildChamferedElbowPath', () => {
  it('writes the points with 1 decimal, never -0.0', () => {
    expect(buildChamferedElbowPath(-0.04, 0, 99.96, 100, 5, 'horizontal')).toBe(
      '0.0, 0.0 45.0, 0.0 50.0, 5.0 50.0, 95.0 55.0, 100.0 100.0, 100.0',
    );
  });
});

describe('geometry/polyline buildMiddleStraightPath', () => {
  it('horizontal: breaks at the middle x, rounded to whole units', () => {
    expect(buildMiddleStraightPath(0.25, 0, 101, 60, 'horizontal')).toBe(
      '0.25, 0 51, 0 51, 60 101, 60',
    );
  });

  it('vertical: breaks at the middle y, rounded to whole units', () => {
    expect(buildMiddleStraightPath(0, 0.5, 60, 100, 'vertical')).toBe(
      '0, 0.5 0, 50 60, 50 60, 100',
    );
  });

  it.each(ORIENTATIONS)('is the 2 ends at full precision within the tolerance (%s)', (o) => {
    expect(buildMiddleStraightPath(0.125, 0, 4.5, 4.5, o)).toBe('0.125, 0 4.5, 4.5');
  });

  it('keeps the legacy -0 of a middle that rounds to zero from below, but not of the ends', () => {
    expect(buildMiddleStraightPath(-0, 0, -0.6, 100, 'horizontal')).toBe(
      '0, 0 -0, 0 -0, 100 -0.6, 100',
    );
  });

  it('handles negative directions', () => {
    const pts = parsePoints(buildMiddleStraightPath(10, 10, -91, -50, 'horizontal'));
    expect(pts).toEqual([
      [10, 10],
      [-41, 10],
      [-41, -50],
      [-91, -50],
    ]);
  });

  it('writes NaN through, rather than throwing', () => {
    expect(buildMiddleStraightPath(0, 0, NaN, 100, 'horizontal')).toBe(
      '0, 0 NaN, 0 NaN, 100 NaN, 100',
    );
  });
});
