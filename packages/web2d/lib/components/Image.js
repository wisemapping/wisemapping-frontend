/*
 *    Copyright [2015] [wisemapping]
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
const Element = require('./Element').default;
const Toolkit = require('./Toolkit').default;

const Image = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createImage();
    this.parent(peer, attributes);
  },

  getType() {
    return 'Image';
  },

  setHref(href) {
    this._peer.setHref(href);
  },

  getHref() {
    return this._peer.getHref();
  },

  getSize() {
    return this._peer.getSize();
  },
});

export default Image;
