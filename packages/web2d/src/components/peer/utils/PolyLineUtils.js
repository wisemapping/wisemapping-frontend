/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
export const buildCurvedPath = (dist, x1, y1, x2, y2) => {
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
    const middlex = x1 + (x2 - x1 > 0 ? dist : -dist);
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${middlex.toFixed(1)}, ${y1.toFixed(
      1,
    )} ${middlex.toFixed(1)}, ${(y2 - 5 * signy).toFixed(1)} ${(
      middlex
        + 5 * signx
    ).toFixed(1)}, ${y2.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  } else {
    path = `${x1.toFixed(1)}, ${y1.toFixed(1)} ${x2.toFixed(1)}, ${y2.toFixed(1)}`;
  }

  return path;
};

export const buildStraightPath = (dist, x1, y1, x2, y2) => {
  const middlex = x1 + (x2 - x1 > 0 ? dist : -dist);
  return `${x1}, ${y1} ${middlex}, ${y1} ${middlex}, ${y2} ${x2}, ${y2}`;
};
