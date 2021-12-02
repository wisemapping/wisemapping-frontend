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
import ToolbarPaneItem from './ToolbarPaneItem';

const ListToolbarPanel = new Class({
  Extends: ToolbarPaneItem,
  initialize(buttonId, model) {
    this.parent(buttonId, model);
    this._initPanel();
  },

  _initPanel() {
    // Register on toolbar elements ...
    const me = this;
    this.getPanelElem().children('div').bind('click', function (event) {
      event.stopPropagation();
      me.hide();
      const value = $defined($(this).attr('model')) ? $(this).attr('model') : $(this).attr('id');
      me.getModel().setValue(value);
    });
  },

  _updateSelectedItem() {
    const panelElem = this.getPanelElem();
    const menuElems = panelElem.find('div');
    const value = this.getModel().getValue();
    _.each(menuElems, (elem) => {
      const elemValue = $defined($(elem).attr('model')) ? $(elem).attr('model') : $(elem).attr('id');
      $assert(elemValue, 'elemValue can not be null');
      if (elemValue == value) $(elem).attr('class', 'toolbarPanelLinkSelectedLink');
      else $(elem).attr('class', 'toolbarPanelLink');
    });
    return panelElem;
  },
});

export default ListToolbarPanel;
