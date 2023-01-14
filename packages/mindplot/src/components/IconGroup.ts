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

import { $assert, $defined } from '@wisemapping/core-js';
import { Group, ElementClass, Point } from '@wisemapping/web2d';
import IconGroupRemoveTip from './IconGroupRemoveTip';
import ImageIcon from './ImageIcon';
import SizeType from './SizeType';
import FeatureModel from './model/FeatureModel';
import Icon from './Icon';

const ORDER_BY_TYPE = new Map<string, number>();
ORDER_BY_TYPE.set('icon', 0);
ORDER_BY_TYPE.set('note', 1);
ORDER_BY_TYPE.set('link', 2);

class IconGroup {
  private _icons: Icon[];

  private _group: Group;

  private _removeTip: IconGroupRemoveTip;

  private _iconSize: SizeType | null;

  private _topicId: number;

  constructor(topicId: number, iconSize: number) {
    this._topicId = topicId;
    this._icons = [];
    this._group = new Group({
      width: 0,
      height: iconSize,
      x: 0,
      y: 0,
      coordSizeWidth: 0,
      coordSizeHeight: 100,
    });
    this._removeTip = new IconGroupRemoveTip(this._group);
    this.seIconSize(iconSize, iconSize);
    this._registerListeners();
    this._iconSize = null;
  }

  setPosition(x: number, y: number): void {
    this._group.setPosition(x, y);
  }

  getPosition(): Point {
    return this._group.getPosition();
  }

  getNativeElement(): ElementClass {
    return this._group;
  }

  /** */
  getSize(): SizeType {
    return this._group.getSize();
  }

  /** */
  seIconSize(width: number, height: number) {
    this._iconSize = {
      width,
      height,
    };
    this._resize(this._icons.length);
  }

  addIcon(icon: Icon, remove: boolean): void {
    $defined(icon, 'icon is not defined');

    // Order could have change, need to re-add all.
    const icons = this._icons.slice();
    this._icons.forEach((i) => {
      this._removeIcon(i);
    });

    icon.setGroup(this);
    icons.push(icon);
    this._icons = icons.sort(
      (a, b) =>
        ORDER_BY_TYPE.get(a.getModel().getType())! - ORDER_BY_TYPE.get(b.getModel().getType())!,
    );

    // Add all the nodes back ...
    this._resize(this._icons.length);
    this._icons.forEach((i, index) => {
      this._positionIcon(i, index);
      const imageShape = i.getElement();
      this._group.append(imageShape);
    });

    // Register event for the group ..
    if (remove) {
      this._removeTip.decorate(this._topicId, icon);
    }
  }

  private _findIconFromModel(iconModel: FeatureModel): Icon {
    let result: Icon | null = null;

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
  removeIconByModel(featureModel: FeatureModel) {
    $assert(featureModel, 'featureModel can not be null');

    const icon = this._findIconFromModel(featureModel);
    this._removeIcon(icon);
  }

  private _removeIcon(icon: Icon) {
    this._removeTip.close(0);
    this._group.removeChild(icon.getElement());

    this._icons = this._icons.filter((i) => i !== icon);
    this._resize(this._icons.length);
    const me = this;

    // Add all again ...
    this._icons.forEach((elem, i) => {
      me._positionIcon(elem, i);
    });
  }

  /** */
  moveToFront(): void {
    this._group.moveToFront();
  }

  private _registerListeners() {
    this._group.addEvent('click', (event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    this._group.addEvent('dblclick', (event) => {
      event.stopPropagation();
    });
  }

  private _resize(iconsLength: number) {
    if (this._iconSize) {
      this._group.setSize(iconsLength * this._iconSize.width, this._iconSize.height);

      const iconSize = ImageIcon.SIZE + IconGroup.ICON_PADDING * 2;
      this._group.setCoordSize(iconsLength * iconSize, iconSize);
    }
  }

  private _positionIcon(icon: Icon, order: number) {
    const iconSize = ImageIcon.SIZE + IconGroup.ICON_PADDING * 2;
    icon
      .getElement()
      .setPosition(iconSize * order + IconGroup.ICON_PADDING, IconGroup.ICON_PADDING);
  }

  static ICON_PADDING = 5;
}

export default IconGroup;
