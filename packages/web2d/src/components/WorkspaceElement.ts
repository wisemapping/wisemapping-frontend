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

import {
  type CustomEventMap,
  type ElementEvent,
  type ElementListener,
} from './peer/svg/ElementPeer';
import type ElementPeer from './peer/svg/ElementPeer';
import type StyleAttributes from './StyleAttributes';
import {
  collectAttributeCalls,
  toNumber,
  toStrokeStyle,
  toText,
  type AttributeArguments,
  type AttributeSetter,
} from './StyleAttributes';
import { isStrokeStyle, type ElementType, type StrokeStyle } from './types';

/**
 * A listener of the `type` event of an element: it gets the typed event (see ElementEvent). A
 * custom event fired with trigger() is a CustomEvent, whose `detail` is the payload.
 */
export type ElementEventListener<M extends CustomEventMap, K extends string> = ElementListener<
  ElementEvent<M, K>
>;

/**
 * `M` maps the element's custom event names to their detail type (see CustomEventMap).
 */
abstract class WorkspaceElement<T extends ElementPeer, M extends CustomEventMap = CustomEventMap> {
  readonly peer: T;

  constructor(peer: T, attributes: StyleAttributes = {}, delayInit?: boolean) {
    this.peer = peer;
    if (peer == null) {
      throw new Error('Element peer can not be null');
    }

    if (!delayInit) {
      this._initialize(attributes);
    }
  }

  protected _initialize(attributes: StyleAttributes): void {
    collectAttributeCalls(attributes).forEach((args, setter) => this.applyAttribute(setter, args));
  }

  /**
   * Calls the setter of one attribute group with its collected arguments. Elements with a
   * position or a coordinate system handle those groups too; here they are unsupported.
   */
  protected applyAttribute(setter: AttributeSetter, args: AttributeArguments): void {
    switch (setter) {
      case 'size':
        this.setSize(toNumber(args[0]), toNumber(args[1]));
        break;
      case 'stroke':
        this.setStroke(
          toNumber(args[0]) ?? null,
          toStrokeStyle(args[1]),
          toText(args[2]),
          toNumber(args[3]),
        );
        break;
      case 'fill':
        this.setFill(toText(args[0]), toNumber(args[1]));
        break;
      case 'visibility':
        this.setVisibility(Boolean(args[0]));
        break;
      case 'opacity':
        this.setOpacity(Number(args[0]));
        break;
      default:
        throw new Error(
          `Could not find function: set${setter.charAt(0).toUpperCase()}${setter.substring(1)}`,
        );
    }
  }

  /** Sets the size. A missing width or height keeps the current one. */
  setSize(width?: number | null, height?: number | null): void {
    this.peer.setSize(width, height);
  }

  /**
   * Allows the registration of event listeners on the event target.
   * type
   *     A string representing the event type to listen for.
   * listener
   *     The object that receives a notification when an event of the
   * specified type occurs. This must be an object implementing the
   * EventListener interface, or simply a function in JavaScript.
   *
   * The following events types are supported:
   *
   */
  addEvent<K extends string>(type: K, listener: ElementEventListener<M, K>): void {
    this.peer.addEvent(type, listener);
  }

  /** Fires a custom event of the element's map: listeners read `detail` from the CustomEvent. */
  trigger<K extends keyof M & string>(type: K, detail?: M[K]): void {
    this.peer.trigger(type, detail);
  }

  /** Removes every listener added with addEvent(). */
  dispose(): void {
    this.peer.dispose();
  }

  // cloneEvents(from) {
  //   this.peer.cloneEvents(from);
  // }

  /**
   *
   * Allows the removal of event listeners from the event target.
   *
   * Parameters:
   * type
   *    A string representing the event type being registered.
   * listener
   *     The listener parameter takes an interface implemented by
   * the user which contains the methods to be called when the event occurs.
   *     This interace will be invoked passing an event as argument and
   * the 'this' referece in the function will be the element.
   */
  removeEvent<K extends string>(type: K, listener: ElementEventListener<M, K>): void {
    this.peer.removeEvent(type, listener);
  }

  /**
   * /*
   * Returns element type name.
   */
  abstract getType(): ElementType;

  /**
   * Todo: Doc
   */
  getFill(): { color: string | null; opacity: number } {
    return this.peer.getFill();
  }

  /**
   * Used to define the fill element color and element opacity.
   * color: Fill color
   * opacity: Opacity of the fill. It must be less than 1.
   */
  setFill(color?: string | null, opacity?: number | null): void {
    this.peer.setFill(color, opacity);
  }

  /*
   *  Defines the element stroke properties.
   *  width: stroke width
   *  style: "solid|dot|dash|dashdot|longdash".
   *  color: stroke color
   *  opacity: stroke visibility
   */
  setStroke(
    width: number | null,
    style?: StrokeStyle | null,
    color?: string,
    opacity?: number,
  ): void {
    // Checked at run time too: JavaScript callers and attribute strings are not type checked.
    if (style != null && !isStrokeStyle(style)) {
      throw new Error(`Unsupported stroke style: '${style}'`);
    }
    this.peer.setStroke(width, style, color, opacity);
  }

  /**
   * Defines the opacity of the whole element (the CSS opacity property), between 0 and 1. It
   * is independent of the fill and stroke opacities, and kept by setVisibility().
   */
  setOpacity(opacity: number): void {
    this.peer.setOpacity(opacity);
  }

  setVisibility(value: boolean, fade?: number): void {
    this.peer.setVisibility(value, fade);
  }

  isVisible(): boolean {
    return this.peer.isVisible();
  }

  /**
   * Move the element to the front
   */
  moveToFront(): void {
    this.peer.moveToFront();
  }

  /**
   * Move the element to the back
   */
  moveToBack(): void {
    this.peer.moveToBack();
  }

  getStroke(): {
    color: string | null;
    style: StrokeStyle | null;
    opacity: number;
    width: number | null;
  } {
    return this.peer.getStroke();
  }

  setCursor(type: string): void {
    this.peer.setCursor(type);
  }

  /**
   * Adds CSS classes to the element, for a visual state (hover, selected, ...) a stylesheet can
   * style instead of attributes rewritten on every change.
   */
  addClass(...names: string[]): void {
    this.peer.addClass(...names);
  }

  removeClass(...names: string[]): void {
    this.peer.removeClass(...names);
  }

  /**
   * Toggles a CSS class, or adds it when `force` is true and removes it when false. Returns whether
   * the element has the class afterwards.
   */
  toggleClass(name: string, force?: boolean): boolean {
    return this.peer.toggleClass(name, force);
  }

  hasClass(name: string): boolean {
    return this.peer.hasClass(name);
  }

  /**
   * The SVG node of the element, for DOM work web2d has no method for (measuring it on screen,
   * anchoring a popover). Prefer the element methods: the node is the peer's implementation.
   */
  getNode(): T['_native'] {
    return this.peer._native;
  }

  setTestId(testId: string): void {
    this.peer._native.setAttribute('test-id', testId);
  }
}
export default WorkspaceElement;
