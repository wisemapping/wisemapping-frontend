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
// eslint-disable-next-line max-classes-per-file
import {
  $assert,
  $defined
} from '@wisemapping/core-js';
import {
  Group
} from '@wisemapping/web2d';
import IconGroupRemoveTip from './IconGroupRemoveTip';

import NoteModel from './model/NoteModel';
import LinkModel from './model/LinkModel';
import IconModel from './model/IconModel';
import Icon from './Icon';

const ORDER_BY_TYPE = new Map();
ORDER_BY_TYPE.set(IconModel.FEATURE_TYPE, 0);
ORDER_BY_TYPE.set(NoteModel.FEATURE_TYPE, 1);
ORDER_BY_TYPE.set(LinkModel.FEATURE_TYPE, 2);

class IconGroup {
  constructor(topicId, iconSize) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert($defined(iconSize), 'iconSize can not be null');

    this._icons = [];
    this._group = new Group({
      width: 0,
      height: iconSize,
      x: 0,
      y: 0,
      coordSizeWidth: 0,
      coordSizeHeight: 100,
    });
    this._removeTip = new IconGroupRemoveTip(this._group, topicId);
    this.seIconSize(iconSize, iconSize);

    this._registerListeners();
  }

  /** */
  setPosition(x, y) {
    this._group.setPosition(x, y);
  }

  /** */
  getPosition() {
    return this._group.getPosition();
  }

  /** */
  getNativeElement() {
    return this._group;
  }

  /** */
  getSize() {
    return this._group.getSize();
  }

  /** */
  seIconSize(width, height) {
    this._iconSize = {
      width,
      height,
    };
    this._resize(this._icons.length);
  }

  /**
   * @param icon the icon to be added to the icon group
   * @param {Boolean} remove
   * @throws will throw an error if icon is not defined
   */
  addIcon(icon, remove) {
    $defined(icon, 'icon is not defined');

    // Order could have change, need to re-add all.
    const icons = this._icons.slice();
    this._icons.forEach((i) => {
      this._removeIcon(i);
    });

    icon.setGroup(this);
    icons.push(icon);
    this._icons = icons.sort((a, b) => ORDER_BY_TYPE.get(a.getModel().getType()) - ORDER_BY_TYPE.get(b.getModel().getType()));

    // Add all the nodes back ...
    this._resize(this._icons.length);
    this._icons.forEach((i, index) => {
      this._positionIcon(i, index);
      const imageShape = i.getImage();
      this._group.append(imageShape);
    });

    // Register event for the group ..
    if (remove) {
      this._removeTip.decorate(this._topicId, icon);
    }
  }

  _findIconFromModel(iconModel) {
    let result = null;

    this._icons.forEach((icon) => {
      const elModel = icon.getModel();

      if (elModel.getId() === iconModel.getId()) {
        result = icon;
      }
    });

    if (result == null) {
      throw new Error(`Icon can no be found:${iconModel.getId()} Icons:${this._icons}`);
    }

    return result;
  }

  /** */
  removeIconByModel(featureModel) {
    $assert(featureModel, 'featureModel can not be null');

    const icon = this._findIconFromModel(featureModel);
    this._removeIcon(icon);
  }

  _removeIcon(icon) {
    $assert(icon, 'icon can not be null');

    this._removeTip.close(0);
    this._group.removeChild(icon.getImage());

    this._icons = this._icons.filter((i) => i !== icon);
    this._resize(this._icons.length);
    const me = this;

    // Add all again ...
    this._icons.forEach((elem, i) => {
      me._positionIcon(elem, i);
    });
  }

  /** */
  moveToFront() {
    this._group.moveToFront();
  }

  _registerListeners() {
    this._group.addEvent('click', (event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    this._group.addEvent('dblclick', (event) => {
      event.stopPropagation();
    });
  }

  _resize(iconsLength) {
    this._group.setSize(iconsLength * this._iconSize.width, this._iconSize.height);

    const iconSize = Icon.SIZE + IconGroup.ICON_PADDING * 2;
    this._group.setCoordSize(iconsLength * iconSize, iconSize);
  }

  _positionIcon(icon, order) {
    const iconSize = Icon.SIZE + IconGroup.ICON_PADDING * 2;
    icon.getImage().setPosition(
      iconSize * order + IconGroup.ICON_PADDING,
      IconGroup.ICON_PADDING,
    );
  }
}

IconGroup.ICON_PADDING = 5;
export default IconGroup;