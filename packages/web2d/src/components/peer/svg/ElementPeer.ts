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
import { $assert } from '../utils/assert';
import type SizeType from '../../SizeType';
import { isStrokeStyle, type StrokeStyle } from '../../types';

/**
 * A listener of an element event. It is declared with method syntax, so that its parameter is
 * checked bivariantly: a listener of a specific event (a MouseEvent, a CustomEvent<D>) is accepted
 * where the DOM expects an Event, as addEventListener's own typing does. The event a type
 * dispatches is the one its name maps to (see ElementEvent).
 */
export type ElementListener<E extends Event = Event> = {
  handle(event: E): void;
}['handle'];

/**
 * Custom event names (fired with trigger()) mapped to the type of their detail. web2d fires none
 * itself: an element user such as mindplot passes its own map as a type argument (W-TRIGGER).
 * The default accepts any name and detail.
 */
export type CustomEventMap = Record<string, unknown>;

/**
 * The event a listener of `type` receives: a CustomEvent for a custom event of a specific map `M`
 * (fired with trigger()), the DOM event for a native type ('click' gets a MouseEvent,
 * 'pointerdown' a PointerEvent), else an Event.
 */
export type ElementEvent<M extends CustomEventMap, K extends string> = string extends keyof M
  ? NativeEvent<K>
  : K extends keyof M
    ? CustomEvent<M[K]>
    : NativeEvent<K>;

/** The DOM event of a native event type, or Event for any other type. */
type NativeEvent<K extends string> = K extends keyof SVGElementEventMap
  ? SVGElementEventMap[K]
  : Event;

/** The detail a listener of `type` receives: the mapped type of a custom event, else unknown. */
export type EventDetail<M extends CustomEventMap, K extends string> = K extends keyof M
  ? M[K]
  : unknown;

export type { StrokeStyle };

/** Formats a coordinate or length with at most 2 decimals and no trailing zeros. */
export const formatLength = (value: number): string => String(Math.round(value * 100) / 100 || 0);

/** The SVG namespace, typed so that createElementNS returns the element type of the tag. */
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg' as const;

/**
 * The SVG implementation behind an element. `N` is the type of its SVG node.
 */
class ElementPeer<N extends SVGGraphicsElement = SVGGraphicsElement> {
  readonly _native: N;

  private _parent: ElementPeer | null;

  protected _size: SizeType;

  // Aborts every listener added with addEvent(): each one is registered with its signal. Created
  // with the first listener, and replaced by dispose().
  private _listeners: AbortController | null;

  private _children: ElementPeer[];

  private _stokeStyle: StrokeStyle | null;

  // Opacity set with setOpacity(). setVisibility() shows the element at this opacity.
  private _opacity: number;

  // The dash array last written from the style table, to rescale it when the width changes.
  private _tableDash: string | null;

