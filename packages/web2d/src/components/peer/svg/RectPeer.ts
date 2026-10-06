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
import type PositionType from '../../PositionType';
import ElementPeer, { formatLength } from './ElementPeer';

/**
 * http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
class RectPeer extends ElementPeer<SVGRectElement> {
  private _arc: number;

  private _position: PositionType;

  constructor(arc: number) {
    super(ElementPeer.createNode('rect'));
    this._arc = arc;
    this._position = { x: 0, y: 0 };
  }

  setPosition(x: number, y: number): void {
    if (x != null) {
      this._position = { ...this._position, x };
      this.attr('x', formatLength(x));
    }
    if (y != null) {
      this._position = { ...this._position, y };
      this.attr('y', formatLength(y));
    }
  }

  getPosition(): PositionType {
    return { x: this._position.x, y: this._position.y };
  }

  protected override hasSizeAttributes(): boolean {
    return true;
  }

  override setSize(width?: number | null, height?: number | null): void {
    super.setSize(width, height);
    // The kept size: a missing width or height keeps the current one.
    const min = Math.min(this._size.width, this._size.height);

    if (this._arc != null) {
      // Transform percentages to SVG format.
      const arc = (min / 2) * this._arc;
      this.attr('rx', formatLength(arc));
      this.attr('ry', formatLength(arc));
    }
  }
}

export default RectPeer;
