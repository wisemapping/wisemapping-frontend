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
import { PathBuilder, unsignedFixed, type Vec } from './path';
import { add, firstUnitNormal, offsetAlong } from './vector';

/*
 * The cubic Bézier connector of CurvedLine: its default control points and its outline, a plain
 * curve below width 1 and a tapered, filled shape from width 1.
 */

/** Half the thickness of a tapered line at its source control point, as a share of the width. */
export const TAPER_AT_SRC_CONTROL = 0.35;

/** Half the thickness of a tapered line at its target control point, as a share of the width. */
export const TAPER_AT_DEST_CONTROL = 0.2;

/** Coordinates are written with 1 decimal, and never as `-0.0`. */
const format = unsignedFixed(1);

/**
 * The default control points, relative to their ends: a third of the way along the chord,
 * each pointing towards the other end, so the default curve is the straight chord (W-DEFCP).
 */
export const defaultControlPoints = (src: Vec, tar: Vec): [Vec, Vec] => {
  const x = (tar.x - src.x) / 3;
  const y = (tar.y - src.y) / 3;
  // `0 - v` rather than `-v`, so that no coordinate is -0.
  return [
    { x, y },
    { x: 0 - x, y: 0 - y },
  ];
};

/**
 * The outline of a tapered curve, from `width` at the start to a point at the end, as the seven
 * points of `M p0 C p1 p2 p3 C p4 p5 p6 Z`. The outgoing edge and the returning edge are the
 * centre curve offset to either side, by the same amount, along the normal at each end
 * (W-TAPER). Each edge point is centre ± normal × half-thickness, so the average of both edges
 * is the centre curve itself at every t. `control1` and `control2` are absolute.
 */
export const taperedOutline = (
  start: Vec,
  control1: Vec,
  control2: Vec,
  end: Vec,
  width: number,
): [Vec, Vec, Vec, Vec, Vec, Vec, Vec] => {
  // Normals at the start and at the end, from the curve's tangents there.
  const n1 = firstUnitNormal([
    [start, control1],
    [start, control2],
    [start, end],
  ]);
  const n2 = firstUnitNormal([
    [control2, end],
    [control1, end],
    [start, end],
  ]);

  // Half the thickness at each point of the control polygon.
  const h0 = width / 2;
  const h1 = width * TAPER_AT_SRC_CONTROL;
  const h2 = width * TAPER_AT_DEST_CONTROL;

  return [
    offsetAlong(start, n1, -h0),
    offsetAlong(control1, n1, -h1),
    offsetAlong(control2, n2, -h2),
    end,
    offsetAlong(control2, n2, h2),
    offsetAlong(control1, n1, h1),
    offsetAlong(start, n1, h0),
  ];
};

/**
 * The `d` of a curve from `start` to `end`, with control points relative to their ends
 * (`control1` to the start, `control2` to the end). Below width 1 it is a plain cubic curve;
 * from width 1 it is the closed taperedOutline.
 */
export const curvePathData = (
  start: Vec,
  end: Vec,
  control1: Vec,
  control2: Vec,
  width: number,
): string => {
  const c1 = add(control1, start);
  const c2 = add(control2, end);
  const path = new PathBuilder(format);
  if (width < 1) {
    return path.moveTo(start).curveTo(c1, c2, end).toString();
  }
  const [p0, p1, p2, p3, p4, p5, p6] = taperedOutline(start, c1, c2, end, width);
  path.moveTo(p0).curveTo(p1, p2, p3);
  return path.curveTo(p4, p5, p6).close().toString();
};
