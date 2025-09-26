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
import EventUtils from '../utils/EventUtils';
import SizeType from '../../SizeType';
import PositionType from '../../PositionType';

class WorkspacePeer extends ElementPeer {
  constructor() {
    const svgElement: SVGElement = window.document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    super(svgElement);
    this._native.setAttribute('focusable', 'true');
    // this._native.setAttribute('id', 'workspace');
    this._native.setAttribute('preserveAspectRatio', 'none');
  }

  /**
   * http://www.w3.org/TR/SVG/coords.html 7.7 The viewBox  attribute
   * It is often desirable to specify that a given set of graphics
   * stretch to fit a particular container element. The viewBox attribute
   * provides this capability.
   *
   * All elements that establish a new viewport (see elements that establish viewports),
   * plus the 'marker', 'pattern' and 'view' elements have attribute viewBox.
   * The value of the viewBox attribute is a list of four numbers <min-x>, <min-y>,
   * <width> and <height>, separated by whitespace and/or a comma, which specify a rectangle
   * in user space which should be mapped to the bounds of the viewport established by
   * the given element, taking into account attribute preserveAspectRatio. If specified,
   * an additional transformation is applied to all descendants of the given element to
   * achieve the specified effect.
   *
   * A negative value for <width> or <height> is an error (see Error processing).
   * A value of zero disables rendering of the element.
   *
   */

  setCoordSize(width: number, height: number) {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e: string) => Number.parseFloat(e));
    }
    coords[2] = width;
    coords[3] = height;
    this._native.setAttribute('viewBox', coords.map((e: number) => e.toFixed(0)).join(' '));
    this._native.setAttribute('preserveAspectRatio', 'none');
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  }

  getCoordSize(): SizeType {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [1, 1, 1, 1];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e) => Number.parseInt(e, 10));
    }
    return { width: coords[2], height: coords[3] };
  }

  setCoordOrigin(x: number, y: number): void {
    const viewBox = this._native.getAttribute('viewBox');

    // ViewBox min-x ,min-y by default initializated with 0 and 0.
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e: string) => Number.parseFloat(e));
    }

    if ($defined(x)) {
      coords[0] = x;
    }

    if ($defined(y)) {
      coords[1] = y;
    }

    this._native.setAttribute('viewBox', coords.map((e: number) => e.toFixed(0)).join(' '));
  }

  append(child: ElementPeer): void {
    super.append(child);
    EventUtils.broadcastChangeEvent(child, 'onChangeCoordSize');
  }

  getCoordOrigin(): PositionType {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e) => Number.parseFloat(e));
    }
    return { x: coords[0], y: coords[1] };
  }

  getPosition() {
    return { x: 0, y: 0 };
  }
}

export default WorkspacePeer;
