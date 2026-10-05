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
/** The corner chamfer of the `Curved` style. */
export const CURVED_CHAMFER = 5;

/** The corner chamfer of the `MiddleCurved` style. */
export const MIDDLE_CURVED_CHAMFER = 10;

/** Below this offset across the line, the curved styles draw a single straight segment. */
export const CURVED_STRAIGHT_THRESHOLD = 2;

const fixed = (value: number): string => {
  const result = value.toFixed(1);
  return result === '-0.0' ? '0.0' : result;
};

const pointsToStr = (points: [number, number][]): string =>
  points.map(([x, y]) => `${fixed(x)}, ${fixed(y)}`).join(' ');

/**
 * An elbow that breaks at 50% of the distance along the main axis (x when horizontal, y when
 * vertical), with both corners chamfered by the same amount. The chamfer is clamped to half of
 * each leg, so the line never overshoots an end nor turns back (W-HCURVE, W-VCURVE). When the
 * ends are at most CURVED_STRAIGHT_THRESHOLD apart across the main axis, it is a straight segment.
 */
export const buildChamferedElbowPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  chamfer: number,
  orientation: 'horizontal' | 'vertical',
): string => {
  // Work in (along, across) coordinates: along the main axis, and across it.
  const vertical = orientation === 'vertical';
  const a1 = vertical ? y1 : x1;
  const b1 = vertical ? x1 : y1;
  const a2 = vertical ? y2 : x2;
  const b2 = vertical ? x2 : y2;
  const toXY = ([a, b]: [number, number]): [number, number] => (vertical ? [b, a] : [a, b]);

  if (Math.abs(b2 - b1) <= CURVED_STRAIGHT_THRESHOLD) {
    return pointsToStr([
      [x1, y1],
      [x2, y2],
    ]);
  }

  const signA = a2 < a1 ? -1 : 1;
  const signB = b2 < b1 ? -1 : 1;
  const middle = a1 + (a2 - a1) * 0.5;
  const c = Math.min(chamfer, Math.abs(a2 - a1) / 2, Math.abs(b2 - b1) / 2);

  return pointsToStr(
    (
      [
        [a1, b1],
        [middle - c * signA, b1],
        [middle, b1 + c * signB],
        [middle, b2 - c * signB],
        [middle + c * signA, b2],
        [a2, b2],
      ] as [number, number][]
    ).map(toXY),
  );
};

export const buildCurvedPath = (_dist: number, x1: number, y1: number, x2: number, y2: number) =>
  buildChamferedElbowPath(x1, y1, x2, y2, CURVED_CHAMFER, 'horizontal');

export const buildStraightPath = (
  _dist: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  // For horizontal layout, break at 50% of the horizontal distance
  const middlex = x1 + (x2 - x1) * 0.5;
  return `${x1}, ${y1} ${middlex}, ${y1} ${middlex}, ${y2} ${x2}, ${y2}`;
};

export const buildVerticalStraightPath = (
  _dist: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  // For vertical layout, break at 50% of the vertical distance
  const middley = y1 + (y2 - y1) * 0.5;
  return `${x1}, ${y1} ${x1}, ${middley} ${x2}, ${middley} ${x2}, ${y2}`;
};

export const buildVerticalCurvedPath = (
  _dist: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => buildChamferedElbowPath(x1, y1, x2, y2, CURVED_CHAMFER, 'vertical');
