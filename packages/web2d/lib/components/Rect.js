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
const Element = require('./Element').default;
const Toolkit = require('./Toolkit').default;

/**
 * Create a rectangle and variations of a rectangle shape.
 * arc must be specified to create rounded rectangles.
 * arc = "<length>"
 *     For rounded rectangles, radius of the ellipse used to round off the corners of the rectangle.
 */
const Rect = new Class({
  Extends: Element,
  initialize(arc, attributes) {
    if (arc && arc > 1) {
      throw new Error('Arc must be 0<=arc<=1');
    }
    const peer = Toolkit.createRect(arc);
    const defaultAttributes = {
      width: 40, height: 40, x: 5, y: 5, stroke: '1 solid black', fillColor: 'green',
    };

    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'Rect';
  },

  getSize() {
    return this.peer.getSize();
  },
});

export default Rect;
