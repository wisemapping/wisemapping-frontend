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
import ToolbarItem from './ToolbarItem';
import FloatingTip from '../bootstrap/FloatingTip';

class ToolbarPaneItem extends ToolbarItem {
  constructor(buttonId, model, delayInit) {
    $assert(buttonId, 'buttonId can not be null');
    $assert(model, 'model can not be null');
    super(buttonId, null, { topicAction: true, relAction: false });

    const handler = () => (this.isVisible() ? this.hide() : this.show());
    this.setEventHandler(handler);
    this._model = model;
    if (!delayInit) {
      this._panelElem = this._init();
    }
    this._visible = false;
  }

  _init() {
    // Load the context of the panel ...
    const panelElem = this.buildPanel();
    panelElem.css('cursor', 'default');
    const buttonElem = this.getButtonElem();

    const me = this;
    this._tip = new FloatingTip(buttonElem, {
      html: true,
      placement: 'bottom',
      content() {
        return me._updateSelectedItem();
      },
      className: 'toolbarPaneTip',
      trigger: 'manual',
      template:
        '<div class="popover" role="tooltip"><div class="arrow arrowGray"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    });

    this._tip.addEvent('hide', () => {
      me._visible = false;
    });

    this._tip.addEvent('show', () => {
      me._visible = true;
    });

    return panelElem;
  }

  getModel() {
    return this._model;
  }

  getPanelElem() {
    return this._panelElem;
  }

  show() {
    if (!this.isVisible()) {
      super.show();
      this._tip.show();
      this.getButtonElem().get(0).className = 'buttonExtActive';
    }
  }

  hide() {
    if (this.isVisible()) {
      super.hide();
      this._tip.hide();
      this.getButtonElem().get(0).className = 'buttonExtOn';
    }
  }

  isVisible() {
    return this._visible;
  }

  disable() {
    this.hide();
    const elem = this.getButtonElem();
    if (this._enable) {
      elem.unbind('click', this._fn);
      elem.removeClass('buttonExtOn');

      // Todo: Hack...
      elem.removeClass('buttonOn');

      elem.addClass('buttonExtOff');
      this._enable = false;
    }
  }

  enable() {
    const elem = this.getButtonElem();
    if (!this._enable) {
      elem.bind('click', this._fn);
      elem.removeClass('buttonExtOff');
      elem.addClass('buttonExtOn');
      this._enable = true;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    throw new Error('Method must be implemented');
  }
}

export default ToolbarPaneItem;
