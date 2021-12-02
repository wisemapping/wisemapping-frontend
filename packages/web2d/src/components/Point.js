/*
 *    Copyright [2015] [wisemapping]
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

const Point = new Class({
  /**
     * @constructs
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     */
  initialize(x, y) {
    this.x = x;
    this.y = y;
  },

  /**
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     */
  setValue(x, y) {
    this.x = x;
    this.y = y;
  },

  inspect() {
    return `{x:${this.x},y:${this.y}}`;
  },

  clone() {
    return new Point(this.x, this.y);
  },
});

Point.fromString = function pointFromString(point) {
  const values = point.split(',');
  return new Point(values[0], values[1]);
};

export default Point;
