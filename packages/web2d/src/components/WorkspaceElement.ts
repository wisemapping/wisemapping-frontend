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

import ElementPeer, {
  CustomEventMap,
  ElementEvent,
  ElementListener,
  EventDetail,
} from './peer/svg/ElementPeer';
import StyleAttributes, {
  collectAttributeCalls,
  toNumber,
  toText,
  type AttributeArguments,
  type AttributeSetter,
} from './StyleAttributes';
import { isStrokeStyle, type ElementType } from './types';

/**
 * A listener of the `type` event of an element: it gets the typed event (see ElementEvent) and,
 * for a custom event, its detail as a second argument.
 */
export type ElementEventListener<M extends CustomEventMap, K extends string> = (
  event: ElementEvent<M, K>,
  detail?: EventDetail<M, K>,
) => void;

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
          toText(args[1]),
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
    // The DOM boundary: the peer dispatches plain Events, of the type K names.
    this.peer.addEvent(type, listener as ElementListener);
  }

  /** Fires a custom event of the element's map: listeners get `detail` as their second argument. */
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
    this.peer.removeEvent(type, listener as ElementListener);
  }

  /**
   * /*
   * Returns element type name.
   */
  abstract getType(): ElementType;

  /**
   * Todo: Doc
   */
  getFill() {
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
  setStroke(width: number | null, style?: string, color?: string, opacity?: number): void {
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

  getStroke() {
    return this.peer.getStroke();
  }

  setCursor(type: string) {
    this.peer.setCursor(type);
  }

  setTestId(testId: string) {
    this.peer._native.setAttribute('test-id', testId);
  }
}
export default WorkspaceElement;
