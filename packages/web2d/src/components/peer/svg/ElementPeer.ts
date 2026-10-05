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
import { $assert, $defined } from '../utils/assert';
import SizeType from '../../SizeType';

export type ElementListener = (event: Event, detail?: unknown) => void;

export type StrokeStyle = 'solid' | 'dot' | 'dash' | 'dashdot' | 'longdash';

/** Formats a coordinate or length with at most 2 decimals and no trailing zeros. */
export const formatLength = (value: number): string => String(Math.round(value * 100) / 100 || 0);

class ElementPeer {
  _native: SVGElement;

  private _parent: ElementPeer | null;

  protected _size: SizeType;

  // Native wrappers, by event type and then by listener, so that one listener can be registered
  // for several types and removed from each of them.
  private _handlers: Map<string, Map<ElementListener, EventListener>>;

  private _children: ElementPeer[];

  private _stokeStyle: string | null;

  // Opacity set with setOpacity(). setVisibility() shows the element at this opacity.
  private _opacity: number;

  constructor(svgElement: SVGElement) {
    this._native = svgElement;
    this._size = { width: 1, height: 1 };
    this._handlers = new Map();
    this._children = [];
    this._parent = null;
    this._stokeStyle = null;
    this._opacity = 1;
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
    this._children.push(elementPeer);

    // Append element as a child.
    this._native.appendChild(elementPeer._native);
  }

  removeChild(elementPeer: ElementPeer): void {
    // Check first, so that a failed removal leaves both elements untouched.
    const children = this.getChildren();
    $assert(children.includes(elementPeer), `element could not be removed:${elementPeer}`);

    elementPeer.setParent(null);
    this.setChildren(children.filter((c) => c !== elementPeer));
    this._native.removeChild(elementPeer._native);
  }

  /**
   * http://www.w3.org/TR/DOM-Level-3-Events/events.html
   * http://developer.mozilla.org/en/docs/addEvent
   */
  addEvent(type: string, listener: ElementListener): void {
    let byListener = this._handlers.get(type);
    if (!byListener) {
      byListener = new Map();
      this._handlers.set(type, byListener);
    }
    // Like addEventListener, adding the same listener twice to one type is a no-op.
    if (byListener.has(listener)) {
      return;
    }

    // The listener gets the event and, for an event fired with trigger(), its payload.
    const wrappedListener = (e: Event) =>
      listener(e, e instanceof CustomEvent ? (e.detail as unknown) : undefined);
    byListener.set(listener, wrappedListener);
    this._native.addEventListener(type, wrappedListener);
  }

  /** Fires a (non-bubbling) custom event: listeners get `detail` as their second argument. */
  trigger<D = unknown>(type: string, detail?: D): void {
    this._native.dispatchEvent(new CustomEvent(type, { detail }));
  }

  removeEvent(type: string, listener: ElementListener): void {
    const byListener = this._handlers.get(type);
    const eventListener = byListener?.get(listener);
    if (byListener && eventListener) {
      this._native.removeEventListener(type, eventListener);
      byListener.delete(listener);
      if (byListener.size === 0) {
        this._handlers.delete(type);
      }
    }
  }

  /** Removes every listener added with addEvent(). The element can still be used afterwards. */
  dispose(): void {
    this._handlers.forEach((byListener, type) => {
      byListener.forEach((eventListener) => {
        this._native.removeEventListener(type, eventListener);
      });
    });
    this._handlers.clear();
  }

  /**
   * Keeps the element size. Only the elements whose geometry is a width and a height (<svg>,
   * <rect>, <image>) write them as attributes: on <g>, <text>, <path>, <line>, <polyline> and
   * <ellipse> they mean nothing, and those peers derive their geometry from the size instead.
   *
   * The attributes are always written through attr(), which skips unchanged values: the kept size
   * is not used to skip them, so a size written around the peer is restored (BL5-64).
   */
  setSize(width: number, height: number): void {
    const writeAttributes = this.hasSizeAttributes();
    if ($defined(width)) {
      this._size.width = width;
      if (writeAttributes) {
        this.attr('width', formatLength(width));
      }
    }

    if ($defined(height)) {
      this._size.height = height;
      if (writeAttributes) {
        this.attr('height', formatLength(height));
      }
    }
  }

  /** Whether `width` and `height` are geometry attributes of this element. */
  protected hasSizeAttributes(): boolean {
    return false;
  }

  getSize(): SizeType {
    return { width: this._size.width, height: this._size.height };
  }

  setFill(color: string | null, opacity?: number | null) {
    if (color) {
      this.attr('fill', color);
    }
    if ($defined(opacity)) {
      this.attr('fill-opacity', String(opacity));
    }
  }

