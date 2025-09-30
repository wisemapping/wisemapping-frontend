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

import { ThemeVariant } from '@wisemapping/mindplot/src/components/theme/Theme';

/**
 * Interface for theme variant storage.
 * This allows different storage implementations (localStorage, IndexedDB, server-side, etc.)
 */
export interface ThemeVariantStorage {
  /**
   * Get the current theme variant from storage
   * @returns The current theme variant
   */
  getThemeVariant(): ThemeVariant;

  /**
   * Set the theme variant in storage
   * @param variant The theme variant to store
   */
  setThemeVariant(variant: ThemeVariant): void;

  /**
   * Subscribe to theme variant changes
   * @param callback Function to call when theme variant changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (variant: ThemeVariant) => void): () => void;

  /**
   * Clean up resources (event listeners, etc.)
   */
  destroy?(): void;
}

export default ThemeVariantStorage;
