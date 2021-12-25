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
import IconModel from './model/IconModel';
import ImageIcon from './ImageIcon';
import LinkModel from './model/LinkModel';
import LinkIcon from './LinkIcon';
import NoteModel from './model/NoteModel';
import NoteIcon from './NoteIcon';

const TopicFeature = {
  /** the icon object */
  Icon: {
    id: IconModel.FEATURE_TYPE,
    model: IconModel,
    icon: ImageIcon,
  },

  /** the link object */
  Link: {
    id: LinkModel.FEATURE_TYPE,
    model: LinkModel,
    icon: LinkIcon,
  },

  /** the note object */
  Note: {
    id: NoteModel.FEATURE_TYPE,
    model: NoteModel,
    icon: NoteIcon,
  },

  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  isSupported(id) {
    return TopicFeature._featuresMetadataById.some((elem) => elem.id === id);
  },

  /**
     * @param type
     * @param attributes
     * @throws will throw an error if type is null or undefined
     * @throws will throw an error if attributes is null or undefined
     * @return {mindplot.model.FeatureModel} a new instance of the feature model subclass matching
     * the topic feature
     */
  createModel(type, attributes) {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = TopicFeature._featuresMetadataById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  },

  /**
     * @param {mindplot.Topic} topic
     * @param {mindplot.model.FeatureModel} model
     * @param {Boolean} readOnly true if the editor is running in read-only mode
     * @throws will throw an error if topic is null or undefined
     * @throws will throw an error if model is null or undefined
     * @return {mindplot.Icon} a new instance of the icon subclass matching the topic feature
     */
  createIcon(topic, model, readOnly) {
    $assert(topic, 'topic can not be null');
    $assert(model, 'model can not be null');

    const { icon: Icon } = TopicFeature._featuresMetadataById
      .filter((elem) => elem.id === model.getType())[0];
    return new Icon(topic, model, readOnly);
  },
};

TopicFeature._featuresMetadataById = [TopicFeature.Icon, TopicFeature.Link, TopicFeature.Note];

export default TopicFeature;
