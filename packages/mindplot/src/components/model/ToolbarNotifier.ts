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

import debounce from 'lodash/debounce';
import { $assert } from '../util/assert';

class ToolbarNotifier {
  private static hideNotification = debounce((container: HTMLElement) => {
    container.style.display = 'none';
    container.style.opacity = '';
    container.style.transition = '';
  }, 3100);

  private static hideNonFadingNotification = debounce((container: HTMLElement) => {
    container.style.display = 'none';
    container.style.opacity = '';
  }, 2000);

  private static fadeOutTimer: number | undefined;

  static get container(): HTMLElement | null {
    return document.getElementById('headerNotifier');
  }

  static hide() {
    const { container } = this;
    if (container) {
      container.style.display = 'none';
    }
  }

  static show(msg: string, fade: boolean) {
    $assert(msg, 'msg can not be null');

    // Cancel any pending hide or fade-out from a previous notification
    this.hideNotification.cancel();
    this.hideNonFadingNotification.cancel();
    window.clearTimeout(this.fadeOutTimer);
    this.fadeOutTimer = undefined;

    // Reset the container state before showing new notification
    const { container } = this;
    if (container) {
      // Reset any ongoing animations
      container.style.opacity = '';
      container.style.transition = '';
    }

    // Display the new notification
    this.displayNotification(msg, fade);
  }

  private static displayNotification(msg: string, fade: boolean) {
    const { container } = this;

    if (container) {
      container.textContent = msg;

      // Calculate center position
      const windowWidth = window.innerWidth;
      const elementWidth = container.offsetWidth;
      const leftPosition = Math.max(0, (windowWidth - elementWidth) / 2 - 9);

      // Override styled component positioning for proper centering
      container.style.left = `${leftPosition}px`;
      container.style.transform = 'none'; // Override the translateX(-50%)

      if (fade) {
        container.style.display = 'block';
        // Set initial opacity to 1 (fully visible)
        container.style.opacity = '1';
        container.style.transition = 'opacity 3000ms';

        // Start fade out after a brief delay to ensure visibility
        this.fadeOutTimer = window.setTimeout(() => {
          container.style.opacity = '0';
        }, 100);

        // Hide after fade completes
        this.hideNotification(container);
      } else {
        container.style.display = 'block';
        container.style.opacity = '1';

        // Hide after a short time (use debounce with shorter delay)
        this.hideNonFadingNotification(container);
      }
    }
  }
}

const $notify = (msg: string, fade = true) => {
  ToolbarNotifier.show(msg, fade);
};

export { $notify };
export default ToolbarNotifier;
