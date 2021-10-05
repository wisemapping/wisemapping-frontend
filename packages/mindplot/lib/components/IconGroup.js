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
const web2D = require('@wismapping/web2d');

const web2d = web2D();
const Icon = require('./Icon');

const IconGroup = new Class(/** @lends IconGroup */{
  /**
     * @constructs
     * @param topicId
     * @param iconSize
     * @throws will throw an error if topicId is null or undefined
     * @throws will throw an error if iconSize is null or undefined
     */
  initialize(topicId, iconSize) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert($defined(iconSize), 'iconSize can not be null');

    this._icons = [];
    this._group = new web2d.Group({
      width: 0,
      height: iconSize,
      x: 0,
      y: 0,
      coordSizeWidth: 0,
      coordSizeHeight: 100,
    });
    this._removeTip = new IconGroup.RemoveTip(this._group, topicId);
    this.seIconSize(iconSize, iconSize);

    this._registerListeners();
  },

  /** */
  setPosition(x, y) {
    this._group.setPosition(x, y);
  },

  /** */
  getPosition() {
    return this._group.getPosition();
  },

  /** */
  getNativeElement() {
    return this._group;
  },

  /** */
  getSize() {
    return this._group.getSize();
  },

  /** */
  seIconSize(width, height) {
    this._iconSize = { width, height };
    this._resize(this._icons.length);
  },

  /**
     * @param icon the icon to be added to the icon group
     * @param {Boolean} remove
     * @throws will throw an error if icon is not defined
     */
  addIcon(icon, remove) {
    $defined(icon, 'icon is not defined');

    icon.setGroup(this);
    this._icons.push(icon);

    // Adjust group and position ...
    this._resize(this._icons.length);
    this._positionIcon(icon, this._icons.length - 1);

    const imageShape = icon.getImage();
    this._group.append(imageShape);

    // Register event for the group ..
    if (remove) {
      this._removeTip.decorate(this._topicId, icon);
    }
  },

  _findIconFromModel(iconModel) {
    let result = null;
    _.each(this._icons, (icon) => {
      const elModel = icon.getModel();
      if (elModel.getId() == iconModel.getId()) {
        result = icon;
      }
    }, this);

    if (result == null) {
      throw new Error(`Icon can no be found:${iconModel.getId()}, Icons:${this._icons}`);
    }

    return result;
  },

  /** */
  removeIconByModel(featureModel) {
    $assert(featureModel, 'featureModel can not be null');

    const icon = this._findIconFromModel(featureModel);
    this._removeIcon(icon);
  },

  _removeIcon(icon) {
    $assert(icon, 'icon can not be null');

    this._removeTip.close(0);
    this._group.removeChild(icon.getImage());

    this._icons.erase(icon);
    this._resize(this._icons.length);
    const me = this;
    // Add all again ...
    _.each(this._icons, (elem, i) => {
      me._positionIcon(elem, i);
    });
  },

  /** */
  moveToFront() {
    this._group.moveToFront();
  },

  _registerListeners() {
    this._group.addEvent('click', (event) => {
      // Avoid node creation ...
      event.stopPropagation();
    });

    this._group.addEvent('dblclick', (event) => {
      event.stopPropagation();
    });
  },

  _resize(iconsLength) {
    this._group.setSize(iconsLength * this._iconSize.width, this._iconSize.height);

    const iconSize = Icon.SIZE + (IconGroup.ICON_PADDING * 2);
    this._group.setCoordSize(iconsLength * iconSize, iconSize);
  },

  _positionIcon(icon, order) {
    const iconSize = Icon.SIZE + (IconGroup.ICON_PADDING * 2);
    icon.getImage().setPosition(iconSize * order + IconGroup.ICON_PADDING, IconGroup.ICON_PADDING);
  },
});

/**
 * @constant
 * @type {Number}
 * @default
 */
IconGroup.ICON_PADDING = 5;

IconGroup.RemoveTip = new Class(/** @lends IconGroup.RemoveTip */{
  /**
     * @classdesc inner class of IconGroup
     * @constructs
     * @param container
     */
  initialize(container) {
    $assert(container, 'group can not be null');
    this._fadeElem = container;
  },

  /**
     * @param topicId
     * @param icon
     * @throws will throw an error if icon is null or undefined
     */
  show(topicId, icon) {
    $assert(icon, 'icon can not be null');

    // Nothing to do ...
    if (this._activeIcon != icon) {
      // If there is an active icon, close it first ...
      if (this._activeIcon) {
        this.close(0);
      }

      // Now, let move the position the icon...
      const pos = icon.getPosition();

      // Register events ...
      const widget = this._buildWeb2d();
      widget.addEvent('click', () => {
        icon.remove();
      });

      const me = this;

      widget.addEvent('mouseover', () => {
        me.show(topicId, icon);
      });

      widget.addEvent('mouseout', () => {
        me.hide();
      });

      widget.setPosition(pos.x + 80, pos.y - 50);
      this._fadeElem.append(widget);

      // Setup current element ...
      this._activeIcon = icon;
      this._widget = widget;
    } else {
      clearTimeout(this._closeTimeoutId);
    }
  },

  /** */
  hide() {
    this.close(200);
  },

  /**
     * @param delay
     */
  close(delay) {
    // This is not ok, trying to close the same dialog twice ?
    if (this._closeTimeoutId) {
      clearTimeout(this._closeTimeoutId);
    }

    const me = this;
    if (this._activeIcon) {
      const widget = this._widget;
      const close = function () {
        me._activeIcon = null;
        me._fadeElem.removeChild(widget);
        me._widget = null;
        me._closeTimeoutId = null;
      };

      if (!$defined(delay) || delay == 0) {
        close();
      } else {
        this._closeTimeoutId = close.delay(delay);
      }
    }
  },

  _buildWeb2d() {
    const result = new web2d.Group({
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      coordSizeWidth: 10,
      coordSizeHeight: 10,
    });

    const outerRect = new web2d.Rect(0, {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      stroke: '0',
      fillColor: 'black',
    });
    result.append(outerRect);
    outerRect.setCursor('pointer');

    const innerRect = new web2d.Rect(0, {
      x: 1,
      y: 1,
      width: 8,
      height: 8,
      stroke: '1 solid white',
      fillColor: 'gray',
    });
    result.append(innerRect);

    const line = new web2d.Line({ stroke: '1 solid white' });
    line.setFrom(1, 1);
    line.setTo(9, 9);
    result.append(line);

    const line2 = new web2d.Line({ stroke: '1 solid white' });
    line2.setFrom(1, 9);
    line2.setTo(9, 1);
    result.append(line2);

    // Some events ...
    result.addEvent('mouseover', () => {
      innerRect.setFill('#CC0033');
    });
    result.addEvent('mouseout', () => {
      innerRect.setFill('gray');
    });

    result.setSize(50, 50);
    return result;
  },

  /**
     * @param topicId
     * @param icon
     */
  decorate(topicId, icon) {
    const me = this;

    if (!icon.__remove) {
      icon.addEvent('mouseover', () => {
        me.show(topicId, icon);
      });

      icon.addEvent('mouseout', () => {
        me.hide();
      });
      icon.__remove = true;
    }
  },

});

export default IconGroup;
