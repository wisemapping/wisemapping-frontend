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

/**
 * A theme whose dark variant has its own palette (Ocean, Sunrise and Robot): the border and
 * connection colours are taken from the palette by topic order as they are, not lightened as in
 * Prism, and the fill comes from the palette of the topic type, not from an ancestor.
 */
class PaletteTheme extends DefaultTheme {
  constructor(themeName: string, variant: ThemeVariant) {
    super(new ThemeStyle(themeName, variant), variant);
  }

  override getConnectionColor(topic: Topic): string {
    let result: string | null = null;

    // Color of the node is the connection is the color of the parent ...
    const parent = topic.getParent();
    if (parent && !parent.isCentralTopic()) {
      result = this.resolve('connectionColor', parent, false) as string;
    }

    if (!result) {
      const colors = this.resolve('connectionColor', topic);
      result = pickByOrder(colors, topic.getOrder());
    }
    return result;
  }

  override getBorderColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If border color has not been defined, use the one picked on an ancestor, or else the theme
    // border color. The dark variant has its own palette, so it is not lightened as in Prism ...
    if (!result) {
      const colors = this.resolve('borderColor', topic);
      result = pickByOrder(colors, topic.getOrder());
    }
    return result;
  }

  override getBackgroundColor(topic: Topic): string {
    const result = topic.getModel().getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result && result.trim() !== '') {
      return result;
    }

    // Get theme colors directly from ThemeStyle, bypassing DefaultTheme logic
    return pickByOrder(this.getStyles(topic).backgroundColor, topic.getOrder());
  }
}

export default PaletteTheme;
