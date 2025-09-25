import { $assert } from '@wisemapping/core-js';
import { Group, Rect, StraightLine } from '@wisemapping/web2d';
import Icon from './Icon';
import PositionType from './PositionType';

class ElementDeleteWidget {
  private static _instance: ElementDeleteWidget | null = null;

  private _activeIcon: Icon | null;

  private _widget: Group | null;

  private _widgetGroup: Group | null;

  private _closeTimeoutId;

  private constructor() {
    this._activeIcon = null;
    this._widget = null;
    this._widgetGroup = null;
  }

  static getInstance(): ElementDeleteWidget {
    if (!ElementDeleteWidget._instance) {
      ElementDeleteWidget._instance = new ElementDeleteWidget();
    }
    return ElementDeleteWidget._instance;
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

      // Calculate icon position in topic coordinate system
      const iconGroup = icon.getGroup();
      let iconPosition: PositionType;
      let actualIconWidth: number;

      if (iconGroup) {
        // Icon is in an IconGroup: need to handle coordinate system scaling
        const iconGroupPosition = iconGroup.getPosition();
        const iconGroupSize = iconGroup.getSize();
        const iconGroupCoordSize = iconGroup.getGroup().getCoordSize();
        const scaleX = iconGroupSize.width / iconGroupCoordSize.width;
        const scaleY = iconGroupSize.height / iconGroupCoordSize.height;

        // Get icon position within the IconGroup
        const iconElement = icon.getElement();
        const iconElementPosition = iconElement.getPosition();

        // Transform to topic coordinate system
        iconPosition = {
          x: iconGroupPosition.x + iconElementPosition.x * scaleX,
          y: iconGroupPosition.y + iconElementPosition.y * scaleY,
        };

        // Calculate individual icon size (90 coordinate units scaled)
        actualIconWidth = 90 * scaleX; // ImageIcon.SIZE
        // actualIconHeight = 90 * scaleY; // ImageIcon.SIZE - not used
      } else {
        // Direct positioned icon: use position and size as-is
        iconPosition = icon.getPosition();
        const iconSize = icon.getSize();
        actualIconWidth = iconSize?.width || 0;
      }

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

      // Position widget at top-right of the icon
      const horizontalOffset = -4; // Move closer to the right edge
      const verticalOffset = 13; // Position above the icon

      const finalPosition = {
        x: iconPosition.x + actualIconWidth + horizontalOffset,
        y: iconPosition.y - verticalOffset,
      };

      widget.setPosition(finalPosition.x, finalPosition.y);

      // Always use the provided group but ignore coordinate system differences
      // The issue is IconGroup passes its internal group, but we'll work around it
      group.append(widget);

      // Setup current element ...
      this._activeIcon = icon;
      this._widget = widget;
      this._widgetGroup = group; // Store the actual group where widget was added
    } else if (this._closeTimeoutId) {
      clearTimeout(this._closeTimeoutId);
    }
  }

  hide() {
    this.close(200);
  }

  close(delay: number) {
    if (this._closeTimeoutId) {
      clearTimeout(this._closeTimeoutId);
    }

    if (this._activeIcon) {
      const widget = this._widget;
      const widgetGroup = this._widgetGroup;

      const close = () => {
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
        this._closeTimeoutId = null;
      };

      if (delay > 0) {
        this._closeTimeoutId = setTimeout(close, delay);
      } else {
        close();
      }
    }
  }

  private _buildWeb2d(): Group {
    // Increased widget size - 1/3 larger
    const widgetSize = 21; // Increased from 16 to 21 (about 1/3 larger)
    const result = new Group({
      width: widgetSize,
      height: widgetSize,
      x: 0,
      y: 0,
      // Use topic group coordinate system (100x100) for consistent scaling
      coordSizeWidth: 100,
      coordSizeHeight: 100,
    });

    // Fixed trash can design - scaled up by 1/3
    const strokeWidth = 4; // Increased from 3 to 4 for larger size

    // Trash can body (main rectangle) - scaled up coordinates
    const trashBody = new Rect(0, {
      x: 25,
      y: 35,
      width: 50,
      height: 44,
      stroke: `${strokeWidth} solid white`,
      fillColor: '#666666', // Gray color for delete widget
    });
    result.append(trashBody);

    // Trash can lid (top rectangle) - scaled up coordinates
    const trashLid = new Rect(0, {
      x: 20,
      y: 30,
      width: 60,
      height: 9,
      stroke: `${strokeWidth} solid white`,
      fillColor: '#666666', // Gray color for delete widget
    });
    result.append(trashLid);

    // Trash can handle (small rectangle on top) - scaled up coordinates
    const trashHandle = new Rect(0, {
      x: 35,
      y: 22,
      width: 30,
      height: 8,
      stroke: `${strokeWidth} solid white`,
      fillColor: '#666666', // Gray color for delete widget
    });
    result.append(trashHandle);

    // Vertical lines inside trash can (to show it's a trash can) - scaled up coordinates
    const line1 = new StraightLine({ stroke: `${strokeWidth} solid white` });
    line1.setFrom(38, 40);
    line1.setTo(38, 72);
    result.append(line1);

    const line2 = new StraightLine({ stroke: `${strokeWidth} solid white` });
    line2.setFrom(50, 40);
    line2.setTo(50, 72);
    result.append(line2);

    const line3 = new StraightLine({ stroke: `${strokeWidth} solid white` });
    line3.setFrom(62, 40);
    line3.setTo(62, 72);
    result.append(line3);

    // Hover effects
    result.addEvent('mouseover', () => {
      trashBody.setFill('#FF4444'); // Red on hover
      trashLid.setFill('#FF4444');
      trashHandle.setFill('#FF4444');
    });
    result.addEvent('mouseout', () => {
      trashBody.setFill('#666666'); // Back to gray
      trashLid.setFill('#666666');
      trashHandle.setFill('#666666');
    });

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

export default ElementDeleteWidget;
