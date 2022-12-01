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
import { $assert } from '@wisemapping/core-js';

class Point {
  /**
   * @constructs
   * @param {Number} x coordinate
   * @param {Number} y coordinate
   */
  constructor(x, y) {
    $assert(typeof x === 'number', `x is not a number: ${x}`);
    $assert(typeof y === 'number', `x is not a number: ${y}`);

    this.x = x;
    this.y = y;
  }

  inspect() {
    return `{x:${this.x},y:${this.y}}`;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

Point.fromString = function pointFromString(point) {
  const values = point.split(',');
  let result = null;
  if (values.lenght > 1) {
    const x = Number.parseInt(values[0], 10);
    const y = Number.parseInt(values[1], 10);

    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      result = new Point(x, y);
    }
  }
  return result;
};

export default Point;
