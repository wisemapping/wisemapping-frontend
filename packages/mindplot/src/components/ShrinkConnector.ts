/* eslint-disable no-bitwise */
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
import { Elipse, Group } from '@wisemapping/web2d';

import TopicConfig from './TopicConfig';
import ActionDispatcher from './ActionDispatcher';
import Topic from './Topic';

class ShirinkConnector {
  private _isShrink: boolean;

  private _ellipse: Elipse;

  constructor(topic: Topic) {
    this._isShrink = false;
    const ellipse = new Elipse(TopicConfig.INNER_RECT_ATTRIBUTES);
    this._ellipse = ellipse;

    ellipse.setSize(TopicConfig.CONNECTOR_WIDTH, TopicConfig.CONNECTOR_WIDTH);
    ellipse.addEvent('click', (event: Event) => {
      const model = topic.getModel();
      const collapse = !model.areChildrenShrunken();

      const topicId = topic.getId();
      const actionDispatcher = ActionDispatcher.getInstance();
      actionDispatcher.shrinkBranch([topicId], collapse);

      event.stopPropagation();
    });

    ellipse.addEvent('mousedown', (event: Event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    ellipse.addEvent('dblclick', (event: Event) => {
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
    const model = topic.getModel();
    this.changeRender(model.areChildrenShrunken());
  }

  changeRender(isShrink: boolean) {
    const elipse = this._ellipse;
    if (isShrink) {
      elipse.setStroke('2', 'solid');
    } else {
      elipse.setStroke('1', 'solid');
    }
    this._isShrink = isShrink;
  }

  setColor(color: string) {
    this._ellipse.setStroke('1', 'solid', color);
    this._ellipse.setFill(this.lightenColor(color, 100));
  }

  private lightenColor(col: string, amt: number): string {
    let usePound = false;

    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }

    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00ff) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000ff) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
  }

  setVisibility(value: boolean, fade = 0): void {
    this._ellipse.setVisibility(value, fade);
  }

  setOpacity(opacity: number): void {
    this._ellipse.setOpacity(opacity);
  }

  setAttribute(name: string, value: string) {
    this._ellipse.setAttribute(name, value);
  }

  addToWorkspace(group: Group): void {
    group.append(this._ellipse);
  }

  setPosition(x: number, y: number): void {
    this._ellipse.setPosition(x + 3, y + 3);
  }

  moveToBack(): void {
    this._ellipse.moveToBack();
  }

  moveToFront(): void {
    this._ellipse.moveToFront();
  }
}

export default ShirinkConnector;
