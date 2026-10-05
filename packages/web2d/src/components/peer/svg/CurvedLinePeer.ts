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

class CurvedLinePeer extends ElementPeer {
  /** Half the thickness of a tapered line at its source control point, as a share of the width. */
  static readonly TAPER_AT_SRC_CONTROL = 0.35;

  /** Half the thickness of a tapered line at its target control point, as a share of the width. */
  static readonly TAPER_AT_DEST_CONTROL = 0.2;

  private static readonly EPSILON = 1e-9;

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
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    super(svgElement);
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
    this.attr('stroke-width', String(width));
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

  /**
   * Draws the line. Below width 1 it is a plain cubic curve. From width 1 it is a filled shape
   * that tapers from `width` at the start to a point at the end: the outgoing edge and the
   * returning edge are the centre curve offset to either side, by the same amount, along the
   * normal at each end (W-TAPER). Each edge point is centre ± normal × half-thickness, so the
   * average of both edges is the centre curve itself at every t.
   */
  private _renderPath() {
    const start = { x: this._x1, y: this._y1 };
    const end = { x: this._x2, y: this._y2 };
    const c1 = { x: this._control1.x + this._x1, y: this._control1.y + this._y1 };
    const c2 = { x: this._control2.x + this._x2, y: this._control2.y + this._y2 };

    const str = CurvedLinePeer._pointToStr;
    const width = this.getWidth();
    if (width < 1) {
      this.attr('d', `M${str(start)} C${str(c1)} ${str(c2)} ${str(end)}`);
      return;
    }

    // Normals at the start and at the end, from the curve's tangents there.
    const n1 = CurvedLinePeer._normal([
      [start, c1],
      [start, c2],
      [start, end],
    ]);
    const n2 = CurvedLinePeer._normal([
      [c2, end],
      [c1, end],
      [start, end],
    ]);

    // Half the thickness at each point of the control polygon.
    const h0 = width / 2;
    const h1 = width * CurvedLinePeer.TAPER_AT_SRC_CONTROL;
    const h2 = width * CurvedLinePeer.TAPER_AT_DEST_CONTROL;

    const offset = (p: PositionType, n: PositionType, h: number) => ({
      x: p.x + n.x * h,
      y: p.y + n.y * h,
    });
    const there = `M${str(offset(start, n1, -h0))} C${str(offset(c1, n1, -h1))} ${str(offset(c2, n2, -h2))} ${str(end)}`;
    const back = `C${str(offset(c2, n2, h2))} ${str(offset(c1, n1, h1))} ${str(offset(start, n1, h0))} Z`;
    this.attr('d', `${there} ${back}`);
  }

  /**
   * The unit normal (the direction turned 90°) of the first segment, among `segments`, whose
   * ends do not coincide. Falls back to the normal of a left-to-right line when all of them do.
   */
  private static _normal(segments: [PositionType, PositionType][]): PositionType {
    for (const [a, b] of segments) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      if (length > CurvedLinePeer.EPSILON) {
        return { x: -dy / length, y: dx / length };
      }
    }
    return { x: 0, y: 1 };
  }

  private static _pointToStr(p: PositionType) {
    const fixed = (v: number) => {
      const value = v.toFixed(1);
      return value === '-0.0' ? '0.0' : value;
    };
    return `${fixed(p.x)},${fixed(p.y)}`;
  }

  /**
   * The default control points, relative to their ends: a third of the way along the chord,
   * each pointing towards the other end, so the default curve is the straight chord (W-DEFCP).
   */
  private static _calculateDefaultControlPoints(
    srcPos: PositionType,
    tarPos: PositionType,
  ): [PositionType, PositionType] {
    const x = (tarPos.x - srcPos.x) / 3;
    const y = (tarPos.y - srcPos.y) / 3;
    // `0 - v` rather than `-v`, so that no coordinate is -0.
    return [
      { x, y },
      { x: 0 - x, y: 0 - y },
    ];
  }

  private _calculateAutoControlPoints(avoidControlPointFix: boolean) {
    // Both points available, calculate real points
    const defaultpoints = CurvedLinePeer._calculateDefaultControlPoints(
      { x: this._x1, y: this._y1 },
      { x: this._x2, y: this._y2 },
    );
    if (!this._customControlPoint_1 && !this._fixedControlPoint_1 && !avoidControlPointFix) {
      this._control1.x = defaultpoints[0].x;
      this._control1.y = defaultpoints[0].y;
    }
    if (!this._customControlPoint_2 && !this._fixedControlPoint_2 && !avoidControlPointFix) {
      this._control2.x = defaultpoints[1].x;
      this._control2.y = defaultpoints[1].y;
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
