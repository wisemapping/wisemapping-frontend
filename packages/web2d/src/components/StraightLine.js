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

import ElementClass from './ElementClass';
import Toolkit from './Toolkit';

class StraightLine extends ElementClass {
  constructor(attributes) {
    const peer = Toolkit.createStraightLine();
    const defaultAttributes = { strokeColor: '#495879', strokeWidth: 1, strokeOpacity: 1 };
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    super(peer, defaultAttributes);
  }

  getType() {
    return 'Line';
  }

  setFrom(x, y) {
    this.peer.setFrom(x, y);
  }

  setTo(x, y) {
    this.peer.setTo(x, y);
  }

  getFrom() {
    return this.peer.getFrom();
  }

  getTo() {
    return this.peer.getTo();
  }

  setPosition() {
    throw new Error('Unsupported operation');
  }

  setSize() {
    throw new Error('Unsupported operation');
  }

  setFill() {
    throw new Error('Unsupported operation');
  }
}

export default StraightLine;
