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
 * Keyboard shortcut manager to replace jQuery hotkeys plugin
 * Handles complex key combinations and cross-browser compatibility
 */
class KeyboardManager {
  private static shortcuts: Map<string, () => void> = new Map();

  private static initialized = false;

  /**
   * Initialize the keyboard manager
   */
  private static init(): void {
    if (this.initialized) return;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.initialized = true;
  }

  /**
   * Add keyboard shortcut
   * Replaces: $(document).bind('keydown', shortcut, callback)
   *
   * @param shortcuts - Array of key combinations (e.g., ['ctrl+s', 'cmd+s'])
   * @param callback - Function to execute when shortcut is pressed
   */
  static addShortcut(shortcuts: string[], callback: () => void): void {
    this.init();

    shortcuts.forEach((shortcut) => {
      const normalizedShortcut = this.normalizeShortcut(shortcut);
      this.shortcuts.set(normalizedShortcut, callback);
    });
  }

  /**
   * Remove keyboard shortcut
   * Replaces: $(document).unbind('keydown', shortcut)
   */
  static removeShortcut(shortcuts: string[]): void {
    shortcuts.forEach((shortcut) => {
      const normalizedShortcut = this.normalizeShortcut(shortcut);
      this.shortcuts.delete(normalizedShortcut);
    });
  }

  /**
   * Handle keydown events
   */
  private static handleKeyDown(event: KeyboardEvent): void {
    // Skip keyboard shortcuts if user is typing in an input field or contentEditable element
    if (this.isTypingInInputField()) {
      return;
    }

    const pressedShortcut = this.getEventShortcut(event);
    const callback = this.shortcuts.get(pressedShortcut);

    if (callback) {
      event.preventDefault();
      event.stopPropagation();
      callback();
    }
  }

  /**
   * Check if the user is currently typing in an input field or contentEditable element
   */
  private static isTypingInInputField(): boolean {
    const { activeElement } = document;

    if (!activeElement) {
      return false;
    }

    // Check if it's an input field
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      return true;
    }

    // Check if it's a contentEditable element
    if (activeElement.getAttribute('contentEditable') === 'true') {
      return true;
    }

    // Check if it's inside a contentEditable element
    const contentEditableParent = activeElement.closest('[contentEditable="true"]');
    if (contentEditableParent) {
      return true;
    }

    return false;
  }

  /**
   * Convert keyboard event to shortcut string
   */
  private static getEventShortcut(event: KeyboardEvent): string {
    const parts: string[] = [];

    // Add modifiers in consistent order
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    // Add the main key
    const key = this.normalizeKey(event.key, event.keyCode);
    if (key) parts.push(key);

    return parts.join('+');
  }

  /**
   * Normalize shortcut string for consistent format
   */
  private static normalizeShortcut(shortcut: string): string {
    const parts = shortcut
      .toLowerCase()
      .split('+')
      .map((part) => part.trim());
    const modifiers: string[] = [];
    let key = '';

    parts.forEach((part) => {
      switch (part) {
        case 'ctrl':
        case 'cmd':
        case 'meta':
          modifiers.push('ctrl');
          break;
        case 'alt':
        case 'option':
          modifiers.push('alt');
          break;
        case 'shift':
          modifiers.push('shift');
          break;
        default:
          key = this.normalizeKey(part);
      }
    });

    // Remove duplicates and sort modifiers
    const uniqueModifiers = [...new Set(modifiers)].sort();

    return [...uniqueModifiers, key].filter(Boolean).join('+');
  }

  /**
   * Normalize key names for consistency
   */
  private static normalizeKey(key: string, keyCode?: number): string {
    const keyLower = key.toLowerCase();

    // Handle special keys
    const keyMap: { [key: string]: string } = {
      ' ': 'space',
      spacebar: 'space',
      esc: 'escape',
      del: 'delete',
      ins: 'insert',
      return: 'enter',
      left: 'arrowleft',
      right: 'arrowright',
      up: 'arrowup',
      down: 'arrowdown',
      pageup: 'pageup',
      pagedown: 'pagedown',
      home: 'home',
      end: 'end',
      tab: 'tab',
      backspace: 'backspace',
    };

    if (keyMap[keyLower]) {
      return keyMap[keyLower];
    }

    // Handle function keys
    if (keyLower.startsWith('f') && keyLower.length <= 3) {
      return keyLower;
    }

    // Handle numeric keys
    if (keyCode !== undefined) {
      // Number keys (0-9)
      if (keyCode >= 48 && keyCode <= 57) {
        return String.fromCharCode(keyCode).toLowerCase();
      }
      // Numpad keys
      if (keyCode >= 96 && keyCode <= 105) {
        return `numpad${keyCode - 96}`;
      }
    }

    // Return the key as-is for letters and other characters
    return keyLower;
  }

  /**
   * Clear all shortcuts
   */
  static clearAll(): void {
    this.shortcuts.clear();
  }

  /**
   * Get all registered shortcuts (for debugging)
   */
  static getShortcuts(): string[] {
    return Array.from(this.shortcuts.keys());
  }
}

export default KeyboardManager;
