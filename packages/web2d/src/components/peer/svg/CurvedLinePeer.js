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
import Point from '../../Point';

class CurvedLinePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'path');
    super(svgElement);
    this._style = { fill: '#495879' };
    this._customControlPoint_1 = false;
    this._customControlPoint_2 = false;
    this._control1 = new Point(0, 0);
    this._control2 = new Point(0, 0);
    this.setWidth(1);
  }

  setSrcControlPoint(control) {
    this._customControlPoint_1 = true;
    const change = this._control1.x !== control.x || this._control1.y !== control.y;
    if (control) {
      this._control1 = { ...control };
    }
    if (change) {
      this._updatePath();
    }
  }

  setDestControlPoint(control) {
    this._customControlPoint_2 = true;
    const change = this._control2.x !== control.x || this._control2.y !== control.y;
    if (control) {
      this._control2 = { ...control };
    }
    if (change) {
      this._updatePath();
    }
  }

  isSrcControlPointCustom() {
    return this._customControlPoint_1;
  }

  isDestControlPointCustom() {
    return this._customControlPoint_2;
  }

  setIsSrcControlPointCustom(isCustom) {
    this._customControlPoint_1 = isCustom;
  }

  setIsDestControlPointCustom(isCustom) {
    this._customControlPoint_2 = isCustom;
  }

  getControlPoints() {
    return [{ ...this._control1 }, { ...this._control2 }];
  }

  setFrom(x1, y1) {
    const change = this._x1 !== x1 || this._y1 !== y1;
    this._x1 = x1;
    this._y1 = y1;
    if (change) { this._updatePath(); }
  }

  setTo(x2, y2) {
    const change = this._x2 !== x2 || this._y2 !== y2;
    this._x2 = x2;
    this._y2 = y2;
    if (change) this._updatePath();
  }

  getFrom() {
    return new Point(this._x1, this._y1);
  }

  getTo() {
    return new Point(this._x2, this._y2);
  }

  setStrokeWidth(width) {
    this._style['stroke-width'] = width;
    this._updateStyle();
  }

  setColor(color) {
    this._style.stroke = color;
    this._style.fill = color;
    this._updateStyle();
  }

  updateLine(avoidControlPointFix) {
    this._updatePath(avoidControlPointFix);
  }

  setShowEndArrow(visible) {
    this._showEndArrow = visible;
    this.updateLine();
  }

  isShowEndArrow() {
    return this._showEndArrow;
  }

  setShowStartArrow(visible) {
    this._showStartArrow = visible;
    this.updateLine();
  }

  isShowStartArrow() {
    return this._showStartArrow;
  }

  getWidth() {
    return this._width;
  }

  setWidth(value) {
    this._width = value;
    if (this._width >= 1) {
      this._style.fill = this._fill;
    } else {
      this._fill = this._style.fill;
      this._style.fill = 'none';
    }
    this._updateStyle();
    this.updateLine();
  }

  _updatePath(avoidControlPointFix) {
    if ($defined(this._x1) && $defined(this._y1) && $defined(this._x2) && $defined(this._y2)) {
      this._calculateAutoControlPoints(avoidControlPointFix);

      const moveTo = CurvedLinePeer._pointToStr(this._x1, this._y1 - this.getWidth() / 2);
      const curveP1 = CurvedLinePeer._pointToStr(this._control1.x + this._x1, this._control1.y + this._y1);
      const curveP2 = CurvedLinePeer._pointToStr(this._control2.x + this._x2, this._control2.y + this._y2);
      const curveP3 = CurvedLinePeer._pointToStr(this._x2, this._y2);

      const curveP4 = CurvedLinePeer._pointToStr(this._control2.x + this._x2, this._control2.y + this._y2 + this.getWidth() * 0.4);
      const curveP5 = CurvedLinePeer._pointToStr(this._control1.x + this._x1, this._control1.y + this._y1 + this.getWidth() * 0.7);
      const curveP6 = CurvedLinePeer._pointToStr(this._x1, this._y1 + this.getWidth() / 2);

      const path = `M${moveTo} C${curveP1} ${curveP2} ${curveP3} ${this.getWidth() >= 1 ? ` ${curveP4} ${curveP5} ${curveP6} Z` : ''}`;
      this._native.setAttribute('d', path);
    }
  }

  static _pointToStr(x, y) {
    return `${x.toFixed(1)},${y.toFixed(1)} `;
  }

  _updateStyle() {
    let style = '';
    for (const key in this._style) {
      if (Object.prototype.hasOwnProperty.call(this._style, key)) {
        style += `${key}:${this._style[key]} `;
      }
    }
    this._native.setAttribute('style', style);
  }

  static _calculateDefaultControlPoints(srcPos, tarPos) {
    const y = srcPos.y - tarPos.y;
    const x = srcPos.x - tarPos.x;
    const div = Math.abs(x) > 0.1 ? x : 0.1; // Prevent division by 0.

    const m = y / div;
    const l = Math.sqrt(y * y + x * x) / 3;
    let fix = 1;
    if (srcPos.x > tarPos.x) {
      fix = -1;
    }

    const x1 = srcPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix;
    const y1 = m * (x1 - srcPos.x) + srcPos.y;
    const x2 = tarPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix * -1;
    const y2 = m * (x2 - tarPos.x) + tarPos.y;

    return [new Point(-srcPos.x + x1, -srcPos.y + y1), new Point(-tarPos.x + x2, -tarPos.y + y2)];
  }

  _calculateAutoControlPoints(avoidControlPointFix) {
    // Both points available, calculate real points
    const defaultpoints = CurvedLinePeer._calculateDefaultControlPoints(
      new Point(this._x1, this._y1),
      new Point(this._x2, this._y2),
    );
    if (
      !this._customControlPoint_1 &&
      !($defined(avoidControlPointFix) && avoidControlPointFix === 0)
    ) {
      this._control1.x = defaultpoints[0].x;
      this._control1.y = defaultpoints[0].y;
    }
    if (
      !this._customControlPoint_2 &&
      !($defined(avoidControlPointFix) && avoidControlPointFix === 1)
    ) {
      this._control2.x = defaultpoints[1].x;
      this._control2.y = defaultpoints[1].y;
    }
  }

  setDashed(length, spacing) {
    if ($defined(length) && $defined(spacing)) {
      this._native.setAttribute('stroke-dasharray', `${length},${spacing}`);
    } else {
      this._native.setAttribute('stroke-dasharray', '');
    }
  }
}

export default CurvedLinePeer;
