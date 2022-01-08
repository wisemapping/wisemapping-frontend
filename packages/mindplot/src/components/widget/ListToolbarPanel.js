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
import { $assert, $defined } from '@wisemapping/core-js';
import ToolbarPaneItem from './ToolbarPaneItem';

class ListToolbarPanel extends ToolbarPaneItem {
  constructor(buttonId, model) {
    super(buttonId, model);
    this._initPanel();
  }

  _initPanel() {
    // Register on toolbar elements ...
    this.getPanelElem().children('div').bind('click', (event) => {
      event.stopPropagation();
      this.hide();
      const value = $defined($(this).attr('model')) ? $(this).attr('model') : $(this).attr('id');
      this.getModel().setValue(value);
    });
  }

  _updateSelectedItem() {
    const panelElem = this.getPanelElem();
    const menuElems = panelElem.find('div');
    const value = this.getModel().getValue();
    menuElems.each((index, elem) => {
      const elemValue = $defined($(elem).attr('model')) ? $(elem).attr('model') : $(elem).attr('id');
      $assert(elemValue, 'elemValue can not be null');
      if (elemValue === value) $(elem).attr('class', 'toolbarPanelLinkSelectedLink');
      else $(elem).attr('class', 'toolbarPanelLink');
    });
    return panelElem;
  }
}

export default ListToolbarPanel;
