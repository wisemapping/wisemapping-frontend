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

import { Group } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import ElementDeleteWidget from './ElementDeleteWidget';
import ImageIcon from './ImageIcon';
import type SizeType from './SizeType';
import type FeatureModel from './model/FeatureModel';
import type Icon from './Icon';
import type PositionType from './PositionType';
import type Designer from './Designer';

const ORDER_BY_TYPE = new Map<string, number>();
// Emoji icons come from the same icon picker as image icons, so they share their slot
ORDER_BY_TYPE.set('icon', 0);
ORDER_BY_TYPE.set('eicon', 0);
ORDER_BY_TYPE.set('note', 1);
ORDER_BY_TYPE.set('link', 2);

class IconGroup {
  private _icons: Icon[];

  private _group: Group;

  private _removeTip: ElementDeleteWidget;

  private _iconSize: SizeType | null;

  private _topicId: number;

  private _topicGroup: Group | null = null;

  // Icons added with remove: only these get a delete widget.
  private _removableIcons = new WeakSet<Icon>();

  constructor(topicId: number, iconSize: number, designer?: Designer) {
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
    this._removeTip = ElementDeleteWidget.getInstance(designer);
    this._iconSize = null;
    this.seIconSize(iconSize, iconSize);
    this._registerListeners();
  }

  setPosition(x: number, y: number): void {
    this._group.setPosition(x, y);
  }

  getPosition(): PositionType {
    return this._group.getPosition();
  }

  /** */
  getSize(): SizeType {
    return this._group.getSize();
  }

  /** */
  getGroup(): Group {
    return this._group;
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
    // Re-adding every icon closed the delete widget once per icon: close it once.
    if (this._icons.length > 0) {
      this._removeTip.close(0);
    }

    // The icons are sorted by type: insert the new one after the icons of its type, as a
    // stable sort does, and move only the icons that follow it, instead of removing and
    // re-adding them all (O(n^2) per icon).
    icon.setGroup(this);
    const rank = (i: Icon): number => ORDER_BY_TYPE.get(i.getModel().getType())!;
    const iconRank = rank(icon);
    let index = this._icons.findIndex((i) => rank(i) > iconRank);
    if (index < 0) {
      index = this._icons.length;
    }
    const following = this._icons.slice(index);
    following.forEach((i) => this._group.removeChild(i.getElement()));
    this._icons.splice(index, 0, icon);

    // Add the new node and the ones after it back ...
    this._resize(this._icons.length);
    [icon, ...following].forEach((i, offset) => {
      this.positionIcon(i, index + offset);
      this._group.append(i.getElement());
    });

    // Register event for the group ..
    if (remove) {
      this._removableIcons.add(icon);

      // Always use topic group for consistent coordinate system and sizing
      const targetGroup = this._topicGroup;

      if (targetGroup) {
        this._removeTip.decorate(this._topicId, icon, targetGroup);
      }
      // Note: If topic group is not available, delete widget will be set up later in _setupDeleteWidgetsForExistingIcons
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
  removeIconByModel(featureModel: FeatureModel): void {
    $assert(featureModel, 'featureModel can not be null');

    const icon = this._findIconFromModel(featureModel);
    this._removeIcon(icon);
  }

  private _removeIcon(icon: Icon): void {
    this._removeTip.close(0);
    this._group.removeChild(icon.getElement());

    this._icons = this._icons.filter((i) => i !== icon);
    this._resize(this._icons.length);
    const me = this;

    // Add all again ...
    this._icons.forEach((elem, i) => {
      me.positionIcon(elem, i);
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

  private _resize(iconsLength: number): void {
    if (this._iconSize) {
      this._group.setSize(iconsLength * this._iconSize.width, this._iconSize.height);

      const iconSize = ImageIcon.SIZE + IconGroup.ICON_PADDING * 2;
      this._group.setCoordSize(iconsLength * iconSize, iconSize);
    }
  }

  private positionIcon(icon: Icon, order: number): void {
    const iconSize = ImageIcon.SIZE + IconGroup.ICON_PADDING * 2;
    icon
      .getElement()
      .setPosition(iconSize * order + IconGroup.ICON_PADDING, IconGroup.ICON_PADDING);
  }

  appendTo(group: Group): void {
    this._topicGroup = group; // Store reference to topic group
    group.append(this._group);
    this._group.moveToFront();

    // Set up delete widgets for all existing icons now that we have the topic group
    this._setupDeleteWidgetsForExistingIcons(group);
  }

  private _setupDeleteWidgetsForExistingIcons(topicGroup: Group): void {
    // Set up delete widgets for all icons that were added before the topic group was available
    // decorate() skips the icons it has already decorated.
    this._icons
      .filter((icon) => this._removableIcons.has(icon))
      .forEach((icon) => this._removeTip.decorate(this._topicId, icon, topicGroup));
  }

  static ICON_PADDING = 2;
}

export default IconGroup;
