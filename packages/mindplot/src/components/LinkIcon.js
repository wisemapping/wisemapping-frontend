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
import { $assert } from '@wisemapping/core-js';
import $ from 'jquery';
import Icon from './Icon';
import LinkIconTooltip from './widget/LinkIconTooltip';

class LinkIcon extends Icon {
  constructor(topic, linkModel, readOnly) {
    $assert(topic, 'topic can not be null');
    $assert(linkModel, 'linkModel can not be null');

    super(LinkIcon.IMAGE_URL);
    this._linksModel = linkModel;
    this._topic = topic;
    this._readOnly = readOnly;

    this._registerEvents();
  }

  _registerEvents() {
    this._image.setCursor('pointer');
    this._tip = new LinkIconTooltip(this);

    const me = this;
    if (!this._readOnly) {
      // Add on click event to open the editor ...
      this.addEvent('click', (event) => {
        me._tip.hide();
        me._topic.showLinkEditor();
        event.stopPropagation();
      });
      // FIXME: we shouldn't have timeout of that..
      this.addEvent('mouseleave', (event) => {
        window.setTimeout(() => {
          if (!$('#linkPopover:hover').length) {
            me._tip.hide();
          }
          event.stopPropagation();
        }, 100);
      });
    }

    $(this.getImage().peer._native).mouseenter(() => {
      me._tip.show();
    });
  }

  getModel() {
    return this._linksModel;
  }
}
LinkIcon.IMAGE_URL = 'images/links.png';

export default LinkIcon;
