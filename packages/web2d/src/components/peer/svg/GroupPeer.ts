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
import ElementPeer from './ElementPeer';
import type PositionType from '../../PositionType';
import type SizeType from '../../SizeType';

class GroupPeer extends ElementPeer<SVGGElement> {
  private _coordSize: SizeType;

  private _position: PositionType;

  private _coordOrigin: PositionType;

  constructor() {
    super(ElementPeer.createNode('g'));
    this._coordSize = {
      width: 1,
      height: 1,
    };
    this._position = {
      x: 0,
      y: 0,
    };
    this._coordOrigin = {
      x: 0,
      y: 0,
    };
  }

  setCoordSize(width: number, height: number): void {
    const change = this._coordSize.width !== width || this._coordSize.height !== height;
    this._coordSize = { width, height };

    if (change) {
      this.updateTransform();
    }
  }

  getCoordSize(): SizeType {
    return {
      width: this._coordSize.width,
      height: this._coordSize.height,
    };
  }

  /**
   * http://www.w3.org/TR/SVG/coords.html#TransformAttribute
   * 7.6 The transform  attribute
   *
   * The value of the transform attribute is a <transform-list>, which is defined
   * as a list of transform definitions, which are applied in the order provided.
   * The individual transform definitions are separated by whitespace and/or a comma.
   * The available types of transform definitions include:
   *
   *    * matrix(<a> <b> <c> <d> <e> <f>), which specifies a transformation in the form
   * of a transformation matrix of six values. matrix(a,b,c,d,e,f) is equivalent to applying
   * the transformation matrix [a b c d e f].
   *
   *    * translate(<tx> [<ty>]), which specifies a translation by tx and ty.
   * If <ty> is not provided, it is assumed to be zero.
   *
   *    * scale(<sx> [<sy>]), which specifies a scale operation by sx and sy.
   * If <sy> is not provided, it is assumed to be equal to <sx>.
   *
   *    * rotate(<rotate-angle> [<cx> <cy>]), which specifies a rotation
   * by <rotate-angle> degrees about a given point.
   *      If optional parameters <cx> and <cy> are not supplied, the rotate
   * is about the origin of the current user coordinate system. The operation corresponds
   * to the matrix [cos(a) sin(a) -sin(a) cos(a) 0 0].
   *      If optional parameters <cx> and <cy> are supplied, the rotate is
   * about the point (<cx>, <cy>). The operation represents the equivalent of the
   *following specification: translate(<cx>, <cy>) rotate(<rotate-angle>) translate(-<cx>, -<cy>).
   *
   *    * skewX(<skew-angle>), which specifies a skew transformation along the x-axis.
   *
   *    * skewY(<skew-angle>), which specifies a skew transformation along the y-axis.
   * */

  updateTransform(): void {
    // An empty coordinate axis has no scale: keep 1 there, so the group is still translated
    // and never gets NaN or Infinity.
    const sx = this._coordSize.width > 0 ? this._size.width / this._coordSize.width : 1;
    const sy = this._coordSize.height > 0 ? this._size.height / this._coordSize.height : 1;

    const cx = this._position.x - this._coordOrigin.x * sx;
    const cy = this._position.y - this._coordOrigin.y * sy;
    // The scale is not rounded: 16.8 / 100 must stay 0.168, not 0.17.
    this.attr(
      'transform',
      `translate(${cx.toFixed(2)},${cy.toFixed(2)}) scale(${GroupPeer.formatScale(sx)},${GroupPeer.formatScale(sy)})`,
    );
  }

  private static formatScale(value: number): string {
    return String(Number(value.toFixed(6)));
  }

  setCoordOrigin(x: number, y: number): void {
    const change = x !== this._coordOrigin.x || y !== this._coordOrigin.y;
    this._coordOrigin = { x, y };

    if (change) {
      this.updateTransform();
    }
  }

  override setSize(width?: number | null, height?: number | null): void {
    const before = this._size;
    super.setSize(width, height);
    if (this._size.width !== before.width || this._size.height !== before.height) {
      this.updateTransform();
    }
  }

  setPosition(x: number, y: number): void {
    const change = x !== this._position.x || y !== this._position.y;
    this._position = { x, y };
    if (change) {
      this.updateTransform();
    }
  }

  getPosition(): PositionType {
    return {
      x: this._position.x,
      y: this._position.y,
    };
  }

  getCoordOrigin(): { x: number; y: number } {
    return {
      x: this._coordOrigin.x,
      y: this._coordOrigin.y,
    };
  }
}

export default GroupPeer;
