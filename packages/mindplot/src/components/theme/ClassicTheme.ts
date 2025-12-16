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
/*
 *    Copyright [2011] [wisemapping]
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

class ClassicTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    const themeStyle = new ThemeStyle('classic', variant);
    super(themeStyle, variant);
  }

  getBackgroundColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result) {
      return result;
    }

    // Use theme colors from style system
    result = this.resolve('backgroundColor', topic) as string;
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

export default ClassicTheme;
