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
import { arrowPathData } from '../../geometry/arrow';
import ElementPeer from './ElementPeer';
import type { StrokeStyle } from '../../types';

class ArrowPeer extends ElementPeer<SVGPathElement> {
  private _fromPoint: PositionType;

  private _controlPoint: PositionType | null;

  private _strokeWidth: number;

  constructor() {
    super(ElementPeer.createNode('path'));
    this._fromPoint = { x: 0, y: 0 };
    this._controlPoint = null;
    this._strokeWidth = 1;
  }

  setFrom(x: number, y: number) {
    if (this._fromPoint.x === x && this._fromPoint.y === y && this.hasPath()) {
      return;
    }
    this._fromPoint = { x, y };
    this._redraw();
  }

  /** The direction the arrow points away from, relative to the tip. It is copied. */
  setControlPoint(point: PositionType) {
    const current = this._controlPoint;
    if (current && current.x === point.x && current.y === point.y) {
      return;
    }
    this._controlPoint = { x: point.x, y: point.y };
    this._redraw();
  }

  private hasPath(): boolean {
    return this._native.hasAttribute('d');
  }

  setStrokeColor(color: string) {
    this.setStroke(null, null, color);
  }

  setStrokeWidth(width: number) {
    this.setStroke(width);
  }

  override setStroke(
    width: number | null,
    style?: StrokeStyle | null,
    color?: string | null,
    opacity?: number,
  ) {
    super.setStroke(width, style, color, opacity);
    if ($defined(width) && width !== null && width !== this._strokeWidth) {
      this._strokeWidth = Number(width);
      this._redraw();
    }
  }

  setDashed(isDashed: boolean, length: number, spacing: number) {
    if ($defined(isDashed) && isDashed && $defined(length) && $defined(spacing)) {
      this.attr('stroke-dasharray', `${length},${spacing}`);
    } else {
      this.removeAttr('stroke-dasharray');
    }
  }

  /** Two wings from the tip (geometry/arrow). Nothing is drawn until a control point is set. */
  private _redraw() {
    if (this._fromPoint && this._controlPoint) {
      this.attr('d', arrowPathData(this._fromPoint, this._controlPoint, this._strokeWidth));
    }
  }
}

export default ArrowPeer;
