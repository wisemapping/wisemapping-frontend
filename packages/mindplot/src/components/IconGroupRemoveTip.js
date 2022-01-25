import { $assert, $defined } from '@wisemapping/core-js';
import { Group, Rect, Line } from '@wisemapping/web2d';

export default class RemoveTip {
  /** @lends IconGroup.RemoveTip */
  /**
     * @classdesc inner class of IconGroup
     * @constructs
     * @param container
     */
  constructor(container) {
    $assert(container, 'group can not be null');
    this._fadeElem = container;
  }

  /**
     * @param topicId
     * @param icon
     * @throws will throw an error if icon is null or undefined
     */
  show(topicId, icon) {
    $assert(icon, 'icon can not be null');

    // Nothing to do ...
    if (this._activeIcon !== icon) {
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
  }

  /** */
  hide() {
    this.close(200);
  }

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
      const close = function close() {
        me._activeIcon = null;
        me._fadeElem.removeChild(widget);
        me._widget = null;
        me._closeTimeoutId = null;
      };

      if (!$defined(delay) || delay === 0) {
        close();
      } else {
        this._closeTimeoutId = setTimeout(close, delay);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _buildWeb2d() {
    const result = new Group({
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      coordSizeWidth: 10,
      coordSizeHeight: 10,
    });

    const outerRect = new Rect(0, {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      stroke: '0',
      fillColor: 'black',
    });
    result.append(outerRect);
    outerRect.setCursor('pointer');

    const innerRect = new Rect(0, {
      x: 1,
      y: 1,
      width: 8,
      height: 8,
      stroke: '1 solid white',
      fillColor: 'gray',
    });
    result.append(innerRect);

    const line = new Line({ stroke: '1 solid white' });
    line.setFrom(1, 1);
    line.setTo(9, 9);
    result.append(line);

    const line2 = new Line({ stroke: '1 solid white' });
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
  }

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
      // eslint-disable-next-line no-param-reassign
      icon.__remove = true;
    }
  }
}
