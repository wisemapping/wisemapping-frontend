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

import { $assert, $defined } from '@wisemapping/core-js';
import EventUtils from '../utils/EventUtils';
import TransformUtil from '../utils/TransformUtils';
import Element from '../../Element';

const ElementPeer = new Class({
  initialize(svgElement) {
    this._native = svgElement;
    if (!this._native.addEvent) {
      // Hack bug: https://bugzilla.mozilla.org/show_bug.cgi?id=740811
      for (const key in Element) {
        if (Object.prototype.hasOwnProperty.call(Element, key)) {
          this._native[key] = Element.prototype[key];
        }
      }
    }

    this._size = { width: 1, height: 1 };
    this._changeListeners = {};
    // http://support.adobe.com/devsup/devsup.nsf/docs/50493.htm
  },

  setChildren(children) {
    this._children = children;
  },

  getChildren() {
    let result = this._children;
    if (!$defined(result)) {
      result = [];
      this._children = result;
    }
    return result;
  },

  getParent() {
    return this._parent;
  },

  setParent(parent) {
    this._parent = parent;
  },

  append(elementPeer) {
    // Store parent and child relationship.
    elementPeer.setParent(this);
    const children = this.getChildren();
    children.include(elementPeer);

    // Append element as a child.
    this._native.appendChild(elementPeer._native);

    // Broadcast events ...
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  },

  removeChild(elementPeer) {
    // Store parent and child relationship.
    elementPeer.setParent(null);
    const children = this.getChildren();

    // Remove from children array ...
    const oldLength = children.length;

    children.erase(elementPeer);
    $assert(
      children.length < oldLength,
      `element could not be removed:${elementPeer}`,
    );

    // Append element as a child.
    this._native.removeChild(elementPeer._native);
  },

  /**
     * http://www.w3.org/TR/DOM-Level-3-Events/events.html
     * http://developer.mozilla.org/en/docs/addEvent
     */
  addEvent(type, listener) {
    $(this._native).bind(type, listener);
  },

  trigger(type, event) {
    $(this._native).trigger(type, event);
  },

  cloneEvents(from) {
    this._native.cloneEvents(from);
  },

  removeEvent(type, listener) {
    $(this._native).unbind(type, listener);
  },

  setSize(width, height) {
    if ($defined(width) && this._size.width !== parseInt(width, 10)) {
      this._size.width = parseInt(width, 10);
      this._native.setAttribute('width', parseInt(width, 10));
    }

    if ($defined(height) && this._size.height !== parseInt(height, 10)) {
      this._size.height = parseInt(height, 10);
      this._native.setAttribute('height', parseInt(height, 10));
    }

    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  },

  getSize() {
    return { width: this._size.width, height: this._size.height };
  },

  setFill(color, opacity) {
    if ($defined(color)) {
      this._native.setAttribute('fill', color);
    }
    if ($defined(opacity)) {
      this._native.setAttribute('fill-opacity', opacity);
    }
  },

  getFill() {
    const color = this._native.getAttribute('fill');
    const opacity = this._native.getAttribute('fill-opacity');
    return { color, opacity: Number(opacity) };
  },

  getStroke() {
    const vmlStroke = this._native;
    const color = vmlStroke.getAttribute('stroke');
    const dashstyle = this._stokeStyle;
    const opacity = vmlStroke.getAttribute('stroke-opacity');
    const width = vmlStroke.getAttribute('stroke-width');
    return {
      color,
      style: dashstyle,
      opacity,
      width,
    };
  },

  setStroke(width, style, color, opacity) {
    if ($defined(width)) {
      this._native.setAttribute('stroke-width', `${width}px`);
    }
    if ($defined(color)) {
      this._native.setAttribute('stroke', color);
    }
    if ($defined(style)) {
      // Scale the dash array in order to be equal to VML. In VML, stroke style doesn't scale.
      const dashArrayPoints = this.__stokeStyleToStrokDasharray[style];
      const scale = 1 / TransformUtil.workoutScale(this).width;

      let strokeWidth = this._native.getAttribute('stroke-width');
      strokeWidth = parseFloat(strokeWidth);

      const scaledPoints = [];
      for (let i = 0; i < dashArrayPoints.length; i++) {
        // VML scale the stroke based on the stroke width.
        scaledPoints[i] = dashArrayPoints[i] * strokeWidth;

        // Scale the points based on the scale.
        scaledPoints[i] = `${scaledPoints[i] * scale}px`;
      }

      //        this._native.setAttribute('stroke-dasharray', scaledPoints);
      this._stokeStyle = style;
    }

    if ($defined(opacity)) {
      this._native.setAttribute('stroke-opacity', opacity);
    }
  },

  /*
     * style='visibility: visible'
     */
  setVisibility(isVisible) {
    this._native.setAttribute('visibility', isVisible ? 'visible' : 'hidden');
  },

  isVisible() {
    const visibility = this._native.getAttribute('visibility');
    return !(visibility === 'hidden');
  },

  updateStrokeStyle() {
    const strokeStyle = this._stokeStyle;
    if (this.getParent()) {
      if (strokeStyle && strokeStyle !== 'solid') {
        this.setStroke(null, strokeStyle);
      }
    }
  },

  attachChangeEventListener(type, listener) {
    const listeners = this.getChangeEventListeners(type);
    if (!$defined(listener)) {
      throw new Error('Listener can not be null');
    }
    listeners.push(listener);
  },

  getChangeEventListeners(type) {
    let listeners = this._changeListeners[type];
    if (!$defined(listeners)) {
      listeners = [];
      this._changeListeners[type] = listeners;
    }
    return listeners;
  },

  /**
     * Move element to the front
     */
  moveToFront() {
    this._native.parentNode.appendChild(this._native);
  },

  /**
     * Move element to the back
     */
  moveToBack() {
    this._native.parentNode.insertBefore(this._native, this._native.parentNode.firstChild);
  },

  setCursor(type) {
    this._native.style.cursor = type;
  },
});

ElementPeer.prototype.svgNamespace = 'http://www.w3.org/2000/svg';
ElementPeer.prototype.linkNamespace = 'http://www.w3.org/1999/xlink';
ElementPeer.prototype.__stokeStyleToStrokDasharray = {
  solid: [],
  dot: [1, 3],
  dash: [4, 3],
  longdash: [10, 2],
  dashdot: [5, 3, 1, 3],
};

export default ElementPeer;
