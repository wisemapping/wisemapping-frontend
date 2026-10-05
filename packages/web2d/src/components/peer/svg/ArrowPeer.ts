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

class ArrowPeer extends ElementPeer {
  static readonly WING_LENGTH = 6;

  private _fromPoint: PositionType;

  private _controlPoint: PositionType | null;

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    super(svgElement);
    this._fromPoint = { x: 0, y: 0 };
    this._controlPoint = null;
  }

  setFrom(x: number, y: number) {
    this._fromPoint = { x, y };
    this._redraw();
  }

  /** The direction the arrow points away from, relative to the tip. It is copied. */
  setControlPoint(point: PositionType) {
    this._controlPoint = { x: point.x, y: point.y };
    this._redraw();
  }

  setStrokeColor(color: string) {
    this.setStroke(null, null, color);
  }

  setStrokeWidth(width: number) {
    this.setStroke(width);
  }

  setDashed(isDashed: boolean, length: number, spacing: number) {
    if ($defined(isDashed) && isDashed && $defined(length) && $defined(spacing)) {
      this._native.setAttribute('stroke-dasharray', `${length},${spacing}`);
    } else {
      this._native.removeAttribute('stroke-dasharray');
    }
  }

  /**
   * Two wings of WING_LENGTH from the tip, each at 45° from the control point direction. A zero
   * control point is taken as pointing down.
   */
  private _redraw() {
    if (this._fromPoint && this._controlPoint) {
      const length = Math.hypot(this._controlPoint.x, this._controlPoint.y);
      const ux = length > 0 ? this._controlPoint.x / length : 0;
      const uy = length > 0 ? this._controlPoint.y / length : 1;

      // The control direction turned by -45° and by +45°.
      const cos = Math.SQRT1_2;
      const l = ArrowPeer.WING_LENGTH;
      const x = (ux * cos + uy * cos) * l;
      const y = (uy * cos - ux * cos) * l;
      const xp = (ux * cos - uy * cos) * l;
      const yp = (uy * cos + ux * cos) * l;

      const { x: fx, y: fy } = this._fromPoint;
      const path = `M${fx},${fy} L${x + fx},${y + fy} M${fx},${fy} L${xp + fx},${yp + fy}`;
      this._native.setAttribute('d', path);
    }
  }
}

export default ArrowPeer;
