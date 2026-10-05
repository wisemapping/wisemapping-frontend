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
import * as PolyLineUtils from '../../geometry/polyline';
import ElementPeer from './ElementPeer';
import type { Orientation, PolyLineStyle } from '../../types';

class PolyLinePeer extends ElementPeer {
  private _breakDistance: number;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  private _style: PolyLineStyle;

  private _orientation: Orientation;

  // Whether the points are out of date. The first setter always draws; after that a setter that
  // does not change an input does not rebuild or rewrite the points.
  private _pathDirty: boolean;

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    super(svgElement);
    this.setFill('none');
    this._breakDistance = 10;
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
    this._style = 'Straight';
    this._orientation = 'horizontal';
    this._pathDirty = true;
  }

  setFrom(x1: number, y1: number) {
    const changed = this._x1 !== x1 || this._y1 !== y1;
    this._x1 = x1;
    this._y1 = y1;
    this._refreshPath(changed);
  }

  setTo(x2: number, y2: number) {
    const changed = this._x2 !== x2 || this._y2 !== y2;
    this._x2 = x2;
    this._y2 = y2;
    this._refreshPath(changed);
  }

  setStrokeWidth(width: number) {
    // Through setStroke, so a dash from the style table is rescaled (BL5-77).
    this.setStroke(width);
  }

  setColor(color: string) {
    this.attr('stroke', color);
  }

  setStyle(style: PolyLineStyle) {
    const changed = this._style !== style;
    this._style = style;
    this._refreshPath(changed);
  }

  getStyle(): PolyLineStyle {
    return this._style;
  }

  setOrientation(orientation: Orientation) {
    const changed = this._orientation !== orientation;
    this._orientation = orientation;
    this._refreshPath(changed);
  }

  getOrientation(): Orientation {
    return this._orientation;
  }

  /** Marks the points dirty when an input changed, and redraws them if they are dirty. */
  private _refreshPath(changed: boolean): void {
    if (changed) {
      this._pathDirty = true;
    }
    if (this._pathDirty) {
      this._pathDirty = false;
      this._updatePath();
    }
  }

  /** Redraws the line in its style. An empty or unknown style draws the `Curved` path. */
  private _updatePath() {
    switch (this._style) {
      case 'Straight':
        this._updateStraightPath();
        break;
      case 'MiddleStraight':
        this._updateMiddleStraightPath();
        break;
      case 'MiddleCurved':
        this._updateMiddleCurvePath();
        break;
      case 'Curved':
      default:
        this._updateCurvePath();
        break;
    }
  }

  private _updateStraightPath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path =
        this._orientation === 'vertical'
          ? PolyLineUtils.buildVerticalStraightPath(
              this._breakDistance,
              this._x1,
              this._y1,
              this._x2,
              this._y2,
            )
          : PolyLineUtils.buildStraightPath(
              this._breakDistance,
              this._x1,
              this._y1,
              this._x2,
              this._y2,
            );
      this.attr('points', path);
    }
  }

  /** An elbow with both corners chamfered by MIDDLE_CURVED_CHAMFER (W-MIDCURVE). */
  private _updateMiddleCurvePath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path = PolyLineUtils.buildChamferedElbowPath(
        this._x1,
        this._y1,
        this._x2,
        this._y2,
        PolyLineUtils.MIDDLE_CURVED_CHAMFER,
        this._orientation,
      );
      this.attr('points', path);
    }
  }

  /** An elbow that breaks at the middle, which is rounded to whole units. */
  private _updateMiddleStraightPath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path = PolyLineUtils.buildMiddleStraightPath(
        this._x1,
        this._y1,
        this._x2,
        this._y2,
        this._orientation,
      );
      this.attr('points', path);
    }
  }

  private _updateCurvePath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path =
        this._orientation === 'vertical'
          ? PolyLineUtils.buildVerticalCurvedPath(
              this._breakDistance,
              this._x1,
              this._y1,
              this._x2,
              this._y2,
            )
          : PolyLineUtils.buildCurvedPath(
              this._breakDistance,
              this._x1,
              this._y1,
              this._x2,
              this._y2,
            );
      this.attr('points', path);
    }
  }
}

export default PolyLinePeer;
