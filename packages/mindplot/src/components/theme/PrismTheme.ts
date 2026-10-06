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
import type Topic from '../Topic';
import DefaultTheme from './DefaultTheme';
import type { ThemeVariant } from './Theme';
import { ThemeStyle } from './ThemeStyle';
import pickByOrder from './pickByOrder';
import ColorUtil from './ColorUtil';

class PrismTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    const themeStyle = new ThemeStyle('prism', variant);
    super(themeStyle, variant);
  }

  override getConnectionColor(topic: Topic): string {
    let result: string | null = null;

    // Color of the node is the connection is the color of the parent ...
    const parent = topic.getParent();
    if (parent && !parent.isCentralTopic()) {
      result = this.resolve('connectionColor', parent, false) as string;
    }

    // A color picked by the user (on the topic or an ancestor) is used as is ...
    if (!result) {
      result = this.resolve('connectionColor', topic, false) as string;
    }

    if (!result) {
      const colors = this.getStyles(topic).connectionColor;
      result = pickByOrder(colors, topic.getOrder());

      if (result && this._variant === 'dark') {
        // Lighten the theme connection color for better visibility on dark background
        result = ColorUtil.lightenColor(result, 20);
      }
    }

    return result;
  }

  override getBorderColor(topic: Topic): string {
    const model = topic.getModel();
    // A color picked by the user (on the topic or an ancestor) is used as is ...
    let result = model.getBorderColor() || (this.resolve('borderColor', topic, false) as string);

    // If border color has not been defined, use the theme border color ...
    if (!result) {
      const colors = this.getStyles(topic).borderColor;
      result = pickByOrder(colors, topic.getOrder());

      if (result && this._variant === 'dark') {
        // Lighten the theme border color for better visibility on dark background
        result = ColorUtil.lightenColor(result, 15);
      }
    }

    return result;
  }
}

export default PrismTheme;
