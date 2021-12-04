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
import Icon from './Icon';

class ActionIcon extends Icon {

  constructor(topic, url) {
    super(url);
    this._node = topic;
  }

  getNode() {
    return this._node;
  }

  setPosition(x, y) {
    const size = this.getSize();
    this.getImage().setPosition(x - size.width / 2, y - size.height / 2);
  }

  addEvent(event, fn) {
    this.getImage().addEvent(event, fn);
  }

  addToGroup(group) {
    group.append(this.getImage());
  }

  setVisibility(visible) {
    this.getImage().setVisibility(visible);
  }

  isVisible() {
    return this.getImage().isVisible();
  }

  setCursor(cursor) {
    return this.getImage().setCursor(cursor);
  }

  moveToBack(cursor) {
    return this.getImage().moveToBack(cursor);
  }

  moveToFront(cursor) {
    return this.getImage().moveToFront(cursor);
  }
}

export default ActionIcon;
