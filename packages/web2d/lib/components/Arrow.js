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
 *
 */
const Element = require('./Element').default;
const Toolkit = require('./Toolkit').default;

const Arrow = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createArrow();
    const defaultAttributes = {
      strokeColor: 'black',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'Arrow';
  },

  setFrom(x, y) {
    this.peer.setFrom(x, y);
  },

  setControlPoint(point) {
    this.peer.setControlPoint(point);
  },

  setStrokeColor(color) {
    this.peer.setStrokeColor(color);
  },

  setStrokeWidth(width) {
    this.peer.setStrokeWidth(width);
  },

  setDashed(isDashed, length, spacing) {
    this.peer.setDashed(isDashed, length, spacing);
  },
});

export default Arrow;
