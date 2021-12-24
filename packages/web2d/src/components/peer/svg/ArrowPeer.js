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

class ArrowPeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'path');
    super(svgElement);
    this._style = {};
    this._controlPoint = new Point();
    this._fromPoint = new Point();
  }

  setFrom(x, y) {
    this._fromPoint.x = x;
    this._fromPoint.y = y;
    this._redraw();
  }

  setControlPoint(point) {
    this._controlPoint = point;
    this._redraw();
  }

  setStrokeColor(color) {
    this.setStroke(null, null, color, null);
  }

  setStrokeWidth(width) {
    this.setStroke(width);
  }

  setDashed(isDashed, length, spacing) {
    if (
      $defined(isDashed)
      && isDashed
      && $defined(length)
      && $defined(spacing)
    ) {
      this._native.setAttribute('stroke-dasharray', `${length}${spacing}`);
    } else {
      this._native.setAttribute('stroke-dasharray', '');
    }
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

  _redraw() {
    let x;
    let y;
    let xp;
    let yp;
    if (
      $defined(this._fromPoint.x)
      && $defined(this._fromPoint.y)
      && $defined(this._controlPoint.x)
      && $defined(this._controlPoint.y)
    ) {
      if (this._controlPoint.y === 0) this._controlPoint.y = 1;

      const y0 = this._controlPoint.y;
      const x0 = this._controlPoint.x;
      const x2 = x0 + y0;
      const y2 = y0 - x0;
      const x3 = x0 - y0;
      const y3 = y0 + x0;
      const m = y2 / x2;
      const mp = y3 / x3;
      const l = 6;
      // eslint-disable-next-line no-restricted-properties
      const { pow } = Math;

      x = x2 === 0 ? 0 : Math.sqrt(pow(l, 2) / (1 + pow(m, 2)));
      x *= Math.sign(x2);
      y = x2 === 0 ? l * Math.sign(y2) : m * x;
      xp = x3 === 0 ? 0 : Math.sqrt(pow(l, 2) / (1 + pow(mp, 2)));
      xp *= Math.sign(x3);
      yp = x3 === 0 ? l * Math.sign(y3) : mp * xp;

      const path = `M${this._fromPoint.x},${this._fromPoint.y} `
        + `L${x + this._fromPoint.x},${y + this._fromPoint.y}M${this._fromPoint.x},${this._fromPoint.y
        } `
        + `L${xp + this._fromPoint.x},${yp + this._fromPoint.y}`;
      this._native.setAttribute('d', path);
    }
  }
}

export default ArrowPeer;
