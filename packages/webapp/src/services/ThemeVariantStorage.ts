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

import { ThemeVariant } from '@wisemapping/mindplot';
import { ThemeVariantStorage } from '@wisemapping/editor';
import { THEME_VARIANT_STORAGE_KEY, DEFAULT_THEME_VARIANT } from '../constants/theme';

/**
 * LocalStorage implementation of ThemeVariantStorage.
 * This class handles theme variant persistence using browser's localStorage.
 */
export class LocalStorageThemeVariantStorage implements ThemeVariantStorage {
  private readonly listeners: Set<(variant: ThemeVariant) => void> = new Set();

  constructor() {
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  getThemeVariant(): ThemeVariant {
    try {
      const stored = localStorage.getItem(THEME_VARIANT_STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored as ThemeVariant;
      }
    } catch (error) {
      console.warn('Failed to read theme variant from localStorage:', error);
    }
    return DEFAULT_THEME_VARIANT;
  }

  setThemeVariant(variant: ThemeVariant): void {
    try {
      localStorage.setItem(THEME_VARIANT_STORAGE_KEY, variant);
      // Notify all listeners
      this.listeners.forEach((callback) => callback(variant));
    } catch (error) {
      console.warn('Failed to save theme variant to localStorage:', error);
    }
  }

  subscribe(callback: (variant: ThemeVariant) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key === THEME_VARIANT_STORAGE_KEY && event.newValue) {
      const variant = event.newValue as ThemeVariant;
      if (variant === 'light' || variant === 'dark') {
        this.listeners.forEach((callback) => callback(variant));
      }
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    this.listeners.clear();
  }
}

export default LocalStorageThemeVariantStorage;
