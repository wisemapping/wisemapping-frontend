/*
 *    Copyright [2015] [wisemapping]
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

/** */
const IconModel = require('./model/IconModel').default;
const ImageIcon = require('./ImageIcon').default;
const LinkModel = require('./model/LinkModel').default;
const LinkIcon = require('./LinkIcon').default;
const NoteModel = require('./model/NoteModel').default;
const NoteIcon = require('./NoteIcon').default;

const TopicFeature = {
    /** the icon object */
    Icon: {
        id: IconModel.FEATURE_TYPE,
        model: IconModel,
        icon: ImageIcon
    },

    /** the link object */
    Link: {
        id: LinkModel.FEATURE_TYPE,
        model: LinkModel,
        icon: LinkIcon
    },

    /** the note object */
    Note: {
        id: NoteModel.FEATURE_TYPE,
        model: NoteModel,
        icon: NoteIcon
    },

    /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
    isSupported: function (id) {
        return TopicFeature._featuresMetadataById.some(function (elem) {
            return elem.id == id;
        });
    },

    /**
     * @param type
     * @param attributes
     * @throws will throw an error if type is null or undefined
     * @throws will throw an error if attributes is null or undefined
     * @return {mindplot.model.FeatureModel} a new instance of the feature model subclass matching
     * the topic feature
     */
    createModel: function (type, attributes) {
        $assert(type, 'type can not be null');
        $assert(attributes, 'attributes can not be null');

        var model = TopicFeature._featuresMetadataById.filter(function (elem) {
            return elem.id == type;
        })[0].model;
        return new model(attributes);
    },

    /**
     * @param {mindplot.Topic} topic
     * @param {mindplot.model.FeatureModel} model
     * @param {Boolean} readOnly true if the editor is running in read-only mode
     * @throws will throw an error if topic is null or undefined
     * @throws will throw an error if model is null or undefined
     * @return {mindplot.Icon} a new instance of the icon subclass matching the topic feature
     */
    createIcon: function (topic, model, readOnly) {
        $assert(topic, 'topic can not be null');
        $assert(model, 'model can not be null');

        var icon = TopicFeature._featuresMetadataById.filter(function (elem) {
            return elem.id == model.getType();
        })[0].icon;
        return new icon(topic, model, readOnly);
    }
};

TopicFeature._featuresMetadataById = [TopicFeature.Icon, TopicFeature.Link, TopicFeature.Note];

export default TopicFeature;
