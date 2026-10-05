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

// Canonical modifier order for shortcut strings (meta/cmd folds into ctrl).
const MODIFIER_ORDER = ['ctrl', 'alt', 'shift'];

/**
 * Keyboard shortcut manager to replace jQuery hotkeys plugin
 * Handles complex key combinations and cross-browser compatibility
 */
// The owner of the shortcuts added without one (code outside a designer).
const SHARED_OWNER = {};

/**
 * Keyboard shortcut manager to replace jQuery hotkeys plugin
 * Handles complex key combinations and cross-browser compatibility
 *
 * Each designer's keyboard owns its shortcuts. A key press runs the shortcut of the active
 * owner (the designer in use, see activate), else a shared one. The document listener is
 * added with the first shortcut and removed with the last owner.
 */
class KeyboardManager {
  private static owners: Map<object, Map<string, () => void>> = new Map();

  private static active: object | undefined;

  private static keydownListener: ((event: KeyboardEvent) => void) | null = null;

  private static listen(): void {
    if (this.keydownListener) return;

    this.keydownListener = (event: KeyboardEvent) => this.handleKeyDown(event);
    document.addEventListener('keydown', this.keydownListener);
  }

  private static unlisten(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
  }

  /**
   * Add keyboard shortcut
   * Replaces: $(document).bind('keydown', shortcut, callback)
   *
   * @param shortcuts - Array of key combinations (e.g., ['ctrl+s', 'cmd+s'])
   * @param callback - Function to execute when shortcut is pressed
   * @param owner - The keyboard the shortcut belongs to; it runs while that owner is active
   */
  static addShortcut(
    shortcuts: string[],
    callback: () => void,
    owner: object = SHARED_OWNER,
  ): void {
    this.listen();

    let ownShortcuts = this.owners.get(owner);
    if (!ownShortcuts) {
      ownShortcuts = new Map();
      this.owners.set(owner, ownShortcuts);
    }
    if (!this.active) {
      this.active = owner;
    }
    shortcuts.forEach((shortcut) => {
      ownShortcuts!.set(this.normalizeShortcut(shortcut), callback);
    });
  }

  /**
   * Remove keyboard shortcut
   * Replaces: $(document).unbind('keydown', shortcut)
   */
  static removeShortcut(shortcuts: string[], owner: object = SHARED_OWNER): void {
    const ownShortcuts = this.owners.get(owner);
    shortcuts.forEach((shortcut) => {
      ownShortcuts?.delete(this.normalizeShortcut(shortcut));
    });
  }

  /** Makes the shortcuts of `owner` the ones a key press runs: its designer is the one in use. */
  static activate(owner: object): void {
    this.active = owner;
  }

  static isActive(owner: object): boolean {
    return this.active === owner;
  }

  /**
   * Drops the shortcuts of `owner`. The owner registered last before it becomes active, and the
   * document listener is removed with the last owner.
   */
  static removeOwner(owner: object): void {
    this.owners.delete(owner);
    if (this.active === owner) {
      this.active = Array.from(this.owners.keys()).pop();
    }
    if (this.owners.size === 0) {
      this.active = undefined;
      this.unlisten();
    }
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
    const callback =
      (this.active && this.owners.get(this.active)?.get(pressedShortcut)) ||
      this.owners.get(SHARED_OWNER)?.get(pressedShortcut);

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
    // ctrl and meta (cmd on macOS) are treated as the same modifier.
    const modifiers = new Set<string>();
    if (event.ctrlKey || event.metaKey) modifiers.add('ctrl');
    if (event.altKey) modifiers.add('alt');
    if (event.shiftKey) modifiers.add('shift');

    return this.buildShortcut(modifiers, this.normalizeKey(event.key, event.keyCode));
  }

  /**
   * Single canonical form shared by registration and event matching, so both
   * sides always emit the modifiers in the same order.
   */
  private static buildShortcut(modifiers: Set<string>, key: string): string {
    const ordered = MODIFIER_ORDER.filter((modifier) => modifiers.has(modifier));
    return [...ordered, key].filter(Boolean).join('+');
  }

  /**
   * Normalize shortcut string for consistent format
   */
  private static normalizeShortcut(shortcut: string): string {
    const parts = shortcut
      .toLowerCase()
      .split('+')
      .map((part) => part.trim());
    const modifiers = new Set<string>();
    let key = '';

    parts.forEach((part) => {
      switch (part) {
        case 'ctrl':
        case 'cmd':
        case 'meta':
          modifiers.add('ctrl');
          break;
        case 'alt':
        case 'option':
          modifiers.add('alt');
          break;
        case 'shift':
          modifiers.add('shift');
          break;
        default:
          key = this.normalizeKey(part);
      }
    });

    return this.buildShortcut(modifiers, key);
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
      // '+' is the shortcut separator, so bindings spell it 'plus'.
      '+': 'plus',
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
    this.owners.clear();
    this.active = undefined;
    this.unlisten();
  }

  /**
   * Get the shortcuts a key press can run now (for debugging)
   */
  static getShortcuts(): string[] {
    const active = this.active ? Array.from(this.owners.get(this.active)?.keys() ?? []) : [];
    const shared = Array.from(this.owners.get(SHARED_OWNER)?.keys() ?? []);
    return Array.from(new Set([...active, ...shared]));
  }
}

export default KeyboardManager;
