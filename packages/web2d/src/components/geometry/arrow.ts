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
import { PathBuilder, fullPrecision, type Vec } from './path';
import { add } from './vector';

/*
 * The arrow head of Arrow: two wings from the tip, each at 45° from the control direction.
 */

/** The wing length of a thin arrow (stroke width up to 2, the default and mindplot's). */
export const WING_LENGTH = 6;

/** Wider strokes get wings of this many stroke widths, so a thick arrow is not stubby. */
export const WING_LENGTH_PER_WIDTH = 3;

/** The wings scale with the stroke width (BL5-73), but never below WING_LENGTH. */
export const wingLength = (strokeWidth: number): number =>
  Math.max(WING_LENGTH, strokeWidth * WING_LENGTH_PER_WIDTH);

/**
 * The two wings, relative to the tip: the unit control direction turned by -45° and by +45°,
 * `length` long. A zero control direction is taken as pointing down.
 */
export const arrowWings = (control: Vec, length: number): [Vec, Vec] => {
  const norm = Math.hypot(control.x, control.y);
  const ux = norm > 0 ? control.x / norm : 0;
  const uy = norm > 0 ? control.y / norm : 1;

  const cos = Math.SQRT1_2;
  return [
    { x: (ux * cos + uy * cos) * length, y: (uy * cos - ux * cos) * length },
    { x: (ux * cos - uy * cos) * length, y: (uy * cos + ux * cos) * length },
  ];
};

/** The `d` of the arrow head at `tip`: one line per wing, at full precision. */
export const arrowPathData = (tip: Vec, control: Vec, strokeWidth: number): string => {
  const [wing1, wing2] = arrowWings(control, wingLength(strokeWidth));
  const path = new PathBuilder(fullPrecision);
  path.moveTo(tip).lineTo(add(wing1, tip));
  return path.moveTo(tip).lineTo(add(wing2, tip)).toString();
};
