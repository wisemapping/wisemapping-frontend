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
import Topic from '../Topic';
import DefaultTheme from './DefaultTheme';
import { ThemeVariant } from './Theme';
import { ThemeStyle } from './ThemeStyle';

class OceanTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    const themeStyle = new ThemeStyle('ocean', variant);
    super(themeStyle, variant);
  }

  getConnectionColor(topic: Topic): string {
    let result: string | null = null;

    // Color of the node is the connection is the color of the parent ...
    const parent = topic.getParent();
    if (parent && !parent.isCentralTopic()) {
      result = this.resolve('connectionColor', parent, false) as string;
    }

    if (!result) {
      let colors: string[] = [];
      colors = colors.concat(this.resolve('connectionColor', topic) as string[] | string);

      // if the element is an array, use topic order to decide color ..
      let order = topic.getOrder();
      order = order || 0;

      const index = order % colors.length;
      result = colors[index];
    }
    return result!;
  }

  getBorderColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If border color has not been defined, use the connection color for the border ...
    if (!result) {
      let colors: string[] = [];
      colors = colors.concat(this.resolve('borderColor', topic) as string[] | string);

      // if the element is an array, use topic order to decide color ..
      let order = topic.getOrder();
      order = order || 0;

      const index = order % colors.length;
      result = colors[index];
    }
    return result;
  }

  getBackgroundColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result && result.trim() !== '') {
      return result;
    }

    // Get theme colors directly from ThemeStyle, bypassing DefaultTheme logic
    const styles = this.getStyles(topic);
    const { backgroundColor } = styles;

    if (Array.isArray(backgroundColor)) {
      // If it's an array, use topic order to decide color
      const order = topic.getOrder() || 0;
      const index = order % backgroundColor.length;
      result = backgroundColor[index];
    } else {
      result = backgroundColor;
    }

    return result;
  }

  getFontColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getFontColor();

    // If topic has a custom font color, always use it
    if (result) {
      return result;
    }

    // Use theme colors from style system
    result = this.resolve('fontColor', topic) as string;
    return result;
  }
}

export default OceanTheme;
