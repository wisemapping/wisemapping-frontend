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
import ElementPeer from './ElementPeer';
import Point from '../../Point';

class StraightLinePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'line');
    super(svgElement);
    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
  }

  setFrom(x1, y1) {
    this._x1 = x1;
    this._y1 = y1;
    this._native.setAttribute('x1', x1);
    this._native.setAttribute('y1', y1);
  }

  setTo(x2, y2) {
    this._x2 = x2;
    this._y2 = y2;
    this._native.setAttribute('x2', x2);
    this._native.setAttribute('y2', y2);
  }

  getFrom() {
    return new Point(this._x1, this._y1);
  }

  getTo() {
    return new Point(this._x2, this._y2);
  }
}

export default StraightLinePeer;
