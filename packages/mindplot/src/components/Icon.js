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
import { $assert } from '@wisemapping/core-js';
import * as web2d from '@wisemapping/web2d';

class Icon {
  constructor(url) {
    $assert(url, 'topic can not be null');
    this._image = new web2d.Image();
    this._image.setHref(url);
    this._image.setSize(Icon.SIZE, Icon.SIZE);
  }

  getImage() {
    return this._image;
  }

  setGroup(group) {
    this._group = group;
  }

  getGroup() {
    return this._group;
  }

  getSize() {
    return this._image.getSize();
  }

  getPosition() {
    return this._image.getPosition();
  }

  addEvent(type, fnc) {
    this._image.addEvent(type, fnc);
  }

  // eslint-disable-next-line class-methods-use-this
  remove() {
    throw new Error('Unsupported operation');
  }
}

Icon.SIZE = 90;

export default Icon;
