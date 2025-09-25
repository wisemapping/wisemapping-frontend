/* eslint-disable class-methods-use-this */
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
import SizeType from '../../SizeType';
import EventUtils from '../utils/EventUtils';

class ElementPeer {
  _native: SVGElement;
  private _parent: ElementPeer | null;
  protected _size: SizeType;
  private _changeListeners: {};
  private __handlers: Map<string, any>;
  private _children: ElementPeer[];
  private _stokeStyle: string | null;

  constructor(svgElement: SVGElement) {
    this._native = svgElement;
    this._size = { width: 1, height: 1 };
    this._changeListeners = {};
    // http://support.adobe.com/devsup/devsup.nsf/docs/50493.htm

    // __handlers stores handlers references so they can be removed afterwards
    this.__handlers = new Map();
    this._children = [];
    this._parent = null;
    this._stokeStyle = null;
  }

  setChildren(children: ElementPeer[]): void {
    this._children = children;
  }

  getChildren(): ElementPeer[] {
    return this._children;
  }

  getParent(): ElementPeer | null {
    return this._parent;
  }

  setParent(parent: ElementPeer | null): void {
    this._parent = parent;
  }

  append(elementPeer: ElementPeer): void {
    // Store parent and child relationship.
    elementPeer.setParent(this);
    const children = this.getChildren();
    children.push(elementPeer);

    // Append element as a child.
    this._native.appendChild(elementPeer._native);

    // Broadcast events ...
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  }

  removeChild(elementPeer: ElementPeer): void {
    // Store parent and child relationship.
    elementPeer.setParent(null);
    let children = this.getChildren();

    // Remove from children array ...
    const oldLength = children.length;

    children = children.filter((c) => c !== elementPeer);
    this.setChildren(children);

    $assert(children.length < oldLength, `element could not be removed:${elementPeer}`);

    // Append element as a child.
    this._native.removeChild(elementPeer._native);
  }

  /**
   * http://www.w3.org/TR/DOM-Level-3-Events/events.html
   * http://developer.mozilla.org/en/docs/addEvent
   */
  addEvent(type: string, listener) {
    // wrap it so it can be ~backward compatible with jQuery.trigger
    const wrappedListener = (e) => listener(e, e.detail);
    this.__handlers.set(listener, wrappedListener);
    this._native.addEventListener(type, wrappedListener);
  }

  trigger(type: string, event) {
    // TODO: check this for correctness and for real jQuery.trigger replacement
    this._native.dispatchEvent(new CustomEvent(type, { detail: event }));
  }

  removeEvent(type: string, listener) {
    this._native.removeEventListener(type, this.__handlers.get(listener));
    this.__handlers.delete(listener);
  }

  setSize(width: number, height: number): void {
    if ($defined(width) && this._size.width !== width) {
      this._size.width = width;
      this._native.setAttribute('width', width.toFixed(0));
    }

    if ($defined(height) && this._size.height !== height) {
      this._size.height = height;
      this._native.setAttribute('height', height.toFixed(0));
    }

    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  }

  getSize(): SizeType {
    return { width: this._size.width, height: this._size.height };
  }

  setFill(color: string | null, opacity?: number | null) {
    if (color) {
      this._native.setAttribute('fill', color);
    }
    if ($defined(opacity)) {
      this._native.setAttribute('fill-opacity', String(opacity));
    }
  }

  getFill() {
    const color = this._native.getAttribute('fill');
    const opacity = this._native.getAttribute('fill-opacity');
    return { color, opacity: Number(opacity) };
  }

  getStroke() {
    const stoke = this._native;
    const color = stoke.getAttribute('stroke');
    const dashstyle = this._stokeStyle;
    const opacity = stoke.getAttribute('stroke-opacity');
    const width = stoke.getAttribute('stroke-width');
    return {
      color,
      style: dashstyle,
      opacity,
      width,
    };
  }

  setStroke(width: number | null, style?: string | null, color?: string | null, opacity?: number) {
    if ($defined(width)) {
      this._native.setAttribute('stroke-width', `${width}`);
    }

    if (color) {
      this._native.setAttribute('stroke', color);
    }

    if (style) {
      this._stokeStyle = style;
      switch (style) {
        case 'dash':
          this._native.setAttribute('stroke-dasharray', '5 5');
          this._native.setAttribute('stroke-linecap', '');
          break;
        case 'dot':
          this._native.setAttribute('stroke-dasharray', '1 8');
          this._native.setAttribute('stroke-linecap', 'round');
          break;
        case 'dashdot':
        case 'longdash':
          this._native.setAttribute('stroke-dasharray', '10 5 2');
          this._native.setAttribute('stroke-linecap', 'round');
          break;
        case 'solid':
          this._native.setAttribute('stroke-dasharray', '');
          this._native.setAttribute('stroke-linecap', '');
          break;
        default:
          throw new Error(`Unsupported style: ${style}`);
      }
    }

    if ($defined(opacity)) {
      this._native.setAttribute('stroke-opacity', String(opacity));
    }
  }

  setVisibility(value: boolean, fade?: number) {
    this._native.setAttribute('visibility', value ? 'visible' : 'hidden');
    this._native.style.opacity = String(value ? 1 : 0);
    if (fade) {
      this._native.style.transition = `visibility ${fade}ms, opacity ${fade}ms`;
    } else {
      this._native.style.transition = '';
    }
  }

  isVisible(): boolean {
    const visibility = this._native.getAttribute('visibility');
    return !(visibility === 'hidden');
  }

  updateStrokeStyle() {
    const strokeStyle = this._stokeStyle;
    if (this.getParent()) {
      if (strokeStyle && strokeStyle !== 'solid') {
        this.setStroke(null, strokeStyle);
      }
    }
  }

  attachChangeEventListener(type, listener) {
    const listeners = this.getChangeEventListeners(type);
    if (!$defined(listener)) {
      throw new Error('Listener can not be null');
    }
    listeners.push(listener);
  }

  getChangeEventListeners(type) {
    let listeners = this._changeListeners[type];
    if (!$defined(listeners)) {
      listeners = [];
      this._changeListeners[type] = listeners;
    }
    return listeners;
  }

  /**
   * Move element to the front
   */
  moveToFront() {
    if (!this._native.parentNode) {
      throw new Error('node not connected to parent');
    }
    this._native.parentNode.appendChild(this._native);
  }

  /**
   * Move element to the back
   */
  moveToBack() {
    if (!this._native.parentNode) {
      throw new Error('node not connected to parent');
    }
    this._native.parentNode.insertBefore(this._native, this._native.parentNode.firstChild);
  }

  setCursor(type: string) {
    this._native.style.cursor = type;
  }

  static stokeStyleToStrokDasharray() {
    return {
      solid: [],
      dot: [1, 3],
      dash: [4, 3],
      longdash: [10, 2],
      dashdot: [5, 3, 1, 3],
    };
  }
  protected static svgNamespace = 'http://www.w3.org/2000/svg';
  protected static linkNamespace = 'http://www.w3.org/1999/xlink';
}

export default ElementPeer;
