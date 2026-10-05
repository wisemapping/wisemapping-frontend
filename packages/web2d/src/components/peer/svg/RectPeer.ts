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
import ElementPeer, { formatLength } from './ElementPeer';

/**
 * http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
class RectPeer extends ElementPeer {
  private _arc: number;

  private _position: PositionType;

  constructor(arc: number) {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    super(svgElement);
    this._arc = arc;
    this._position = { x: 0, y: 0 };
  }

  setPosition(x: number, y: number) {
    if ($defined(x)) {
      this._position.x = x;
      this._native.setAttribute('x', formatLength(x));
    }
    if ($defined(y)) {
      this._position.y = y;
      this._native.setAttribute('y', formatLength(y));
    }
  }

  getPosition(): PositionType {
    return { x: this._position.x, y: this._position.y };
  }

  protected override hasSizeAttributes(): boolean {
    return true;
  }

  setSize(width: number, height: number): void {
    super.setSize(width, height);
    const min = width < height ? width : height;

    if ($defined(this._arc)) {
      // Transform percentages to SVG format.
      const arc = (min / 2) * this._arc;
      this._native.setAttribute('rx', formatLength(arc));
      this._native.setAttribute('ry', formatLength(arc));
    }
  }
}

export default RectPeer;
