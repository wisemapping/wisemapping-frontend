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

/** Parses a `points` list ("x, y x, y" or "x,y x,y") into [x, y] pairs. */
export const parsePoints = (points: string | null): [number, number][] => {
  const nums = (points ?? '')
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((s) => s !== '')
    .map(Number);
  const result: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    result.push([nums[i]!, nums[i + 1]!]);
  }
  return result;
};

/** Every coordinate pair of a path `d` (commands dropped), in order. */
export const parsePathPoints = (d: string | null): [number, number][] =>
  parsePoints((d ?? '').replace(/[A-Za-z]/g, ' '));

/** The path commands of a `d` attribute, in order (for example ['M', 'C', 'Z']). */
export const pathCommands = (d: string | null): string[] => (d ?? '').match(/[A-Za-z]/g) ?? [];

export const hasNaN = (value: string | null): boolean => /NaN|Infinity/.test(value ?? '');

export const extent = (pts: [number, number][]) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};
