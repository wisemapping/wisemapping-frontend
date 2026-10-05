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
import { fixed } from '../../geometry/path';
import ElementPeer from './ElementPeer';

/** The ends are written with 2 decimals. */
const format = fixed(2);

class StraightLinePeer extends ElementPeer<SVGLineElement> {
  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  constructor() {
    super(ElementPeer.createNode('line'));

    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 10;
    this._y2 = 10;
  }

  setFrom(x1: number, y1: number) {
    this._x1 = x1;
    this._y1 = y1;
    this.attr('x1', format(x1));
    this.attr('y1', format(y1));
  }

  setTo(x2: number, y2: number) {
    this._x2 = x2;
    this._y2 = y2;
    this.attr('x2', format(x2));
    this.attr('y2', format(y2));
  }

  getFrom() {
    return { x: this._x1, y: this._y1 };
  }

  getTo() {
    return { x: this._x2, y: this._y2 };
  }
}

export default StraightLinePeer;
