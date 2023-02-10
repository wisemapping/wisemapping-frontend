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
import ElementPeer from './ElementPeer';

class StraightLinePeer extends ElementPeer {
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'line');
    super(svgElement);

    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 10;
    this._y2 = 10;
  }

  setFrom(x1: number, y1: number) {
    this._x1 = x1;
    this._y1 = y1;
    this._native.setAttribute('x1', String(x1));
    this._native.setAttribute('y1', String(y1));
  }

  setTo(x2: number, y2: number) {
    this._x2 = x2;
    this._y2 = y2;
    this._native.setAttribute('x2', String(x2));
    this._native.setAttribute('y2', String(y2));
  }

  getFrom() {
    return { x: this._x1, y: this._y1 };
  }

  getTo() {
    return { x: this._x2, y: this._y2 };
  }
}

export default StraightLinePeer;
