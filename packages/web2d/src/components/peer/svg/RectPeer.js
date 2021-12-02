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
import coreJs from '@wisemapping/core-js';
import ElementPeer from './ElementPeer';

const core = coreJs();

/**
 * http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
const RectPeer = new Class({
  Extends: ElementPeer,
  initialize(arc) {
    const svgElement = window.document.createElementNS(this.svgNamespace, 'rect');
    this.parent(svgElement);
    this._arc = arc;
    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
  },

  setPosition(x, y) {
    if (core.Function.$defined(x)) {
      this._native.setAttribute('x', parseInt(x, 10));
    }
    if (core.Function.$defined(y)) {
      this._native.setAttribute('y', parseInt(y, 10));
    }
  },

  getPosition() {
    const x = this._native.getAttribute('x');
    const y = this._native.getAttribute('y');
    return { x: parseInt(x, 10), y: parseInt(y, 10) };
  },

  setSize(width, height) {
    this.parent(width, height);

    const min = width < height ? width : height;
    if (core.Function.$defined(this._arc)) {
      // Transform percentages to SVG format.
      const arc = (min / 2) * this._arc;
      this._native.setAttribute('rx', arc);
      this._native.setAttribute('ry', arc);
    }
  },
});

export default RectPeer;
