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

import { $defined } from './peer/utils/assert';
import ElementPeer from './peer/svg/ElementPeer';
import StyleAttributes from './StyleAttributes';

abstract class WorkspaceElement<T extends ElementPeer> {
  peer: T;

  constructor(peer: T, attributes: StyleAttributes, delayInit?: boolean) {
    this.peer = peer;
    if (peer == null) {
      throw new Error('Element peer can not be null');
    }

    if (!delayInit && attributes) {
      this._initialize(attributes);
    }
  }

  protected _initialize(attributes: StyleAttributes) {
    const batchExecute: Record<string, (string | number)[]> = {};

    // Collect arguments ...
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        const funcName = this._attributeNameToFuncName(key, 'set');
        let funcArgs = batchExecute[funcName];
        if (!$defined(funcArgs)) {
          funcArgs = [];
        }

        const signature =
          WorkspaceElement._propertyNameToSignature[
            key as keyof typeof WorkspaceElement._propertyNameToSignature
          ];
        const argPositions = signature?.[1];

        if (argPositions !== WorkspaceElement._SIGNATURE_MULTIPLE_ARGUMENTS) {
          const attrValue = attributes[key as keyof StyleAttributes];
          if (
            attrValue !== undefined &&
            argPositions !== undefined &&
            typeof argPositions === 'number' &&
            funcArgs !== undefined
          ) {
            funcArgs[argPositions] = attrValue as string | number;
            batchExecute[funcName] = funcArgs;
          }
        } else {
          const attrValue = attributes[key as keyof StyleAttributes];
          if (typeof attrValue === 'string') {
            funcArgs = attrValue.split(' ');
            batchExecute[funcName] = funcArgs;
          }
        }
      }
    }

    // Call functions ...
    // eslint-disable-next-line guard-for-in
    for (const key in batchExecute) {
      const func = (this as Record<string, unknown>)[key];
      if (!func) {
        throw new Error(`Could not find function: ${key}`);
      }
      const batchArgs = batchExecute[key];
      if (typeof func === 'function' && batchArgs) {
        func.apply(this, batchArgs);
      }
    }
  }

  setSize(width: number, height: number) {
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
  addEvent(type: string, listener: (event: Event, detail?: unknown) => void) {
    this.peer.addEvent(type, listener);
  }

  trigger(type: string, event: unknown) {
    this.peer.trigger(type, event);
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
  removeEvent(type: string, listener: (event: Event, detail?: unknown) => void) {
    this.peer.removeEvent(type, listener);
  }

  /**
   * /*
   * Returns element type name.
   */
  abstract getType(): string;

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
  setFill(color: string, opacity?: number): void {
    this.peer.setFill(color, opacity);
  }

  /*
   *  Defines the element stroke properties.
   *  width: stroke width
   *  style: "solid|dot|dash|dashdot|longdash".
   *  color: stroke color
   *  opacity: stroke visibility
   */
  setStroke(width: number | null, style?: string, color?: string, opacity?: number) {
    if (
      style != null &&
      style !== undefined &&
      style !== 'dash' &&
      style !== 'dot' &&
      style !== 'solid' &&
      style !== 'longdash' &&
      style !== 'dashdot'
    ) {
      throw new Error(`Unsupported stroke style: '${style}'`);
    }
    this.peer.setStroke(width, style, color, opacity);
  }

  _attributeNameToFuncName(attributeKey: string, prefix: string) {
    const signature =
      WorkspaceElement._propertyNameToSignature[
        attributeKey as keyof typeof WorkspaceElement._propertyNameToSignature
      ];
    if (!$defined(signature)) {
      throw new Error(`Unsupported attribute: ${attributeKey}`);
    }

    const propName = signature[0];
    if (typeof propName !== 'string') {
      throw new Error(`Invalid signature for attribute: ${attributeKey}`);
    }
    const firstLetter = propName.charAt(0);
    return prefix + firstLetter.toUpperCase() + propName.substring(1);
  }

  /**
   * All element properties can be setted using either a method
   *  invocation or attribute invocation.
   *  key: size, width, height, position, x, y, stroke, strokeWidth, strokeStyle,
   * strokeColor, strokeOpacity,
   *       fill, fillColor, fillOpacity, coordSize, coordSizeWidth, coordSizeHeight,
   * coordOrigin, coordOriginX, coordOrigiY
   */
  setAttribute(key: string, value: string | number) {
    const funcName = this._attributeNameToFuncName(key, 'set');

    const signature =
      WorkspaceElement._propertyNameToSignature[
        key as keyof typeof WorkspaceElement._propertyNameToSignature
      ];
    if (signature == null) {
      throw new Error(`Could not find the signature for:${key}`);
    }

    // Parse arguments ..
    const argPositions = signature[1];
    let args: (string | number)[] = [];
    if (
      argPositions !== WorkspaceElement._SIGNATURE_MULTIPLE_ARGUMENTS &&
      argPositions !== undefined &&
      typeof argPositions === 'number'
    ) {
      args[argPositions] = value;
    } else {
      const strValue = String(value);
      args = strValue.split(' ');
    }

    // Look up method ...
    const setter = (this as Record<string, unknown>)[funcName];
    if (setter == null) {
      throw new Error(`Could not find the function name:${funcName}`);
    }
    if (typeof setter === 'function') {
      setter.apply(this, args);
    }
  }

  getAttribute(key: string) {
    const funcName = this._attributeNameToFuncName(key, 'get');

    const signature =
      WorkspaceElement._propertyNameToSignature[
        key as keyof typeof WorkspaceElement._propertyNameToSignature
      ];
    if (signature == null) {
      throw new Error(`Could not find the signature for:${key}`);
    }

    const getter = (this as Record<string, unknown>)[funcName];
    if (getter == null) {
      throw new Error(`Could not find the function name:${funcName}`);
    }

    let getterResult: Record<string, unknown> = {};
    if (typeof getter === 'function') {
      getterResult = getter.apply(this, []) as Record<string, unknown>;
    }
    const attibuteName = signature[2];
    if (!$defined(attibuteName)) {
      throw new Error(`Could not find attribute mapping for:${key}`);
    }

    if (typeof attibuteName !== 'string' && typeof attibuteName !== 'number') {
      throw new Error(`Invalid attribute name type for:${key}`);
    }

    const result = getterResult[attibuteName];
    if (!$defined(result)) {
      throw new Error(`Could not find attribute with name:${attibuteName}`);
    }

    return result;
  }

  /**
   * Defines the element opacity.
   * Parameters:
   *   opacity: A value between 0 and 1.
   */
  setOpacity(opacity: number): void {
    this.peer.setStroke(null, null, null, opacity);
    this.peer.setFill(null, opacity);
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

  static _SIGNATURE_MULTIPLE_ARGUMENTS = -1;

  static _supportedEvents = [
    'click',
    'dblclick',
    'mousemove',
    'mouseout',
    'mouseover',
    'mousedown',
    'mouseup',
  ];

  private static _propertyNameToSignature = {
    // Format: [attribute name, argument position on setter, attribute name on getter]
    size: ['size', -1],
    width: ['size', 0, 'width'],
    height: ['size', 1, 'height'],

    position: ['position', -1],
    x: ['position', 0, 'x'],
    y: ['position', 1, 'y'],

    stroke: ['stroke', -1],
    strokeWidth: ['stroke', 0, 'width'],
    strokeStyle: ['stroke', 1, 'style'],
    strokeColor: ['stroke', 2, 'color'],
    strokeOpacity: ['stroke', 3, 'opacity'],

    fill: ['fill', -1],
    fillColor: ['fill', 0, 'color'],
    fillOpacity: ['fill', 1, 'opacity'],

    coordSize: ['coordSize', -1],
    coordSizeWidth: ['coordSize', 0, 'width'],
    coordSizeHeight: ['coordSize', 1, 'height'],

    coordOrigin: ['coordOrigin', -1],
    coordOriginX: ['coordOrigin', 0, 'x'],
    coordOriginY: ['coordOrigin', 1, 'y'],

    visibility: ['visibility', 0],
    opacity: ['opacity', 0],
  };
}
export default WorkspaceElement;
