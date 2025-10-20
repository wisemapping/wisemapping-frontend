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
export const buildCurvedPath = (dist: number, x1: number, y1: number, x2: number, y2: number) => {
  let signx = 1;
  let signy = 1;
  if (x2 < x1) {
    signx = -1;
  }
  if (y2 < y1) {
    signy = -1;
  }

  let path;
  if (Math.abs(y1 - y2) > 2) {
    // For horizontal layout, break at 50% of the horizontal distance
    const middlex = x1 + (x2 - x1) * 0.5;
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${middlex.toFixed(1)}, ${y1.toFixed(
      1,
    )} ${middlex.toFixed(1)}, ${(y2 - 5 * signy).toFixed(1)} ${(middlex + 5 * signx).toFixed(
      1,
    )}, ${y2.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  } else {
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  }

  return path;
};

export const buildStraightPath = (dist: number, x1: number, y1: number, x2: number, y2: number) => {
  // For horizontal layout, break at 50% of the horizontal distance
  const middlex = x1 + (x2 - x1) * 0.5;
  return `${x1}, ${y1} ${middlex}, ${y1} ${middlex}, ${y2} ${x2}, ${y2}`;
};

export const buildVerticalStraightPath = (
  dist: number,
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
  dist: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  let signx = 1;
  if (x2 < x1) {
    signx = -1;
  }

  let path;
  if (Math.abs(x1 - x2) > 2) {
    // For vertical layout, break at 50% of the vertical distance
    const middley = y1 + (y2 - y1) * 0.5;
    // Horizontal segment should stay at same Y (middley), only curve in X direction
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${x1.toFixed(1)}, ${middley.toFixed(
      1,
    )} ${(x1 + 5 * signx).toFixed(1)}, ${middley.toFixed(1)} ${(x2 - 5 * signx).toFixed(
      1,
    )}, ${middley.toFixed(1)} ${x2.toFixed(1)}, ${middley.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  } else {
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  }

  return path;
};
