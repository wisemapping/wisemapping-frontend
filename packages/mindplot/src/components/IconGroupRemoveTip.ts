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

import { Group, Rect, StraightLine } from '@wisemapping/web2d';
import debounce from 'lodash/debounce';
import { $assert } from './util/assert';
import Icon from './Icon';
import PositionType from './PositionType';
import SizeType from './SizeType';

class IconGroupRemoveTip {
  private static _instance: IconGroupRemoveTip | null = null;

  private _activeIcon: Icon | null;

  private _widget: Group | null;

  private _widgetGroup: Group | null;

  private _debouncedClose: ReturnType<typeof debounce>;

  private constructor() {
    this._activeIcon = null;
    this._widget = null;
    this._widgetGroup = null;
    this._debouncedClose = debounce(() => this._closeNow(), 200);
  }

  static getInstance(): IconGroupRemoveTip {
    if (!IconGroupRemoveTip._instance) {
      IconGroupRemoveTip._instance = new IconGroupRemoveTip();
    }
    return IconGroupRemoveTip._instance;
  }

  show(topicId: number, icon: Icon, group: Group) {
    $assert(icon, 'icon can not be null');
    $assert(group, 'group can not be null');

    // Nothing to do ...
    if (this._activeIcon !== icon) {
      // If there is an active icon, close it first ...
      if (this._activeIcon) {
        this.close(0);
      }

      // Now, let move the position the icon...
      const pos = icon.getPosition();
      const size = icon.getSize();

      // Register events ...
      const widget = this._buildWeb2d();
      widget.addEvent('click', () => {
        icon.remove();
      });

      const me = this;

      widget.addEvent('mouseover', () => {
        me.show(topicId, icon, group);
      });

      widget.addEvent('mouseout', () => {
        me.hide();
      });

      // Calculate dynamic positioning based on target element size
      const widgetPosition = this._calculateWidgetPosition(pos, size);
      widget.setPosition(widgetPosition.x, widgetPosition.y);
      group.append(widget);

      // Setup current element ...
      this._activeIcon = icon;
      this._widget = widget;
      this._widgetGroup = group;
    } else {
      this._debouncedClose.cancel();
    }
  }

  hide() {
    this._debouncedClose();
  }

  close(delay: number) {
    if (delay > 0) {
      this._debouncedClose();
    } else {
      this._debouncedClose.cancel();
      this._closeNow();
    }
  }

  private _closeNow() {
    if (this._activeIcon) {
      const widget = this._widget;
      const widgetGroup = this._widgetGroup;

      this._activeIcon = null;
      if (widget && widgetGroup) {
        try {
          widgetGroup.removeChild(widget);
        } catch (error) {
          // Widget might have already been removed or is not a valid child, ignore the error
          console.warn('Widget could not be removed:', error);
        }
      }
      this._widget = null;
      this._widgetGroup = null;
    }
  }

  private _calculateWidgetPosition(pos: PositionType, size: SizeType | undefined): PositionType {
    // Default widget size (50x50)
    const widgetSize = 50;

    // Default offsets
    let offsetX = 10;
    let offsetY = -widgetSize - 5;

    if (size) {
      // Calculate offset based on target element size
      // Position widget to the right and above the target element
      offsetX = Math.max(10, size.width * 0.1); // At least 10px, or 10% of target width
      offsetY = -widgetSize - Math.max(5, size.height * 0.1); // Above target, with spacing
    }

    return {
      x: pos.x + offsetX,
      y: pos.y + offsetY,
    };
  }

  private _buildWeb2d(): Group {
    const result = new Group({
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      coordSizeWidth: 10,
      coordSizeHeight: 10,
    });

    // Trash can body (main rectangle)
    const trashBody = new Rect(0, {
      x: 2,
      y: 3,
      width: 6,
      height: 5,
      stroke: '0.5 solid white',
      fillColor: 'gray',
    });
    result.append(trashBody);

    // Trash can lid (top rectangle)
    const trashLid = new Rect(0, {
      x: 1.5,
      y: 2.5,
      width: 7,
      height: 1,
      stroke: '0.5 solid white',
      fillColor: 'gray',
    });
    result.append(trashLid);

    // Trash can handle (small rectangle on top)
    const trashHandle = new Rect(0, {
      x: 3.5,
      y: 1.5,
      width: 3,
      height: 1,
      stroke: '0.5 solid white',
      fillColor: 'gray',
    });
    result.append(trashHandle);

    // Vertical lines inside trash can (to show it's a trash can)
    const line1 = new StraightLine({ stroke: '0.5 solid white' });
    line1.setFrom(3.5, 3.5);
    line1.setTo(3.5, 7.5);
    result.append(line1);

    const line2 = new StraightLine({ stroke: '0.5 solid white' });
    line2.setFrom(5, 3.5);
    line2.setTo(5, 7.5);
    result.append(line2);

    const line3 = new StraightLine({ stroke: '0.5 solid white' });
    line3.setFrom(6.5, 3.5);
    line3.setTo(6.5, 7.5);
    result.append(line3);

    // Hover effects
    result.addEvent('mouseover', () => {
      trashBody.setFill('#CC0033');
      trashLid.setFill('#CC0033');
      trashHandle.setFill('#CC0033');
    });
    result.addEvent('mouseout', () => {
      trashBody.setFill('gray');
      trashLid.setFill('gray');
      trashHandle.setFill('gray');
    });

    result.setSize(50, 50);
    return result;
  }

  decorate(topicId: number, icon: Icon, group: Group) {
    const iconWithRemove = icon as Icon & { __remove?: boolean };
    if (!iconWithRemove.__remove) {
      icon.addEvent('mouseover', () => {
        this.show(topicId, icon, group);
      });

      icon.addEvent('mouseout', () => {
        this.hide();
      });

      iconWithRemove.__remove = true;
    }
  }
}

export default IconGroupRemoveTip;
