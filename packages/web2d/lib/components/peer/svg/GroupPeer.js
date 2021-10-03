/*
 *    Copyright [2015] [wisemapping]
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
const ElementPeer = require('./ElementPeer').default;
const EventUtils = require('../utils/EventUtils').default;

const GroupPeer = new Class({
  Extends: ElementPeer,
  initialize() {
    const svgElement = window.document.createElementNS(this.svgNamespace, 'g');
    this.parent(svgElement);
    this._native.setAttribute('preserveAspectRatio', 'none');
    this._coordSize = { width: 1, height: 1 };
    this._native.setAttribute('focusable', 'true');
    this._position = { x: 0, y: 0 };
    this._coordOrigin = { x: 0, y: 0 };
  },

  setCoordSize(width, height) {
    const change = this._coordSize.width != width || this._coordSize.height != height;
    this._coordSize.width = width;
    this._coordSize.height = height;

    if (change) { this.updateTransform(); }
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  },

  getCoordSize() {
    return { width: this._coordSize.width, height: this._coordSize.height };
  },

  /**
     * http://www.w3.org/TR/SVG/coords.html#TransformAttribute
     * 7.6 The transform  attribute
     *
     * The value of the transform attribute is a <transform-list>, which is defined as a list of transform definitions, which are applied in the order provided. The individual transform definitions are separated by whitespace and/or a comma. The available types of transform definitions include:
     *
     *    * matrix(<a> <b> <c> <d> <e> <f>), which specifies a transformation in the form of a transformation matrix of six values. matrix(a,b,c,d,e,f) is equivalent to applying the transformation matrix [a b c d e f].
     *
     *    * translate(<tx> [<ty>]), which specifies a translation by tx and ty. If <ty> is not provided, it is assumed to be zero.
     *
     *    * scale(<sx> [<sy>]), which specifies a scale operation by sx and sy. If <sy> is not provided, it is assumed to be equal to <sx>.
     *
     *    * rotate(<rotate-angle> [<cx> <cy>]), which specifies a rotation by <rotate-angle> degrees about a given point.
     *      If optional parameters <cx> and <cy> are not supplied, the rotate is about the origin of the current user coordinate system. The operation corresponds to the matrix [cos(a) sin(a) -sin(a) cos(a) 0 0].
     *      If optional parameters <cx> and <cy> are supplied, the rotate is about the point (<cx>, <cy>). The operation represents the equivalent of the following specification: translate(<cx>, <cy>) rotate(<rotate-angle>) translate(-<cx>, -<cy>).
     *
     *    * skewX(<skew-angle>), which specifies a skew transformation along the x-axis.
     *
     *    * skewY(<skew-angle>), which specifies a skew transformation along the y-axis.
     * */

  updateTransform() {
    let sx = this._size.width / this._coordSize.width;
    let sy = this._size.height / this._coordSize.height;

    let cx = this._position.x - this._coordOrigin.x * sx;
    let cy = this._position.y - this._coordOrigin.y * sy;

    // FIXME: are we sure of this values?
    cx = isNaN(cx) ? 0 : cx;
    cy = isNaN(cy) ? 0 : cy;
    sx = isNaN(sx) ? 0 : sx;
    sy = isNaN(sy) ? 0 : sy;

    this._native.setAttribute('transform', `translate(${cx},${cy}) scale(${sx},${sy})`);
  },

  setOpacity(value) {
    this._native.setAttribute('opacity', value);
  },

  setCoordOrigin(x, y) {
    const change = x != this._coordOrigin.x || y != this._coordOrigin.y;
    if ($defined(x)) {
      this._coordOrigin.x = x;
    }

    if ($defined(y)) {
      this._coordOrigin.y = y;
    }
    if (change) { this.updateTransform(); }
  },

  setSize(width, height) {
    const change = width != this._size.width || height != this._size.height;
    this.parent(width, height);
    if (change) { this.updateTransform(); }
  },

  setPosition(x, y) {
    const change = x != this._position.x || y != this._position.y;
    if ($defined(x)) {
      this._position.x = parseInt(x);
    }

    if ($defined(y)) {
      this._position.y = parseInt(y);
    }
    if (change) { this.updateTransform(); }
  },

  getPosition() {
    return { x: this._position.x, y: this._position.y };
  },

  append(child) {
    this.parent(child);
    EventUtils.broadcastChangeEvent(child, 'onChangeCoordSize');
  },

  getCoordOrigin() {
    return { x: this._coordOrigin.x, y: this._coordOrigin.y };
  },
});

export default GroupPeer;
