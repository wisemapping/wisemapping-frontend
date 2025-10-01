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

import { ThemeVariantStorage } from '../../../../src/types/ThemeVariantStorage';
import { ThemeVariant } from '@wisemapping/mindplot/src/components/theme/Theme';

/**
 * Mock implementation of ThemeVariantStorage for playground files.
 * This uses the actual localStorage to persist theme variants, making it compatible
 * with the rest of the application's theme storage.
 */
export class MockThemeVariantStorage implements ThemeVariantStorage {
  private readonly _storageKey = 'themeMode'; // Use the same key as the rest of the app
  private _listeners: Set<(variant: ThemeVariant) => void> = new Set();

  constructor() {
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  getThemeVariant(): ThemeVariant {
    try {
      const stored = localStorage.getItem(this._storageKey);
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored as ThemeVariant;
      }
    } catch (error) {
      console.warn('Failed to read theme variant from localStorage:', error);
    }
    return 'light'; // Default fallback
  }

  setThemeVariant(variant: ThemeVariant): void {
    try {
      localStorage.setItem(this._storageKey, variant);
      // Notify all listeners
      this._listeners.forEach((callback) => callback(variant));
    } catch (error) {
      console.warn('Failed to save theme variant to localStorage:', error);
    }
  }

  subscribe(callback: (variant: ThemeVariant) => void): () => void {
    this._listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this._listeners.delete(callback);
    };
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this._storageKey && event.newValue) {
      const variant = event.newValue as ThemeVariant;
      if (variant === 'light' || variant === 'dark') {
        this._listeners.forEach((callback) => callback(variant));
      }
    }
  }

  destroy(): void {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    this._listeners.clear();
  }
}

/**
 * Factory function to create a mock ThemeVariantStorage instance for playground files.
 */
export function createMockThemeVariantStorage(): ThemeVariantStorage {
  return new MockThemeVariantStorage();
}

export default createMockThemeVariantStorage;
