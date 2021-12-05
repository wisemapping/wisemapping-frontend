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
import $ from 'jquery';
import { $assert, $defined } from '@wisemapping/core-js';
import ToolbarPaneItem from './ToolbarPaneItem';

class ColorPalettePanel extends ToolbarPaneItem {
  constructor(buttonId, model, baseUrl) {
    super(buttonId, model);
    this._baseUrl = baseUrl;
    $assert($defined(baseUrl), 'baseUrl can not be null');
  }

  _load() {
    if (!ColorPalettePanel._panelContent) {
      // Load all the CSS styles ...
      $('<link>')
        .appendTo($('head'))
        .attr({ type: 'text/css', rel: 'stylesheet' })
        .attr('href', `${this._baseUrl}/colorPalette.css`);

      // Load panel html fragment ...
      let result;
      $.ajax({
        url: `${this._baseUrl}/colorPalette.html`,
        method: 'GET',
        async: false,
        success(responseText) {
          result = responseText;
        },
        error() {
          result = '<div>Sorry, your request failed :(</div>';
        },
      });

      ColorPalettePanel._panelContent = result;
    }
    return ColorPalettePanel._panelContent;
  }

  buildPanel() {
    const content = $('<div class="toolbarPanel"></div>').attr(
      'id',
      `${this._buttonId}colorPalette`,
    );
    content.html(this._load());

    // Register on toolbar elements ...
    const colorCells = content.find('div[class=palette-colorswatch]');
    const model = this.getModel();
    const me = this;
    colorCells.each((elem) => {
      $(elem).on('click', () => {
        const color = $(elem).css('background-color');
        model.setValue(color);
        me.hide();
      });
    });

    return content;
  }

  _updateSelectedItem() {
    const panelElem = this.getPanelElem();

    // Clear selected cell based on the color  ...
    panelElem
      .find("td[class='palette-cell palette-cell-selected']")
      .attr('class', 'palette-cell');

    // Mark the cell as selected ...
    const colorCells = panelElem.find('div[class=palette-colorswatch]');
    const model = this.getModel();
    let modelValue = model.getValue();
    colorCells.forEach((elem) => {
      const color = $(elem).css('background-color').rgbToHex();
      if (modelValue != null && modelValue[0] === 'r') {
        modelValue = modelValue.rgbToHex();
      }

      if (modelValue != null && modelValue.toUpperCase() === color.toUpperCase()) {
        $(elem).parent().attr('class', 'palette-cell palette-cell-selected');
      }
    });
    return panelElem;
  }
}

export default ColorPalettePanel;
