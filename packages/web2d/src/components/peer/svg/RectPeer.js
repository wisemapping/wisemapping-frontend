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
import { $defined } from '@wisemapping/core-js';
import ElementPeer from './ElementPeer';

/**
 * http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
class RectPeer extends ElementPeer {
  constructor(arc) {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'rect');
    super(svgElement);
    this._arc = arc;
    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
  }

  setPosition(x, y) {
    if ($defined(x)) {
      this._native.setAttribute('x', parseInt(x, 10));
    }
    if ($defined(y)) {
      this._native.setAttribute('y', parseInt(y, 10));
    }
  }

  getPosition() {
    const x = this._native.getAttribute('x');
    const y = this._native.getAttribute('y');
    return { x: parseInt(x, 10), y: parseInt(y, 10) };
  }

  setSize(width, height) {
    super.setSize(width, height);
    const min = width < height ? width : height;
    if ($defined(this._arc)) {
      // Transform percentages to SVG format.
      const arc = (min / 2) * this._arc;
      this._native.setAttribute('rx', arc);
      this._native.setAttribute('ry', arc);
    }
  }
}

export default RectPeer;
