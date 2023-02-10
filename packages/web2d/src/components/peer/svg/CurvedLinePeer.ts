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

class CurvedLinePeer extends ElementPeer {
  private _customControlPoint_1: boolean;
  private _customControlPoint_2: boolean;
  private _control1: PositionType;
  private _control2: PositionType;
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;
  private _showEndArrow: boolean;
  private _showStartArrow: boolean;
  private _width: any;

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    super(svgElement);
    this._customControlPoint_1 = false;
    this._customControlPoint_2 = false;
    this._control1 = { x: 0, y: 0 };
    this._control2 = { x: 0, y: 0 };
    this.setWidth(1);
    this._showEndArrow = false;
    this._showStartArrow = false;
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
  }

  setSrcControlPoint(control: PositionType): void {
    this._customControlPoint_1 = true;
    const change = this._control1.x !== control.x || this._control1.y !== control.y;
    if (control) {
      this._control1 = { ...control };
    }
    if (change) {
      this._updatePath();
    }
  }

  setDestControlPoint(control: PositionType): void {
    this._customControlPoint_2 = true;
    const change = this._control2.x !== control.x || this._control2.y !== control.y;
    if (control) {
      this._control2 = { ...control };
    }
    if (change) {
      this._updatePath();
    }
  }

  isSrcControlPointCustom(): boolean {
    return this._customControlPoint_1;
  }

  isDestControlPointCustom(): boolean {
    return this._customControlPoint_2;
  }

  setIsSrcControlPointCustom(value: boolean): void {
    this._customControlPoint_1 = value;
  }

  setIsDestControlPointCustom(value: boolean): void {
    this._customControlPoint_2 = value;
  }

  getControlPoints(): [PositionType, PositionType] {
    return [{ ...this._control1 }, { ...this._control2 }];
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

  updateLine(avoidControlPointFix: boolean) {
    this._updatePath(avoidControlPointFix);
  }

  setShowEndArrow(visible: boolean): void {
    this._showEndArrow = visible;
    this._updatePath();
  }

  isShowEndArrow(): boolean {
    return this._showEndArrow;
  }

  setShowStartArrow(visible: boolean): void {
    this._showStartArrow = visible;
    this._updatePath();
  }

  isShowStartArrow() {
    return this._showStartArrow;
  }

  getWidth(): number {
    return this._width;
  }

  setWidth(value: number) {
    this._width = value;
    if (this._width === 1) {
      this.setFill('none');
    }
    this._updatePath();
  }

  private _updatePath(avoidControlPointFix?: boolean) {
    if ($defined(this._x1) && $defined(this._y1) && $defined(this._x2) && $defined(this._y2)) {
      this._calculateAutoControlPoints(avoidControlPointFix);

      const moveTo = CurvedLinePeer._pointToStr(this._x1, this._y1 - this.getWidth() / 2);
      const curveP1 = CurvedLinePeer._pointToStr(
        this._control1.x + this._x1,
        this._control1.y + this._y1,
      );
      const curveP2 = CurvedLinePeer._pointToStr(
        this._control2.x + this._x2,
        this._control2.y + this._y2,
      );
      const curveP3 = CurvedLinePeer._pointToStr(this._x2, this._y2);

      const curveP4 = CurvedLinePeer._pointToStr(
        this._control2.x + this._x2,
        this._control2.y + this._y2 + this.getWidth() * 0.4,
      );
      const curveP5 = CurvedLinePeer._pointToStr(
        this._control1.x + this._x1,
        this._control1.y + this._y1 + this.getWidth() * 0.7,
      );
      const curveP6 = CurvedLinePeer._pointToStr(this._x1, this._y1 + this.getWidth() / 2);

      const path = `M${moveTo} C${curveP1} ${curveP2} ${curveP3} ${
        this.getWidth() > 1 ? ` ${curveP4} ${curveP5} ${curveP6} Z` : ''
      }`;
      this._native.setAttribute('d', path);
    }
  }

  private static _pointToStr(x: number, y: number) {
    return `${x.toFixed(1)},${y.toFixed(1)} `;
  }

  private static _calculateDefaultControlPoints(srcPos: PositionType, tarPos: PositionType) {
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

    return [
      { x: -srcPos.x + x1, y: -srcPos.y + y1 },
      { x: -tarPos.x + x2, y: -tarPos.y + y2 },
    ];
  }

  private _calculateAutoControlPoints(avoidControlPointFix) {
    // Both points available, calculate real points
    const defaultpoints = CurvedLinePeer._calculateDefaultControlPoints(
      { x: this._x1, y: this._y1 },
      { x: this._x2, y: this._y2 },
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
