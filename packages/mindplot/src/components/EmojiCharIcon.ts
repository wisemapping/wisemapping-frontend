/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { Text, Group } from '@wisemapping/web2d';

import Icon from './Icon';
import IconGroup from './IconGroup';
import SvgIconModel from './model/SvgIconModel';
import SizeType from './SizeType';
import Topic from './Topic';
import ActionDispatcher from './ActionDispatcher';
import PositionType from './PositionType';

class EmojiCharIcon implements Icon {
  private _group: Group;

  private _iconGroup: IconGroup | null;

  private _iconModel: SvgIconModel;

  private _topic: Topic;

  constructor(topic: Topic, iconModel: SvgIconModel, readOnly: boolean) {
    this._iconModel = iconModel;
    this._topic = topic;

    this._group = new Group({
      width: 70,
      height: 70,
      x: 0,
      y: 0,
      coordSizeWidth: 15,
      coordSizeHeight: 15,
      coordOriginY: 0,
    });
    const iconText = new Text();
    iconText.setText(iconModel.getIconType());
    this._group.append(iconText);

    // Add events ...
    if (!readOnly) {
      this._group.setCursor('pointer');
    }
    this._iconGroup = null;
  }

  getElement(): Group {
    return this._group;
  }

  setGroup(group: IconGroup) {
    this._iconGroup = group;
  }

  getGroup(): IconGroup {
    return this._iconGroup!;
  }

  getSize(): SizeType {
    return this._iconGroup!.getSize();
  }

  getPosition(): PositionType {
    return this._iconGroup!.getPosition();
  }

  addEvent(type: string, fnc: (e: object) => void): void {
    this._group.addEvent(type, fnc);
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._iconModel.getId();
    actionDispatcher.removeFeatureFromTopic(this._topic.getId(), featureId);
  }

  getModel(): SvgIconModel {
    return this._iconModel;
  }
}

export default EmojiCharIcon;
