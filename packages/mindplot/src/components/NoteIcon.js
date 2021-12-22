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
import { $msg } from './Messages';
import Icon from './Icon';
import FloatingTip from './widget/FloatingTip';
import NotesImage from '../../assets/images/notes.png';

class NoteIcon extends Icon {
  constructor(topic, noteModel, readOnly) {
    $assert(topic, 'topic can not be null');

    super(NoteIcon.IMAGE_URL);
    this._linksModel = noteModel;
    this._topic = topic;
    this._readOnly = readOnly;

    this._registerEvents();
  }

  _registerEvents() {
    this._image.setCursor('pointer');
    const me = this;

    if (!this._readOnly) {
      // Add on click event to open the editor ...
      this.addEvent('click', (event) => {
        me._topic.showNoteEditor();
        event.stopPropagation();
      });
    }
    this._tip = new FloatingTip($(me.getImage().peer._native), {
      title: $msg('NOTE'),
      container: 'body',
      // Content can also be a function of the target element!
      content() {
        return me._buildTooltipContent();
      },
      html: true,
      placement: 'bottom',
      destroyOnExit: true,
    });
  }

  _buildTooltipContent() {
    if ($('body').find('#textPopoverNote').length === 1) {
      const text = $('body').find('#textPopoverNote');
      text.text(this._linksModel.getText());
      return text;
    }
    const result = $('<div id="textPopoverNote"></div>').css({ padding: '5px' });

    const text = $('<div></div>').text(this._linksModel.getText())
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
    result.append(text);
    return result;
  }

  getModel() {
    return this._linksModel;
  }
}

NoteIcon.IMAGE_URL = NotesImage;

export default NoteIcon;
