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

import NodeModel from '../model/NodeModel';
import ThemeType from '../model/ThemeType';
import ClassicTheme from './ClassicTheme';
import PrismTheme from './PrismTheme';
import SunriseTheme from './SunriseTheme';
import OceanTheme from './OceanTheme';
import RobotTheme from './RobotTheme';
import Theme, { ThemeVariant } from './Theme';
import AuroraTheme from './AuroraTheme';

class ThemeFactory {
  private static _cache = new Map<string, Theme>();

  static createById(id: ThemeType | 'dark-prism', variant: ThemeVariant): Theme {
    // Map dark-prism to prism for backward compatibility
    const actualId = id === 'dark-prism' ? 'prism' : id;

    // Create cache key from actual theme ID and variant
    const cacheKey = `${actualId}-${variant}`;

    // Return cached instance if it exists
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)!;
    }

    // Create new instance and cache it
    let result: Theme;
    switch (actualId) {
      case 'classic':
        result = new ClassicTheme(variant);
        break;
      case 'prism':
        result = new PrismTheme(variant);
        break;
      case 'robot':
        result = new RobotTheme(variant);
        break;
      case 'sunrise':
        result = new SunriseTheme(variant);
        break;
      case 'ocean':
        result = new OceanTheme(variant);
        break;
      case 'aurora':
        result = new AuroraTheme(variant);
        break;
      default: {
        const exhaustiveCheck: never = actualId;
        throw new Error(exhaustiveCheck);
      }
    }

    // Cache the instance
    this._cache.set(cacheKey, result);
    return result;
  }

  static create(model: NodeModel, variant: ThemeVariant): Theme {
    const mindmap = model.getMindmap();
    const theme = mindmap.getTheme();
    return ThemeFactory.createById(theme, variant);
  }

  /**
   * Clear the theme cache. Useful for testing or memory management.
   */
  static clearCache(): void {
    this._cache.clear();
  }

  /**
   * Get the current cache size. Useful for debugging.
   */
  static getCacheSize(): number {
    return this._cache.size;
  }
}
export default ThemeFactory;
