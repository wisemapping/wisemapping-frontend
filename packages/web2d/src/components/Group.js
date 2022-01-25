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

import { $defined } from '@wisemapping/core-js';
import ElementClass from './ElementClass';
import Toolkit from './Toolkit';

/**
 * A group object can be used to collect shapes.
 */
class Group extends ElementClass {
  constructor(attributes) {
    const peer = Toolkit.createGroup();
    const defaultAttributes = {
      width: 50,
      height: 50,
      x: 50,
      y: 50,
      coordOrigin: '0 0',
      coordSize: '50 50',
    };
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    super(peer, defaultAttributes);
  }

  /**
     * Remove an element as a child to the object.
     */
  removeChild(element) {
    if (!$defined(element)) {
      throw new Error('Child element can not be null');
    }

    if (element === this) {
      throw new Error("It's not possible to add the group as a child of itself");
    }

    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    this.peer.removeChild(element.peer);
  }

  /**
     * Appends an element as a child to the object.
     */
  append(element) {
    if (!$defined(element)) {
      throw Error('Child element can not be null');
    }

    if (element === this) {
      throw new Error("It's not posible to add the group as a child of itself");
    }

    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    if (elementType === 'Workspace') {
      throw new Error('A group can not have a workspace as a child');
    }

    this.peer.append(element.peer);
  }

  getType() {
    return 'Group';
  }

  /**
     * The group element is a containing blocks for this content
     * - they define a CSS2 "block level box".
     * Inside the containing block a local coordinate system is
     * defined for any sub-elements using the coordsize and coordorigin attributes.
     * All CSS2 positioning information is expressed in terms of this local coordinate space.
     * Consequently CSS2 position attributes (left, top, width, height and so on)
     * have no unit specifier -
     * they are simple numbers, not CSS length quantities.
     */
  setCoordSize(width, height) {
    this.peer.setCoordSize(width, height);
  }

  setCoordOrigin(x, y) {
    this.peer.setCoordOrigin(x, y);
  }

  getCoordOrigin() {
    return this.peer.getCoordOrigin();
  }

  getSize() {
    return this.peer.getSize();
  }

  setFill() {
    throw new Error('Unsupported operation. Fill can not be set to a group');
  }

  setStroke() {
    throw new Error('Unsupported operation. Stroke can not be set to a group');
  }

  getCoordSize() {
    return this.peer.getCoordSize();
  }

  appendDomChild(DomElement) {
    if (!$defined(DomElement)) {
      throw new Error('Child element can not be null');
    }

    if (DomElement === this) {
      throw new Error('Its not possible to add the group as a child of itself');
    }

    this.peer._native.append(DomElement);
  }

  setOpacity(value) {
    this.peer.setOpacity(value);
  }

  /*
  setTestId(testId) {
    this.peer._native.setAttribute('test-id', testId);
  }
  */
}

export default Group;
