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
import PositionType from '../../PositionType';
import ElementPeer from './ElementPeer';

/**
 * http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
class RectPeer extends ElementPeer {
  private _arc: number;

  constructor(arc: number) {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    super(svgElement);
    this._arc = arc;
    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
  }

  setPosition(x: number, y: number) {
    if ($defined(x)) {
      this._native.setAttribute('x', x.toFixed(0));
    }
    if ($defined(y)) {
      this._native.setAttribute('y', y.toFixed(0));
    }
  }

  getPosition(): PositionType {
    const x = this._native.getAttribute('x');
    const y = this._native.getAttribute('y');
    return { x: Number.parseInt(x!, 10), y: Number.parseInt(y!, 10) };
  }

  setSize(width: number, height: number): void {
    super.setSize(width, height);
    const min = width < height ? width : height;

    if ($defined(this._arc)) {
      // Transform percentages to SVG format.
      const arc = (min / 2) * this._arc;
      this._native.setAttribute('rx', arc.toFixed(0));
      this._native.setAttribute('ry', arc.toFixed(0));
    }
  }
}

export default RectPeer;
