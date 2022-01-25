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
import { Elipse } from '@wisemapping/web2d';

import TopicConfig from './TopicConfig';
import ActionDispatcher from './ActionDispatcher';

class ShirinkConnector {
  constructor(topic) {
    this._isShrink = false;
    const ellipse = new Elipse(TopicConfig.INNER_RECT_ATTRIBUTES);
    this._ellipse = ellipse;
    ellipse.setFill('rgb(62,118,179)');

    ellipse.setSize(TopicConfig.CONNECTOR_WIDTH, TopicConfig.CONNECTOR_WIDTH);
    ellipse.addEvent('click', (event) => {
      const model = topic.getModel();
      const collapse = !model.areChildrenShrunken();

      const topicId = topic.getId();
      const actionDispatcher = ActionDispatcher.getInstance();
      actionDispatcher.shrinkBranch([topicId], collapse);

      event.stopPropagation();
    });

    ellipse.addEvent('mousedown', (event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    ellipse.addEvent('dblclick', (event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    ellipse.addEvent('mouseover', () => {
      ellipse.setStroke(this._isShrink ? 1 : 2, 'solid');
    });

    ellipse.addEvent('mouseout', () => {
      ellipse.setStroke(this._isShrink ? 2 : 1, 'solid');
    });

    ellipse.setCursor('default');
    this._fillColor = '#f7f7f7';
    const model = topic.getModel();
    this.changeRender(model.areChildrenShrunken());
  }

  changeRender(isShrink) {
    const elipse = this._ellipse;
    if (isShrink) {
      elipse.setStroke('2', 'solid');
    } else {
      elipse.setStroke('1', 'solid');
    }
    this._isShrink = isShrink;
  }

  setVisibility(value) {
    this._ellipse.setVisibility(value);
  }

  setOpacity(opacity) {
    this._ellipse.setOpacity(opacity);
  }

  setFill(color) {
    this._fillColor = color;
    this._ellipse.setFill(color);
  }

  setAttribute(name, value) {
    this._ellipse.setAttribute(name, value);
  }

  addToWorkspace(group) {
    group.append(this._ellipse);
  }

  setPosition(x, y) {
    this._ellipse.setPosition(x, y);
  }

  moveToBack() {
    this._ellipse.moveToBack();
  }

  moveToFront() {
    this._ellipse.moveToFront();
  }
}

export default ShirinkConnector;
