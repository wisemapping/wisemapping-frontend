/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $defined } from '../utils/assert';
import PositionType from '../../PositionType';
import ElementPeer from './ElementPeer';

class ArcLinePeer extends ElementPeer {
  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  private _orientation: 'horizontal' | 'vertical';

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    super(svgElement);
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
    this._orientation = 'horizontal';
    this._updatePath();
  }

  setFrom(x1: number, y1: number): void {
    const change = this._x1 !== x1 || this._y1 !== y1;
    this._x1 = x1;
    this._y1 = y1;
    if (change) {
      this._updatePath();
    }
  }

  setTo(x2: number, y2: number) {
    const change = this._x2 !== x2 || this._y2 !== y2;
    this._x2 = x2;
    this._y2 = y2;
    if (change) this._updatePath();
  }

  getFrom(): PositionType {
    return { x: this._x1, y: this._y1 };
  }

  getTo(): PositionType {
    return { x: this._x2, y: this._y2 };
  }

  setStrokeWidth(width: number): void {
    this._native.setAttribute('stroke-width', String(width));
  }

  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this._orientation = orientation;
    this._updatePath();
  }

  getOrientation(): 'horizontal' | 'vertical' {
    return this._orientation;
  }

  private static pointToStr(x: number, y: number) {
    return `${x.toFixed(1)},${y.toFixed(1)} `;
  }

  private _updatePath() {
    // Update style based on width ....
    if ($defined(this._x1) && $defined(this._y1) && $defined(this._x2) && $defined(this._y2)) {
      const fromPoint = ArcLinePeer.pointToStr(this._x1, this._y1);
      const toPoint = ArcLinePeer.pointToStr(this._x2, this._y2);

      let curveP1: string;
      let curveP2: string;

      if (this._orientation === 'vertical') {
        // For vertical tree layout: arc curves horizontally (concave in X direction)
        curveP1 = ArcLinePeer.pointToStr(this._x1 + (this._x2 - this._x1) / 8, this._y1);
        curveP2 = ArcLinePeer.pointToStr(this._x2, this._y2 - (this._y2 - this._y1));
      } else {
        // For horizontal mindmap layout: arc curves vertically (concave in Y direction)
        curveP1 = ArcLinePeer.pointToStr(this._x1, this._y1 + (this._y2 - this._y1) / 8);
        curveP2 = ArcLinePeer.pointToStr(this._x2 - (this._x2 - this._x1), this._y2);
      }

      const path = `M${fromPoint} C${curveP1},${curveP2} ${toPoint}`;
      this._native.setAttribute('d', path);
    }
  }
}

export default ArcLinePeer;
