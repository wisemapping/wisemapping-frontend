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
import type PositionType from '../../PositionType';
import { curvePathData, defaultControlPoints } from '../../geometry/curve';
import ElementPeer from './ElementPeer';

class CurvedLinePeer extends ElementPeer<SVGPathElement> {
  // Whether the user placed the control point. Only set through setIs*ControlPointCustom: the
  // setters below also take default points, which must not be reported as custom ...
  private _customControlPoint_1: boolean;

  private _customControlPoint_2: boolean;

  // Whether the control point was given through a setter. Until then it is worked out from the
  // ends of the line ...
  private _fixedControlPoint_1: boolean;

  private _fixedControlPoint_2: boolean;

  private _control1: PositionType;

  private _control2: PositionType;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  private _width: number;

  constructor() {
    super(ElementPeer.createNode('path'));
    this._customControlPoint_1 = false;
    this._customControlPoint_2 = false;
    this._fixedControlPoint_1 = false;
    this._fixedControlPoint_2 = false;
    this._control1 = { x: 0, y: 0 };
    this._control2 = { x: 0, y: 0 };
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
    this._width = 1;
    this._updatePath();
  }

  /** Sets the control point, relative to the start of the line. `null` is ignored. */
  setSrcControlPoint(control: PositionType | null): void {
    if (!control) {
      return;
    }
    this._fixedControlPoint_1 = true;
    const change = this._control1.x !== control.x || this._control1.y !== control.y;
    this._control1 = { ...control };
    if (change) {
      this._updatePath();
    }
  }

  /** Sets the control point, relative to the end of the line. `null` is ignored. */
  setDestControlPoint(control: PositionType | null): void {
    if (!control) {
      return;
    }
    this._fixedControlPoint_2 = true;
    const change = this._control2.x !== control.x || this._control2.y !== control.y;
    this._control2 = { ...control };
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
    // Through setStroke, so a dash from the style table is rescaled (BL5-77).
    this.setStroke(width);
  }

  updateLine(avoidControlPointFix: boolean) {
    if ($defined(this._x1) && $defined(this._y1) && $defined(this._x2) && $defined(this._y2)) {
      this._calculateAutoControlPoints(avoidControlPointFix);
      this._renderPath();
    }
  }

  getWidth(): number {
    return this._width;
  }

  setWidth(value: number): void {
    const change = this._width !== value;
    this._width = value;
    if (change) {
      this._updatePath();
    }
  }

  private _updatePath() {
    if ($defined(this._x1) && $defined(this._y1) && $defined(this._x2) && $defined(this._y2)) {
      this._calculateAutoControlPoints(false);
      this._renderPath();
    }
  }

  /** Draws the line: a plain curve below width 1, a tapered filled shape from 1 (geometry/curve). */
  private _renderPath() {
    this.attr(
      'd',
      curvePathData(
        { x: this._x1, y: this._y1 },
        { x: this._x2, y: this._y2 },
        this._control1,
        this._control2,
        this.getWidth(),
      ),
    );
  }

  private _calculateAutoControlPoints(avoidControlPointFix: boolean) {
    // Both points available, calculate real points
    const defaultpoints = defaultControlPoints(
      { x: this._x1, y: this._y1 },
      { x: this._x2, y: this._y2 },
    );
    if (!this._customControlPoint_1 && !this._fixedControlPoint_1 && !avoidControlPointFix) {
      this._control1 = { x: defaultpoints[0].x, y: defaultpoints[0].y };
    }
    if (!this._customControlPoint_2 && !this._fixedControlPoint_2 && !avoidControlPointFix) {
      this._control2 = { x: defaultpoints[1].x, y: defaultpoints[1].y };
    }
  }

  setDashed(length: number, spacing: number) {
    if ($defined(length) && $defined(spacing)) {
      this.attr('stroke-dasharray', `${length},${spacing}`);
    } else {
      // No dash removes the attribute: an empty value is invalid SVG.
      this.removeAttr('stroke-dasharray');
    }
  }
}

export default CurvedLinePeer;
