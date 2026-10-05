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
import FeatureModel from './model/FeatureModel';
import Topic from './Topic';
import Icon from './Icon';

class TopicFeatureFactory {
  static createIcon(topic: Topic, model: FeatureModel, readOnly: boolean): Icon {
    if (model.isOfType('icon')) {
      return new SvgImageIcon(topic, model, readOnly);
    }
    if (model.isOfType('eicon')) {
      return new EmojiCharIcon(topic, model, readOnly);
    }
    if (model.isOfType('link')) {
      return new LinkIcon(topic, model, readOnly);
    }
    if (model.isOfType('note')) {
      return new NoteIcon(topic, model, readOnly);
    }
    throw new Error(`Unhandled feature type case: ${model.getType()}`);
  }
}

export default TopicFeatureFactory;
