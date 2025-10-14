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
import { $assert } from './util/assert';
import EventManager from './util/EventManager';
import PositionType from './PositionType';

class ScreenManager {
  private _divContainer: HTMLDivElement;

  private _padding: { x: number; y: number };

  private _clickEvents: EventListener[];

  private _scale: number;

  constructor(divElement: HTMLElement) {
    $assert(divElement, 'can not be null');
    this._divContainer = divElement as HTMLDivElement;
    this._padding = { x: 0, y: 0 };

    // Prevent pull-to-refresh while allowing all zoom gestures
    // We rely on preventDefault() in touch event handlers to block pull-to-refresh
    // while keeping pinch-zoom and double-tap zoom enabled
    this._divContainer.style.touchAction = 'auto';
    this._divContainer.style.overscrollBehavior = 'none';

    // Ignore default click event propagation. Prevent 'click' event on drag.
    this._clickEvents = [];
    EventManager.bind(this._divContainer, 'click', (event: Event) => {
      event.stopPropagation();
    });

    EventManager.bind(this._divContainer, 'dblclick', (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    });
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

  addEvent(eventType: string, listener: EventListener) {
    if (eventType === 'click') {
      this._clickEvents.push(listener);
    } else {
      // Use non-passive listeners for touch events to allow preventDefault()
      const isTouchEvent = ['touchstart', 'touchmove', 'touchend'].includes(eventType);
      const options = isTouchEvent ? { passive: false } : undefined;
      EventManager.bind(this._divContainer, eventType, listener, options);
    }
  }

  removeEvent(event: string, listener: EventListener) {
    if (event === 'click') {
      const index = this._clickEvents.indexOf(listener);
      if (index > -1) {
        this._clickEvents.splice(index, 1);
      }
    } else {
      // Use non-passive listeners for touch events to match addEvent
      const isTouchEvent = ['touchstart', 'touchmove', 'touchend'].includes(event);
      const options = isTouchEvent ? { passive: false } : undefined;
      EventManager.unbind(this._divContainer, event, listener, options);
    }
  }

  fireEvent(type: string, event?: UIEvent): void {
    if (type === 'click') {
      this._clickEvents.forEach((listener) => {
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        });
        listener.call(this._divContainer, syntheticEvent);
      });
    } else {
      EventManager.trigger(this._divContainer, type, event);
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
    const containerPosition = this.getContainerPosition();
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

  getContainer(): HTMLDivElement {
    return this._divContainer;
  }

  getContainerCss(property: string): string {
    return getComputedStyle(this._divContainer).getPropertyValue(property);
  }

  getContainerWidth(): number {
    // Try offsetWidth first, fallback to CSS width, then default to 800
    const { offsetWidth } = this._divContainer;
    if (offsetWidth > 0) {
      return offsetWidth;
    }

    const cssWidth = this.getContainerCss('width');
    if (cssWidth && cssWidth !== 'auto') {
      const parsedWidth = Number.parseInt(cssWidth, 10);
      if (!Number.isNaN(parsedWidth) && parsedWidth > 0) {
        return parsedWidth;
      }
    }

    // Fallback to a reasonable default for Storybook
    return 800;
  }

  getContainerHeight(): number {
    // Try offsetHeight first, fallback to CSS height, then default to 600
    const { offsetHeight } = this._divContainer;
    if (offsetHeight > 0) {
      return offsetHeight;
    }

    const cssHeight = this.getContainerCss('height');
    if (cssHeight && cssHeight !== 'auto') {
      const parsedHeight = Number.parseInt(cssHeight, 10);
      if (!Number.isNaN(parsedHeight) && parsedHeight > 0) {
        return parsedHeight;
      }
    }

    // Fallback to a reasonable default for Storybook
    return 600;
  }

  getContainerPosition(): { top: number; left: number } {
    const rect = this._divContainer.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  findInContainer(selector: string): HTMLElement | null {
    return this._divContainer.querySelector(selector);
  }

  setOffset(x: number, y: number): void {
    this._padding.x = x;
    this._padding.y = y;
  }
}

export default ScreenManager;
