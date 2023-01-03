/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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
import SvgIconModel from './model/SvgIconModel';
import LinkModel from './model/LinkModel';
import NoteModel from './model/NoteModel';
import Icon from './Icon';
import EmojiIconModel from './model/EmojiIconModel';

class TopicFeatureFactory {
  static createIcon(topic: Topic, model: FeatureModel, readOnly: boolean): Icon {
    let result: Icon;
    const featureType = model.getType();
    switch (featureType) {
      case 'icon':
        result = new SvgImageIcon(topic, model as SvgIconModel, readOnly);
        break;
      case 'eicon':
        result = new EmojiCharIcon(topic, model as EmojiIconModel, readOnly);
        break;
      case 'link':
        result = new LinkIcon(topic, model as LinkModel, readOnly);
        break;
      case 'note':
        result = new NoteIcon(topic, model as NoteModel, readOnly);
        break;
      default: {
        const exhaustiveCheck: never = featureType;
        throw new Error(`Unhandled feature type case: ${exhaustiveCheck}`);
      }
    }
    return result;
  }
}

export default TopicFeatureFactory;
