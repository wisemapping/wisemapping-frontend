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
import SvgIconModel from './SvgIconModel';
import LinkModel from './LinkModel';
import NoteModel from './NoteModel';
import FeatureModel, { FeatureAttributes } from './FeatureModel';
import FeatureType, { type FeatureByType } from './FeatureType';
import EmojiIconModel from './EmojiIconModel';

interface NodeById {
  id: FeatureType;
  model: new (attributes: FeatureAttributes) => FeatureModel;
}

class FeatureModelFactory {
  static modelById: Array<NodeById> = [
    {
      id: 'icon',
      model: SvgIconModel,
    },
    {
      id: 'eicon',
      model: EmojiIconModel,
    },
    {
      id: 'link',
      model: LinkModel,
    },
    {
      id: 'note',
      model: NoteModel,
    },
  ];

  static createModel<T extends FeatureType>(
    type: T,
    attributes: FeatureAttributes,
  ): FeatureByType[T] {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = FeatureModelFactory.modelById.filter((elem) => elem.id === type)[0];
    // modelById pairs each type with its model class.
    return new Model(attributes) as FeatureByType[T];
  }

  /**
   * @param id the feature metadata id
   * @return {Boolean} returns true if the given id is contained in the metadata array
   */
  static isSupported(type: string): type is FeatureType {
    return FeatureModelFactory.modelById.some((elem) => elem.id === type);
  }
}

export default FeatureModelFactory;
