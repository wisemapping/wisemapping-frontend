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

/**
 * Utility class to replace jQuery event handling with native DOM APIs
 */
class EventManager {
  /**
   * Add event listener
   * Replaces: $(element).bind(event, handler) or $(element).on(event, handler)
   */
  static bind(
    element: HTMLElement | Document | Window,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    element.addEventListener(event, handler, options);
  }

  /**
   * Remove event listener
   * Replaces: $(element).unbind(event, handler) or $(element).off(event, handler)
   */
  static unbind(
    element: HTMLElement | Document | Window,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    element.removeEventListener(event, handler, options);
  }

  /**
   * Trigger event
   * Replaces: $(element).trigger(event)
   */
  static trigger(element: HTMLElement, eventName: string, data?: unknown): void {
    let event: Event;

    if (data) {
      event = new CustomEvent(eventName, { detail: data });
    } else {
      // For standard events
      switch (eventName) {
        case 'click':
          event = new MouseEvent('click', { bubbles: true, cancelable: true });
          break;
        case 'keydown':
        case 'keyup':
        case 'keypress':
          event = new KeyboardEvent(eventName, { bubbles: true, cancelable: true });
          break;
        case 'mousedown':
        case 'mouseup':
        case 'mousemove':
        case 'mouseover':
        case 'mouseout':
          event = new MouseEvent(eventName, { bubbles: true, cancelable: true });
          break;
        default:
          event = new Event(eventName, { bubbles: true, cancelable: true });
      }
    }

    element.dispatchEvent(event);
  }
}

export default EventManager;
