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
import type { Vec } from './path';

/** Below this length, a segment is taken as a single point. */
export const EPSILON = 1e-9;

/** `p + v`. */
export const add = (p: Vec, v: Vec): Vec => ({ x: p.x + v.x, y: p.y + v.y });

/** `p + n × h`: the point `h` units from `p` along the direction `n`. */
export const offsetAlong = (p: Vec, n: Vec, h: number): Vec => ({
  x: p.x + n.x * h,
  y: p.y + n.y * h,
});

/**
 * The unit normal (the direction turned 90°) of the first segment, among `segments`, whose
 * ends do not coincide. Falls back to the normal of a left-to-right line, (0, 1), when all of
 * them do.
 */
export const firstUnitNormal = (segments: readonly (readonly [Vec, Vec])[]): Vec => {
  for (const [a, b] of segments) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length > EPSILON) {
      return { x: -dy / length, y: dx / length };
    }
  }
  return { x: 0, y: 1 };
};
