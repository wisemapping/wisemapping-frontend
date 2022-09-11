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

class ElementClass {
  constructor(peer, attributes, delayInit) {
    this.peer = peer;
    if (peer == null) {
      throw new Error('Element peer can not be null');
    }

    if (!delayInit) {
      if ($defined(attributes)) {
        this._initialize(attributes);
      }
    }
  }

  _initialize(attributes) {
    const batchExecute = {};

    // Collect arguments ...
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        const funcName = this._attributeNameToFuncName(key, 'set');
        let funcArgs = batchExecute[funcName];
        if (!$defined(funcArgs)) {
          funcArgs = [];
        }

        const signature = Element._propertyNameToSignature[key];
        const argPositions = signature[1];

        if (argPositions !== Element._SIGNATURE_MULTIPLE_ARGUMENTS) {
          funcArgs[argPositions] = attributes[key];
        } else {
          funcArgs = attributes[key].split(' ');
        }
        batchExecute[funcName] = funcArgs;
      }
    }

    // Call functions ...
    // eslint-disable-next-line guard-for-in
    for (const key in batchExecute) {
      const func = this[key];
      if (!$defined(func)) {
        throw new Error(`Could not find function: ${key}`);
      }
      func.apply(this, batchExecute[key]);
    }
  }

  setSize(width, height) {
    this.peer.setSize(width, height);
  }

  setPosition(cx, cy) {
    this.peer.setPosition(cx, cy);
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
  addEvent(type, listener) {
    this.peer.addEvent(type, listener);
  }

  trigger(type, event) {
    this.peer.trigger(type, event);
  }

  cloneEvents(from) {
    this.peer.cloneEvents(from);
  }

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
  removeEvent(type, listener) {
    this.peer.removeEvent(type, listener);
  }

  /**
   * /*
   * Returns element type name.
   */
  // eslint-disable-next-line class-methods-use-this
  getType() {
    throw new Error(
      'Not implemeneted yet. This method must be implemented by all the inherited objects.',
    );
  }

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
  setFill(color, opacity) {
    this.peer.setFill(color, opacity);
  }

  getPosition() {
    return this.peer.getPosition();
  }

  getNativePosition() {
    return this.peer.getNativePosition();
  }

  /*
   *  Defines the element stroke properties.
   *  width: stroke width
   *  style: "solid|dot|dash|dashdot|longdash".
   *  color: stroke color
   *  opacity: stroke visibility
   */
  setStroke(width, style, color, opacity) {
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

  // eslint-disable-next-line class-methods-use-this
  _attributeNameToFuncName(attributeKey, prefix) {
    const signature = Element._propertyNameToSignature[attributeKey];
    if (!$defined(signature)) {
      throw new Error(`Unsupported attribute: ${attributeKey}`);
    }

    const firstLetter = signature[0].charAt(0);
    return prefix + firstLetter.toUpperCase() + signature[0].substring(1);
  }

  /**
   * All element properties can be setted using either a method
   *  invocation or attribute invocation.
   *  key: size, width, height, position, x, y, stroke, strokeWidth, strokeStyle,
   * strokeColor, strokeOpacity,
   *       fill, fillColor, fillOpacity, coordSize, coordSizeWidth, coordSizeHeight,
   * coordOrigin, coordOriginX, coordOrigiY
   */
  setAttribute(key, value) {
    const funcName = this._attributeNameToFuncName(key, 'set');

    const signature = Element._propertyNameToSignature[key];
    if (signature == null) {
      throw new Error(`Could not find the signature for:${key}`);
    }

    // Parse arguments ..
    const argPositions = signature[1];
    let args = [];
    if (argPositions !== this._SIGNATURE_MULTIPLE_ARGUMENTS) {
      args[argPositions] = value;
    } else {
      const strValue = String(value);
      args = strValue.split(' ');
    }

    // Look up method ...
    const setter = this[funcName];
    if (setter == null) {
      throw new Error(`Could not find the function name:${funcName}`);
    }
    setter.apply(this, args);
  }

  getAttribute(key) {
    const funcName = this._attributeNameToFuncName(key, 'get');

    const signature = Element._propertyNameToSignature[key];
    if (signature == null) {
      throw new Error(`Could not find the signature for:${key}`);
    }

    const getter = this[funcName];
    if (getter == null) {
      throw new Error(`Could not find the function name:${funcName}`);
    }

    const getterResult = getter.apply(this, []);
    const attibuteName = signature[2];
    if (!$defined(attibuteName)) {
      throw new Error(`Could not find attribute mapping for:${key}`);
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
  setOpacity(opacity) {
    this.peer.setStroke(null, null, null, opacity);
    this.peer.setFill(null, opacity);
  }

  setVisibility(value, fade) {
    this.peer.setVisibility(value, fade);
  }

  isVisible() {
    return this.peer.isVisible();
  }

  /**
   * Move the element to the front
   */
  moveToFront() {
    this.peer.moveToFront();
  }

  /**
   * Move the element to the back
   */
  moveToBack() {
    this.peer.moveToBack();
  }

  getStroke() {
    return this.peer.getStroke();
  }

  setCursor(type) {
    this.peer.setCursor(type);
  }

  getParent() {
    return this.peer.getParent();
  }

  setTestId(testId) {
    this.peer._native.setAttribute('test-id', testId);
  }
}

Element._SIGNATURE_MULTIPLE_ARGUMENTS = -1;
Element._supportedEvents = [
  'click',
  'dblclick',
  'mousemove',
  'mouseout',
  'mouseover',
  'mousedown',
  'mouseup',
];
Element._propertyNameToSignature = {
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

export default ElementClass;
