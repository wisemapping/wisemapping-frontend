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
import $ from 'jquery';
import { $assert } from '@wisemapping/core-js';
import Events from './Events';

class ToolbarItem extends Events {
  constructor(buttonId, fn, options) {
    $assert(buttonId, 'buttonId can not be null');
    super();
    this._buttonId = buttonId;
    this._options = options;
    if (fn) {
      this.setEventHandler(fn);
    }
  }

  setEventHandler(fn) {
    $assert(fn, 'fn can not be null');
    this._fn = fn;
    this._enable = false;
    this.enable();
  }

  getButtonElem() {
    const elem = $(`#${this._buttonId}`);
    $assert(elem, `Could not find element for ${this._buttonId}`);
    return elem;
  }

  show() {
    this.fireEvent('show');
  }

  hide() {
    this.fireEvent('hide');
  }

  isTopicAction() {
    return this._options.topicAction;
  }

  isRelAction() {
    return this._options.relAction;
  }

  disable() {
    const elem = this.getButtonElem();
    if (this._enable) {
      elem.unbind('click', this._fn);
      elem.removeClass('buttonOn');
      elem.addClass('buttonOff');
      this._enable = false;
    }
  }

  enable() {
    const elem = this.getButtonElem();
    if (!this._enable) {
      elem.bind('click', this._fn);
      elem.removeClass('buttonOff');
      elem.addClass('buttonOn');
      this._enable = true;
    }
  }

  getTip() {
    return this._tip;
  }
}

export default ToolbarItem;
