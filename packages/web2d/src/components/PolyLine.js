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
import Element from './Element';
import Toolkit from './Toolkit';
import * as PolyLineUtils from './peer/utils/PolyLineUtils';

const PolyLine = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createPolyLine();
    const defaultAttributes = {
      strokeColor: 'blue',
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
    return 'PolyLine';
  },

  setFrom(x, y) {
    this.peer.setFrom(x, y);
  },

  setTo(x, y) {
    this.peer.setTo(x, y);
  },

  setStyle(style) {
    this.peer.setStyle(style);
  },

  getStyle() {
    return this.peer.getStyle();
  },

  buildCurvedPath(dist, x1, y1, x2, y2) {
    return PolyLineUtils.buildCurvedPath(dist, x1, y1, x2, y2);
  },

  buildStraightPath(dist, x1, y1, x2, y2) {
    return PolyLineUtils.buildStraightPath(dist, x1, y1, x2, y2);
  },
});

export default PolyLine;
