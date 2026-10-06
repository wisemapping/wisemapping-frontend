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
import PaletteTheme from './PaletteTheme';
import { ThemeVariant } from './Theme';
import pickByOrder from './pickByOrder';

class RobotTheme extends PaletteTheme {
  constructor(variant: ThemeVariant) {
    super('robot', variant);
  }

  // Unlike the other palette themes, a fill picked on an ancestor is inherited.
  override getBackgroundColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result) {
      return result;
    }

    // Use theme colors from style system. Palettes are arrays, so use topic order to decide color ..
    const colors = this.resolve('backgroundColor', topic);
    result = pickByOrder(colors, topic.getOrder());
    return result;
  }
}

export default RobotTheme;
