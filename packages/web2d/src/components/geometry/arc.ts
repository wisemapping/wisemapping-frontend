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
import { fixed, formatPoint, type Vec } from './path';
import type { Orientation } from '../types';

/*
 * The arc connector of ArcLine: a cubic curve that leaves the source along the cross axis and
 * reaches the target along the main axis.
 */

/** Coordinates are written with 1 decimal (a negative zero is kept as `-0.0`). */
const format = fixed(1);

/**
 * The two absolute control points. Horizontal (mind map): the curve first bends along y, an
 * eighth of the way, and arrives level with the target. Vertical (tree): the same with the axes
 * swapped.
 */
export const arcControlPoints = (from: Vec, to: Vec, orientation: Orientation): [Vec, Vec] => {
  if (orientation === 'vertical') {
    return [
      { x: from.x + (to.x - from.x) / 8, y: from.y },
      { x: to.x, y: to.y - (to.y - from.y) },
    ];
  }
  return [
    { x: from.x, y: from.y + (to.y - from.y) / 8 },
    { x: to.x - (to.x - from.x), y: to.y },
  ];
};

/**
 * The `d` of the arc. The legacy spacing (`M0.0,0.0  C0.0,1.0 ,8.0,8.0  8.0,8.0 `, a trailing
 * space after each point and a comma between the control points) is kept, so the output stays
 * byte-identical: browsers parse it the same way.
 */
export const arcPathData = (from: Vec, to: Vec, orientation: Orientation): string => {
  const str = (p: Vec) => `${formatPoint(p, format)} `;
  const [c1, c2] = arcControlPoints(from, to, orientation);
  return `M${str(from)} C${str(c1)},${str(c2)} ${str(to)}`;
};
