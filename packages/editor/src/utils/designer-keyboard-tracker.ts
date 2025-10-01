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

import { DesignerKeyboard, Designer } from '@wisemapping/mindplot';
import { trackEditorInteraction } from './analytics';

/**
 * Wrapper for DesignerKeyboard that adds Google Analytics tracking
 * to keyboard shortcuts and editor interactions
 */
export class DesignerKeyboardTracker {
  private static originalRegister: typeof DesignerKeyboard.register;

  static initialize(): void {
    // Store the original register method
    this.originalRegister = DesignerKeyboard.register;

    // Override the register method to add tracking
    DesignerKeyboard.register = (designer: Designer) => {
      // Call the original register method
      this.originalRegister(designer);

      // Add tracking to specific keyboard shortcuts
      this.addKeyboardTracking();
    };
  }

  private static addKeyboardTracking(): void {
    // Note: We can't directly intercept the keyboard shortcuts here as they're handled
    // internally by the DesignerKeyboard class. The tracking would need to be added
    // at the mindplot level or through event listeners.
    // For now, we'll track the most common interactions through other means.
  }

  static trackDoubleClick(): void {
    trackEditorInteraction('double_click_create_topic');
  }

  static trackCanvasInteraction(action: string): void {
    trackEditorInteraction(action);
  }
}
