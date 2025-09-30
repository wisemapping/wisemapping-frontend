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

import { ThemeVariantStorage } from '@wisemapping/editor';
import { LocalStorageThemeVariantStorage } from './ThemeVariantStorage';

/**
 * Factory function to create a ThemeVariantStorage instance.
 * This allows the webapp to control which storage implementation to use.
 *
 * @returns A configured ThemeVariantStorage instance
 */
export function createThemeVariantStorage(): ThemeVariantStorage {
  // For now, we use localStorage implementation
  // In the future, this could be extended to support other storage mechanisms
  // like IndexedDB, server-side storage, etc.
  return new LocalStorageThemeVariantStorage();
}

export default createThemeVariantStorage;
