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
import { $assert } from '../util/assert';
import type { FeatureAttributes } from './FeatureModel';
import FeatureModel from './FeatureModel';

class SvgIconModel extends FeatureModel {
  constructor(attributes: FeatureAttributes) {
    super('icon');
    // A missing id is rejected by setIconType, as an empty one.
    this.setIconType(attributes.id ?? '');
  }

  getIconType(): string {
    return this.getAttribute('id') as string;
  }

  setIconType(iconType: string): void {
    $assert(iconType, 'iconType id can not be null');
    this.setAttribute('id', iconType);
  }

  override applyAttribute(key: string, value: unknown): void {
    if (key === 'id') {
      this.setIconType(value as string);
    } else {
      super.applyAttribute(key, value);
    }
  }
}

export default SvgIconModel;
