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
import { Text, Group, ElementClass, Point } from '@wisemapping/web2d';
import { $assert } from '@wisemapping/core-js';

import Icon from './Icon';
import IconGroup from './IconGroup';
import SvgIconModel from './model/SvgIconModel';
import SizeType from './SizeType';
import Topic from './Topic';
import ActionDispatcher from './ActionDispatcher';

class EmojiCharIcon implements Icon {
  private element: ElementClass;

  private group: IconGroup;

  private iconModel: SvgIconModel;

  private topic: Topic;

  constructor(topic: Topic, iconModel: SvgIconModel, readOnly: boolean) {
    $assert(iconModel, 'iconModel can not be null');
    $assert(topic, 'topic can not be null');
    this.iconModel = iconModel;
    this.topic = topic;

    this.element = new Group({
      width: 90,
      height: 90,
      x: 0,
      y: 0,
      coordSizeWidth: 15,
      coordSizeHeight: 15,
      coordOriginY: 2,
    });
    const iconText = new Text();
    iconText.setText(iconModel.getIconType());
    this.element.append(iconText);

    // Add events ...
    if (!readOnly) {
      this.element.setCursor('pointer');
    }
  }

  getElement(): ElementClass {
    return this.element;
  }

  setGroup(group: IconGroup) {
    this.group = group;
  }

  getGroup(): IconGroup {
    return this.group;
  }

  getSize(): SizeType {
    return this.group.getSize();
  }

  getPosition(): Point {
    return this.group.getPosition();
  }

  addEvent(type: string, fnc: (e: object) => void): void {
    this.element.addEvent(type, fnc);
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this.iconModel.getId();
    actionDispatcher.removeFeatureFromTopic(this.topic.getId(), featureId);
  }

  getModel(): SvgIconModel {
    return this.iconModel;
  }
}

export default EmojiCharIcon;