  getFill(): { color: string | null; opacity: number } {
    const color = this._native.getAttribute('fill');
    const opacity = this._native.getAttribute('fill-opacity');
    // An unset fill-opacity is 1 (SVG initial value).
    return { color, opacity: opacity === null ? 1 : Number(opacity) };
  }

  getStroke(): {
    color: string | null;
    style: string | null;
    opacity: number;
    width: number | null;
  } {
    const stoke = this._native;
    const opacity = stoke.getAttribute('stroke-opacity');
    const width = stoke.getAttribute('stroke-width');
    return {
      color: stoke.getAttribute('stroke'),
      style: this._stokeStyle,
      // An unset stroke-opacity is 1 (SVG initial value).
      opacity: opacity === null ? 1 : Number(opacity),
      width: width === null ? null : Number.parseFloat(width),
    };
  }

  setStroke(width: number | null, style?: string | null, color?: string | null, opacity?: number) {
    if ($defined(width)) {
      this.attr('stroke-width', `${width}`);
    }

    if (color) {
      this.attr('stroke', color);
    }

    if (style) {
      if (!Object.prototype.hasOwnProperty.call(ElementPeer.DASH_ARRAYS, style)) {
        throw new Error(`Unsupported style: ${style}`);
      }
      this._stokeStyle = style;
      const dashArray = ElementPeer.DASH_ARRAYS[style as StrokeStyle];
      // Solid removes the attributes: an empty value is invalid SVG.
      if (dashArray.length > 0) {
        this.attr('stroke-dasharray', dashArray.join(' '));
      } else {
        this.removeAttr('stroke-dasharray');
      }
      const lineCap = ElementPeer.DASH_LINE_CAPS[style as StrokeStyle];
      if (lineCap) {
        this.attr('stroke-linecap', lineCap);
      } else {
        this.removeAttr('stroke-linecap');
      }
    }

    if ($defined(opacity)) {
      this.attr('stroke-opacity', String(opacity));
    }
  }

  /**
   * Writes an attribute only when its value changes, so a redraw that sets the same values costs
   * no DOM writes. The DOM itself is the cache: a write made around the peer (mindplot writes some
   * attributes on the native node directly) can never leave it stale.
   */
  protected attr(name: string, value: string): void {
    ElementPeer.writeAttribute(this._native, name, value);
  }

  /** Removes an attribute, if it is set. */
  protected removeAttr(name: string): void {
    if (this._native.hasAttribute(name)) {
      this._native.removeAttribute(name);
    }
  }

  /** Writes an attribute of any element only when its value changes. */
  static writeAttribute(element: Element, name: string, value: string): void {
    if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value);
    }
  }

  /** Writes an inline style property only when its value changes. */
  private writeStyle(name: 'opacity' | 'transition' | 'cursor', value: string): void {
    if (this._native.style[name] !== value) {
      this._native.style[name] = value;
    }
  }

  /**
   * Sets the opacity of the whole element (fill, stroke and children). It is kept across
   * setVisibility() calls, which share the same channel (the inline style) so they can fade.
   */
  setOpacity(value: number): void {
    this._opacity = value;
    this.writeStyle('opacity', String(this.isVisible() ? value : 0));
  }

  getOpacity(): number {
    return this._opacity;
  }

  setVisibility(value: boolean, fade?: number) {
    this.attr('visibility', value ? 'visible' : 'hidden');
    // Shown at the opacity set with setOpacity(), and faded through the same property.
    this.writeStyle('opacity', String(value ? this._opacity : 0));
    if (fade) {
      this.writeStyle('transition', `visibility ${fade}ms, opacity ${fade}ms`);
    } else {
      this.writeStyle('transition', '');
    }
  }

  isVisible(): boolean {
    const visibility = this._native.getAttribute('visibility');
    return !(visibility === 'hidden');
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
    this.writeStyle('cursor', type);
  }

  /** The single dash table, shared by every element type. */
  static readonly DASH_ARRAYS: Readonly<Record<StrokeStyle, readonly number[]>> = {
    solid: [],
    dot: [1, 8],
    dash: [5, 5],
    longdash: [10, 5],
    dashdot: [10, 5, 1, 5],
  };

  private static readonly DASH_LINE_CAPS: Readonly<Record<StrokeStyle, string | null>> = {
    solid: null,
    dot: 'round',
    dash: null,
    longdash: 'round',
    dashdot: 'round',
  };

  static stokeStyleToStrokDasharray(): Record<StrokeStyle, number[]> {
    const { solid, dot, dash, longdash, dashdot } = ElementPeer.DASH_ARRAYS;
    return {
      solid: [...solid],
      dot: [...dot],
      dash: [...dash],
      longdash: [...longdash],
      dashdot: [...dashdot],
    };
  }

  protected static svgNamespace = 'http://www.w3.org/2000/svg';

  protected static linkNamespace = 'http://www.w3.org/1999/xlink';
}

export default ElementPeer;
