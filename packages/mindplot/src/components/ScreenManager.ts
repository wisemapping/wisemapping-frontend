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
import $ from 'jquery';
import { $assert } from '@wisemapping/core-js';
// https://stackoverflow.com/questions/60357083/does-not-use-passive-listeners-to-improve-scrolling-performance-lighthouse-repo
// https://web.dev/uses-passive-event-listeners/?utm_source=lighthouse&utm_medium=lr

import registerTouchHandler from '../../libraries/jquery.touchevent';
import PositionType from './PositionType';

registerTouchHandler($);

class ScreenManager {
  private _divContainer: JQuery<HTMLDivElement>;

  private _padding: { x: number; y: number };

  private _clickEvents: JQuery.EventHandler<HTMLElement, unknown>[];

  private _scale: number;

  constructor(divElement: HTMLElement) {
    $assert(divElement, 'can not be null');
    this._divContainer = $(divElement) as JQuery<HTMLDivElement>;
    this._padding = { x: 0, y: 0 };

    // Ignore default click event propagation. Prevent 'click' event on drag.
    this._clickEvents = [];
    this._divContainer.bind('click', (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
    });

    this._divContainer.bind(
      'dblclick',
      (event: { stopPropagation: () => void; preventDefault: () => void }) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );
    this._scale = 1;
  }

  /**
   * Return the current visible area in the browser.
   */
  getVisibleBrowserSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  setScale(scale: number) {
    this._scale = scale;
  }

  addEvent(eventType: string, listener: JQuery.EventHandler<HTMLElement, unknown>) {
    if (eventType === 'click') {
      this._clickEvents.push(listener);
    } else {
      this._divContainer.bind(eventType, listener);
    }
  }

  removeEvent(event: string, listener: JQuery.EventHandler<HTMLElement, unknown>) {
    if (event === 'click') {
      const index = this._clickEvents.indexOf(listener);
      if (index > -1) {
        this._clickEvents.splice(index, 1);
      }
    } else {
      this._divContainer.unbind(event, listener);
    }
  }

  fireEvent(type: string, event?: UIEvent): void {
    if (type === 'click') {
      this._clickEvents.forEach((listener) => {
        const syntheticEvent = {
          type,
          preventDefault: () => {},
          stopPropagation: () => {},
          currentTarget: this._divContainer[0],
          target: this._divContainer[0],
          data: undefined,
          delegateTarget: this._divContainer[0],
        } as unknown as JQuery.TriggeredEvent<HTMLElement, unknown, unknown, unknown>;
        listener.call(this._divContainer[0], syntheticEvent);
      });
    } else {
      this._divContainer.trigger(type, event);
    }
  }

  private mouseEvents = ['mousedown', 'mouseup', 'mousemove', 'dblclick', 'click'];

  private tocuchEvents = ['touchstart', 'touchend', 'touchmove'];

  getWorkspaceMousePosition(event: MouseEvent | TouchEvent): PositionType {
    let x: number | null = null;
    let y: number | null = null;

    if (this.mouseEvents.includes(event.type)) {
      // Retrieve current mouse position.
      x = (event as MouseEvent).clientX;
      y = (event as MouseEvent).clientY;
    } else if (this.tocuchEvents.includes(event.type)) {
      x = (event as TouchEvent).touches[0].clientX;
      y = (event as TouchEvent).touches[0].clientY;
    }

    // if value is zero assert throws error
    if (x === null || y === null) {
      throw new Error(`Coordinated can not be null, eventType= ${event.type}`);
    }

    // Adjust the deviation of the container positioning ...
    const containerPosition = this.getContainer().position();
    x -= containerPosition.left;
    y -= containerPosition.top;

    // Scale coordinate in order to be relative to the workspace. That's coordSize/size;
    x *= this._scale;
    y *= this._scale;

    // Add workspace offset.
    x += this._padding.x;
    y += this._padding.y;

    // Remove decimal part..
    return { x, y };
  }

  getContainer(): JQuery<HTMLDivElement> {
    return this._divContainer;
  }

  setOffset(x: number, y: number): void {
    this._padding.x = x;
    this._padding.y = y;
  }
}

export default ScreenManager;
