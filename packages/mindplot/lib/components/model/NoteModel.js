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
const FeatureModel = require('./FeatureModel').default

const NoteModel = new Class(/** @lends NoteModel */{
    Extends:FeatureModel,
    /**
     * @constructs
     * @param attributes
     * @extends mindplot.model.FeatureModel
     */
    initialize:function (attributes) {
        this.parent(NoteModel.FEATURE_TYPE);
        var noteText = attributes.text ? attributes.text : " ";
        this.setText(noteText);
    },

    /** */
    getText:function () {
        return this.getAttribute('text');
    },

    /** */
    setText:function (text) {
        $assert(text, 'text can not be null');
        this.setAttribute('text', text);
    }
});

/**
 * @constant
 * @type {String}
 * @default
 */
NoteModel.FEATURE_TYPE = "note";

export default NoteModel;