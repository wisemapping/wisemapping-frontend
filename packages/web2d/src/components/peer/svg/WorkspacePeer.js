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

const WorkspacePeer = new Class({
  Extends: ElementPeer,
  initialize(element) {
    this._element = element;
    const svgElement = window.document.createElementNS(this.svgNamespace, 'svg');
    this.parent(svgElement);
    this._native.setAttribute('focusable', 'true');
    this._native.setAttribute('id', 'workspace');
    this._native.setAttribute('preserveAspectRatio', 'none');
  },

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

  setCoordSize(width, height) {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /);
    }
    if ($defined(width)) {
      coords[2] = width;
    }

    if ($defined(height)) {
      coords[3] = height;
    }

    this._native.setAttribute('viewBox', coords.join(' '));
    this._native.setAttribute('preserveAspectRatio', 'none');
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  },

  getCoordSize() {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [1, 1, 1, 1];
    if (viewBox != null) {
      coords = viewBox.split(/ /);
    }
    return { width: coords[2], height: coords[3] };
  },

  setCoordOrigin(x, y) {
    const viewBox = this._native.getAttribute('viewBox');

    // ViewBox min-x ,min-y by default initializated with 0 and 0.
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /);
    }

    if ($defined(x)) {
      coords[0] = x;
    }

    if ($defined(y)) {
      coords[1] = y;
    }

    this._native.setAttribute('viewBox', coords.join(' '));
  },

  append(child) {
    this.parent(child);
    EventUtils.broadcastChangeEvent(child, 'onChangeCoordSize');
  },

  getCoordOrigin() {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [1, 1, 1, 1];
    if (viewBox != null) {
      coords = viewBox.split(/ /);
    }
    const x = parseFloat(coords[0]);
    const y = parseFloat(coords[1]);
    return { x, y };
  },

  getPosition() {
    return { x: 0, y: 0 };
  },
});

export default WorkspacePeer;
