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
import Element from './Element';
import Toolkit from './Toolkit';

const Line = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createLine();
    const defaultAttributes = { strokeColor: '#495879', strokeWidth: 1, strokeOpacity: 1 };
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'Line';
  },

  setFrom(x, y) {
    this.peer.setFrom(x, y);
  },

  setTo(x, y) {
    this.peer.setTo(x, y);
  },

  getFrom() {
    return this.peer.getFrom();
  },

  getTo() {
    return this.peer.getTo();
  },

  /**
     * Defines the start and the end line arrow style.
     * Can have values "none | block | classic | diamond | oval | open | chevron | doublechevron"
     * */
  setArrowStyle(startStyle, endStyle) {
    this.peer.setArrowStyle(startStyle, endStyle);
  },

  setPosition() {
    throw new Error('Unsupported operation');
  },

  setSize() {
    throw new Error('Unsupported operation');
  },

  setFill() {
    throw new Error('Unsupported operation');
  },
});

export default Line;
