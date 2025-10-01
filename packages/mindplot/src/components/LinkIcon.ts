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
import { $assert } from '@wisemapping/core-js';
import ImageIcon from './ImageIcon';
import LinksImage from '../../assets/icons/links.svg';
import LinkModel from './model/LinkModel';
import Topic from './Topic';
import FeatureModel from './model/FeatureModel';
import ActionDispatcher from './ActionDispatcher';

class LinkIcon extends ImageIcon {
  private _linksModel: LinkModel;

  private _topic: Topic;

  private _readOnly: boolean;

  constructor(topic: Topic, linkModel: LinkModel, readOnly: boolean) {
    $assert(topic, 'topic can not be null');
    $assert(linkModel, 'linkModel can not be null');

    super(LinkIcon.IMAGE_URL);
    this._linksModel = linkModel;
    this._topic = topic;
    this._readOnly = readOnly;

    this._registerEvents();
  }

  private _registerEvents() {
    this.getElement().setCursor('pointer');
    const topic = this._topic;

    // Hover tooltip ...
    const wm = designer.getWidgeManager();
    wm.createTooltipForLink(this._topic, this._linksModel, this);

    if (!this._readOnly) {
      this.getElement().addEvent('click', (evt) => {
        designer.fireEvent('featureEdit', { event: 'link', topic });
        evt.stopPropagation();
      });
    }
  }

  getModel(): FeatureModel {
    return this._linksModel;
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._linksModel.getId();
    actionDispatcher.removeFeatureFromTopic(this._topic.getId(), featureId);
  }

  static IMAGE_URL = LinksImage;
}

export default LinkIcon;
