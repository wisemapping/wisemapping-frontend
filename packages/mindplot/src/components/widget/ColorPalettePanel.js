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
import { buildHtml, css } from './ColorPaletteHtml';

// rgbToHex implementation from https://stackoverflow.com/a/3627747/58128
export const rgb2hex = (rgb) => `#${
  rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    .slice(1)
    .map((n) => parseInt(n, 10)
      .toString(16).padStart(2, '0')).join('')}`;

class ColorPalettePanel extends ToolbarPaneItem {
  constructor(buttonId, model, baseUrl) {
    $assert($defined(baseUrl), 'baseUrl can not be null');
    super(buttonId, model, true);
    this._baseUrl = baseUrl;
    this._panelElem = super._init();
  }

  _load() {
    if (!ColorPalettePanel._panelContent) {
      // Load all the CSS styles ...
      $('<style>')
        .append(css)
        .appendTo($('head'))
        .attr({ type: 'text/css' });

      ColorPalettePanel._panelContent = buildHtml();
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
    colorCells.each((index, elem) => {
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
    colorCells.each((index, elem) => {
      const color = rgb2hex($(elem).css('background-color'));
      if (modelValue != null && modelValue[0] === 'r') {
        modelValue = rgb2hex(modelValue);
      }

      if (modelValue != null && modelValue.toUpperCase() === color.toUpperCase()) {
        $(elem).parent().attr('class', 'palette-cell palette-cell-selected');
      }
    });
    return panelElem;
  }
}

export default ColorPalettePanel;