  constructor(svgElement: N) {
    this._native = svgElement;
    this._size = { width: 1, height: 1 };
    this._listeners = null;
    this._children = [];
    this._parent = null;
    this._stokeStyle = null;
    this._opacity = 1;
    this._tableDash = null;
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
   * Adds a listener of the `type` events of the element, as addEventListener does: adding the same
   * listener to one type again is a no-op. A native type passes through unchanged, so Pointer
   * Events ('pointerdown', 'pointermove', 'pointerup', 'pointercancel') work like mouse events. An
   * event fired with trigger() is a CustomEvent whose `detail` is the payload.
   */
  addEvent(type: string, listener: ElementListener): void {
    this._listeners ??= new AbortController();
    this._native.addEventListener(type, listener, { signal: this._listeners.signal });
  }

  /**
   * Fires a non-bubbling CustomEvent of `type`: listeners read the payload from `event.detail`.
   */
  trigger<D = unknown>(type: string, detail?: D): void {
    this._native.dispatchEvent(new CustomEvent(type, { detail }));
  }

  removeEvent(type: string, listener: ElementListener): void {
    this._native.removeEventListener(type, listener);
  }

  /**
   * Removes every listener added with addEvent(), in one go, by aborting their signal. The element
   * can still be used afterwards.
   */
  dispose(): void {
    this._listeners?.abort();
    this._listeners = null;
  }

  /** dispose() on this element and on every element appended to it, recursively. */
  disposeTree(): void {
    this.dispose();
    this._children.forEach((child) => child.disposeTree());
  }

  /**
   * Keeps the element size. Only the elements whose geometry is a width and a height (<svg>,
   * <rect>, <image>) write them as attributes: on <g>, <text>, <path>, <line>, <polyline> and
   * <ellipse> they mean nothing, and those peers derive their geometry from the size instead.
   *
   * The attributes are always written through attr(), which skips unchanged values: the kept size
   * is not used to skip them, so a size written around the peer is restored (BL5-64).
   */
  setSize(width?: number | null, height?: number | null): void {
    const writeAttributes = this.hasSizeAttributes();
    if (width != null) {
      this._size = { ...this._size, width };
      if (writeAttributes) {
        this.attr('width', formatLength(width));
      }
    }

    if (height != null) {
      this._size = { ...this._size, height };
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

  setFill(color?: string | null, opacity?: number | null): void {
    if (color) {
      this.attr('fill', color);
    }
    if (opacity != null) {
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
    style: StrokeStyle | null;
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

  setStroke(
    width: number | null,
    style?: StrokeStyle | null,
    color?: string | null,
    opacity?: number,
  ): void {
    if (width != null) {
      this.attr('stroke-width', `${width}`);
    }

    if (color) {
      this.attr('stroke', color);
    }

    if (style) {
      if (!isStrokeStyle(style)) {
        throw new Error(`Unsupported style: ${style}`);
      }
      this._stokeStyle = style;
      this.writeTableDash(style);
      const lineCap = ElementPeer.DASH_LINE_CAPS[style];
      if (lineCap) {
        this.attr('stroke-linecap', lineCap);
      } else {
        this.removeAttr('stroke-linecap');
      }
    } else if (width != null) {
      this.rescaleTableDash();
    }

    if (opacity != null) {
      this.attr('stroke-opacity', String(opacity));
    }
  }

  /** The stroke width the dash lengths scale with: the written one, or the SVG default of 1. */
  private dashScale(): number {
    const width = Number.parseFloat(this._native.getAttribute('stroke-width') ?? '');
    return width > 0 ? width : 1;
  }

  /** Writes the style's dash array, scaled with the stroke width. Solid removes it. */
  private writeTableDash(style: StrokeStyle): void {
    const dashArray = ElementPeer.dashArray(style, this.dashScale());
    // Solid removes the attributes: an empty value is invalid SVG.
    if (dashArray) {
      this.attr('stroke-dasharray', dashArray);
    } else {
      this.removeAttr('stroke-dasharray');
    }
    this._tableDash = dashArray || null;
  }

  /**
   * A new width rescales the dash array written from the style table (BL5-77). A dash written by
   * other means (CurvedLine and Arrow setDashed) is left alone.
   */
  private rescaleTableDash(): void {
    const style = this._stokeStyle;
    if (
      style &&
      this._tableDash !== null &&
      this._native.getAttribute('stroke-dasharray') === this._tableDash
    ) {
      this.writeTableDash(style);
    }
  }

  /**
   * The dash array of a style as an attribute value ('' for solid). The table lengths are for a
   * stroke width of 1 and are multiplied by the width, so a thick dashed stroke keeps the same
   * look instead of closing its gaps (BL5-77).
   */
  static dashArray(style: StrokeStyle, strokeWidth: number): string {
    const scale = strokeWidth > 0 ? strokeWidth : 1;
    return ElementPeer.DASH_ARRAYS[style].map((length) => formatLength(length * scale)).join(' ');
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

  addClass(...names: string[]): void {
    this._native.classList.add(...names);
  }

  removeClass(...names: string[]): void {
    this._native.classList.remove(...names);
  }

  /** Toggles a class (see DOMTokenList.toggle); returns whether the element has it afterwards. */
  toggleClass(name: string, force?: boolean): boolean {
    return force === undefined
      ? this._native.classList.toggle(name)
      : this._native.classList.toggle(name, force);
  }

  hasClass(name: string): boolean {
    return this._native.classList.contains(name);
  }

  /** The single dash table, shared by every element type, for a stroke width of 1. */
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

  /** Creates an SVG node of `tag`, typed as its element (SVGRectElement for 'rect', ...). */
  protected static createNode<K extends keyof SVGElementTagNameMap>(
    tag: K,
  ): SVGElementTagNameMap[K] {
    return window.document.createElementNS(SVG_NAMESPACE, tag);
  }

  protected static linkNamespace = 'http://www.w3.org/1999/xlink';
}

export default ElementPeer;
