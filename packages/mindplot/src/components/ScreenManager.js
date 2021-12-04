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

class ScreenManager {
  constructor(divElement) {
    $assert(divElement, 'can not be null');
    this._divContainer = divElement;
    this._padding = { x: 0, y: 0 };

    // Ignore default click event propagation. Prevent 'click' event on drag.
    this._clickEvents = [];
    this._divContainer.bind('click', (event) => {
      event.stopPropagation();
    });

    this._divContainer.bind('dblclick', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
  }

  setScale(scale) {
    $assert(scale, 'Screen scale can not be null');
    this._scale = scale;
  }

  addEvent(event, listener) {
    if (event === 'click') this._clickEvents.push(listener);
    else this._divContainer.bind(event, listener);
  }

  removeEvent(event, listener) {
    if (event === 'click') {
      this._clickEvents.remove(listener);
    } else {
      this._divContainer.unbind(event, listener);
    }
  }

  fireEvent(type, event) {
    if (type === 'click') {
      _.each(this._clickEvents, (listener) => {
        listener(type, event);
      });
    } else {
      this._divContainer.trigger(type, event);
    }
  }

  _getElementPosition(elem) {
    // Retrieve current element position.
    const elementPosition = elem.getPosition();
    let { x } = elementPosition;
    let { y } = elementPosition;

    // Add workspace offset.
    x -= this._padding.x;
    y -= this._padding.y;

    // Scale coordinate in order to be relative to the workspace. That's coord/size;
    x /= this._scale;
    y /= this._scale;

    // Remove decimal part..
    return { x, y };
  }

  getWorkspaceIconPosition(e) {
    // Retrieve current icon position.
    const image = e.getImage();
    const elementPosition = image.getPosition();
    const imageSize = e.getSize();

    // Add group offset
    const iconGroup = e.getGroup();
    const group = iconGroup.getNativeElement();
    const coordOrigin = group.getCoordOrigin();
    const groupSize = group.getSize();
    const coordSize = group.getCoordSize();

    const scale = {
      x: coordSize.width / parseInt(groupSize.width, 10),
      y: coordSize.height / parseInt(groupSize.height, 10),
    };

    let x = (elementPosition.x - coordOrigin.x - parseInt(imageSize.width, 10) / 2) / scale.x;
    let y = (elementPosition.y - coordOrigin.y - parseInt(imageSize.height, 10) / 2) / scale.y;

    // Retrieve iconGroup Position
    const groupPosition = iconGroup.getPosition();
    x += groupPosition.x;
    y += groupPosition.y;

    // Retrieve topic Position
    const topic = iconGroup.getTopic();
    const topicPosition = this._getElementPosition(topic);
    topicPosition.x -= parseInt(topic.getSize().width, 10) / 2;

    // Remove decimal part..
    return { x: x + topicPosition.x, y: y + topicPosition.y };
  }

  getWorkspaceMousePosition(event) {
    // Retrieve current mouse position.
    let x = event.clientX;
    let y = event.clientY;

    // FIXME: paulo: why? Subtract div position.
    /* var containerPosition = this.getContainer().position();
         x = x - containerPosition.x;
         y = y - containerPosition.y; */

    // Scale coordinate in order to be relative to the workspace. That's coordSize/size;
    x *= this._scale;
    y *= this._scale;

    // Add workspace offset.
    x += this._padding.x;
    y += this._padding.y;

    // Remove decimal part..
    return new web2d.Point(x, y);
  }

  getContainer() {
    return this._divContainer;
  }

  setOffset(x, y) {
    this._padding.x = x;
    this._padding.y = y;
  }
}

export default ScreenManager;
