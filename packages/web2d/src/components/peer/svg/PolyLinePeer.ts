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
import * as PolyLineUtils from '../utils/PolyLineUtils';
import ElementPeer from './ElementPeer';

class PolyLinePeer extends ElementPeer {
  private _breakDistance: number;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  private _style: string;

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
  }

  setFrom(x1: number, y1: number) {
    this._x1 = x1;
    this._y1 = y1;
    this._updatePath();
  }

  setTo(x2: number, y2: number) {
    this._x2 = x2;
    this._y2 = y2;
    this._updatePath();
  }

  setStrokeWidth(width: number) {
    this._native.setAttribute('stroke-width', String(width));
  }

  setColor(color: string) {
    this._native.setAttribute('stroke', color);
  }

  setStyle(style: string) {
    this._style = style;
    this._updatePath();
  }

  getStyle(): string {
    return this._style;
  }

  private _updatePath() {
    if (this._style === 'Straight') {
      this._updateStraightPath();
    }
    if (this._style === 'MiddleStraight') {
      this._updateMiddleStraightPath();
    } else if (this._style === 'MiddleCurved') {
      this._updateMiddleCurvePath();
    } else if (this._style === 'Curved' || !this._style) {
      this._updateCurvePath();
    }
  }

  private _updateStraightPath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path = PolyLineUtils.buildStraightPath.call(
        this,
        this._breakDistance,
        this._x1,
        this._y1,
        this._x2,
        this._y2,
      );
      this._native.setAttribute('points', path);
    }
  }

  private _updateMiddleCurvePath() {
    const x1 = this._x1;
    const y1 = this._y1;
    const x2 = this._x2;
    const y2 = this._y2;

    if ($defined(x1) && $defined(x2) && $defined(y1) && $defined(y2)) {
      const diff = x2 - x1;
      const middlex = diff / 2 + x1;
      let signx = 0;
      let signy = 1;
      if (diff < 0) {
        signx = -1;
      }
      if (y2 < y1) {
        signy = -1;
      }
      const path = `${x1}, ${y1} ${(middlex - 10 * signx).toFixed(0)}, ${y1} ${middlex.toFixed(
        0,
      )}, ${y1 + 10 * signy} ${middlex}, ${y2 - 10 * signy} ${
        middlex + 10 * signx
      }, ${y2} ${x2}, ${y2}`;
      this._native.setAttribute('points', path);
    }
  }

  private _updateMiddleStraightPath() {
    const x1 = this._x1;
    const y1 = this._y1;
    const x2 = this._x2;
    const y2 = this._y2;
    if ($defined(x1) && $defined(x2) && $defined(y1) && $defined(y2)) {
      const diff = x2 - x1;
      const middlex = (diff * 0.75 + x1).toFixed(0);
      const path = `${x1}, ${y1} ${middlex}, ${y1} ${middlex}, ${y1} ${middlex}, ${y2} ${middlex}, ${y2} ${x2}, ${y2}`;
      this._native.setAttribute('points', path);
    }
  }

  private _updateCurvePath() {
    if ($defined(this._x1) && $defined(this._x2) && $defined(this._y1) && $defined(this._y2)) {
      const path = PolyLineUtils.buildCurvedPath.call(
        this,
        this._breakDistance,
        this._x1,
        this._y1,
        this._x2,
        this._y2,
      );
      this._native.setAttribute('points', path);
    }
  }
}

export default PolyLinePeer;
