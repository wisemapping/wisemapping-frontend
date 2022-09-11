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

import { $assert } from '@wisemapping/core-js';
import ImageIcon from './ImageIcon';
import LinkIcon from './LinkIcon';
import NoteIcon from './NoteIcon';

const TopicFeatureFactory = {
  /** the icon object */
  Icon: {
    id: 'icon',
    icon: ImageIcon,
  },

  /** the link object */
  Link: {
    id: 'link',
    icon: LinkIcon,
  },

  /** the note object */
  Note: {
    id: 'note',
    icon: NoteIcon,
  },

  createIcon(topic, model, readOnly) {
    $assert(topic, 'topic can not be null');
    $assert(model, 'model can not be null');

    const { icon: Icon } = TopicFeatureFactory._featuresMetadataById.filter(
      (elem) => elem.id === model.getType(),
    )[0];
    return new Icon(topic, model, readOnly);
  },
};

TopicFeatureFactory._featuresMetadataById = [
  TopicFeatureFactory.Icon,
  TopicFeatureFactory.Link,
  TopicFeatureFactory.Note,
];

export default TopicFeatureFactory;
