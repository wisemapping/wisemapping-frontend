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

import EmojiCharIcon from './EmojiCharIcon';
import SvgImageIcon from './SvgImageIcon';
import LinkIcon from './LinkIcon';
import NoteIcon from './NoteIcon';
import type FeatureModel from './model/FeatureModel';
import type FeatureType from './model/FeatureType';
import type { FeatureByType } from './model/FeatureType';
import type Topic from './Topic';
import type Icon from './Icon';

type IconBuilder<T extends FeatureType> = (
  topic: Topic,
  model: FeatureByType[T],
  readOnly: boolean,
) => Icon;

/**
 * The icon of each feature type. Keyed by every FeatureType, so a type added without its icon
 * does not compile, as the `never` default of the former switch did not.
 */
export type IconBuilders = { [T in FeatureType]: IconBuilder<T> };

const ICON_BUILDERS: IconBuilders = {
  icon: (topic, model, readOnly) => new SvgImageIcon(topic, model, readOnly),
  eicon: (topic, model, readOnly) => new EmojiCharIcon(topic, model, readOnly),
  link: (topic, model, readOnly) => new LinkIcon(topic, model, readOnly),
  note: (topic, model, readOnly) => new NoteIcon(topic, model, readOnly),
};

const createIconOfType = <T extends FeatureType>(
  type: T,
  topic: Topic,
  model: FeatureModel,
  readOnly: boolean,
): Icon => {
  // A type read from somewhere untyped may have no icon: say so rather than call undefined.
  if (!model.isOfType(type) || !Object.hasOwn(ICON_BUILDERS, type)) {
    throw new Error(`Unhandled feature type case: ${model.getType()}`);
  }
  const build: IconBuilder<T> = ICON_BUILDERS[type];
  return build(topic, model, readOnly);
};

class TopicFeatureFactory {
  static createIcon(topic: Topic, model: FeatureModel, readOnly: boolean): Icon {
    return createIconOfType(model.getType(), topic, model, readOnly);
  }
}

export default TopicFeatureFactory;
