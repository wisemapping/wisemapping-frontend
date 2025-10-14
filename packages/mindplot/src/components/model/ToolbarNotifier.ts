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

import { $assert } from '../util/assert';
import DOMUtils from '../util/DOMUtils';

class ToolbarNotifier {
  private static currentTimeout: NodeJS.Timeout | null = null;

  static get container(): HTMLElement | null {
    return document.getElementById('headerNotifier');
  }

  static hide() {
    const { container } = this;
    if (container) {
      DOMUtils.hide(container);
    }
  }

  static show(msg: string, fade: boolean) {
    $assert(msg, 'msg can not be null');

    // Cancel any existing timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    // Reset the container state before showing new notification
    const { container } = this;
    if (container) {
      // Reset any ongoing animations
      DOMUtils.css(container, 'opacity', '');
      DOMUtils.css(container, 'transition', '');
    }

    // Display the new notification
    this.displayNotification(msg, fade);
  }

  private static displayNotification(msg: string, fade: boolean) {
    const { container } = this;

    if (container) {
      DOMUtils.text(container, msg);

      // Calculate center position
      const windowWidth = DOMUtils.windowWidth();
      const elementWidth = DOMUtils.width(container);
      const leftPosition = Math.max(0, (windowWidth - elementWidth) / 2 - 9);

      // Override styled component positioning for proper centering
      DOMUtils.css(container, 'left', `${leftPosition}px`);
      DOMUtils.css(container, 'transform', 'none'); // Override the translateX(-50%)

      if (fade) {
        DOMUtils.show(container);
        // Set initial opacity to 1 (fully visible)
        DOMUtils.css(container, 'opacity', '1');
        DOMUtils.css(container, 'transition', 'opacity 3000ms');

        // Start fade out after a brief delay to ensure visibility
        setTimeout(() => {
          DOMUtils.css(container, 'opacity', '0');
        }, 100);

        // Hide after fade completes
        this.currentTimeout = setTimeout(() => {
          DOMUtils.hide(container);
          DOMUtils.css(container, 'opacity', '');
          DOMUtils.css(container, 'transition', '');
          this.currentTimeout = null;
        }, 3100); // 100ms delay + 3000ms fade
      } else {
        DOMUtils.show(container);
        DOMUtils.css(container, 'opacity', '1');

        // Hide after a short time
        this.currentTimeout = setTimeout(() => {
          DOMUtils.hide(container);
          DOMUtils.css(container, 'opacity', '');
          this.currentTimeout = null;
        }, 2000);
      }
    }
  }
}

const $notify = (msg: string, fade = true) => {
  ToolbarNotifier.show(msg, fade);
};

export { $notify };
export default ToolbarNotifier;
